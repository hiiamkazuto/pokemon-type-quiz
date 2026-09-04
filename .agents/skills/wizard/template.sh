#!/usr/bin/env bash
#
# ウィザード — 手動の作業手順をステップバイステップで案内するスクリプト。
# /wizard スキルによって生成されます。
#
# "STAGES" マーカーより上の部分はすべてウィザードの共通ライブラリです。
# 手動編集は行わず、マーカーより下の各ステップのステージを記述してください。

set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────
# ウィザードライブラリ — 一貫したUXを提供。すべてのウィザードで共通。
# ──────────────────────────────────────────────────────────────────────────

if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && [[ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]]; then
  BOLD=$(tput bold); DIM=$(tput dim); RESET=$(tput sgr0)
  BLUE=$(tput setaf 4); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3); RED=$(tput setaf 1)
else
  BOLD=""; DIM=""; RESET=""; BLUE=""; GREEN=""; YELLOW=""; RED=""
fi

# ステージセクションの先頭で作成者が設定します。
TOTAL_STAGES=0

_STAGE_INDEX=0
ENV_FILE="${ENV_FILE:-.env}"
WRITTEN_ENV=()    # 今回の実行で ENV_FILE に書き込まれたキー一覧
WRITTEN_SECRET=() # 今回の実行で設定されたシークレット名一覧
SKIPPED=()        # 実行できなかった項目（例: ghコマンド未導入など）

# _clear — ターミナルをクリアして現在のステップのみを表示。
# 出力がターミナルでない場合は何もしないため、パイプでのログ出力時も可読性を維持。
_clear() {
  [[ -t 1 ]] || return 0
  if command -v tput >/dev/null 2>&1; then tput clear; else printf '\033[2J\033[3J\033[H'; fi
}

# banner "タイトル" — 開始フレーム: このウィザードが何を行うかを表示。
banner() {
  _clear
  printf '\n%s%s  %s%s\n' "$BOLD" "$BLUE" "$1" "$RESET"
  printf '%s  全 %s ステージ%s\n\n' "$DIM" "$TOTAL_STAGES" "$RESET"
  printf '%s  ブラウザで操作を行ってください。このウィザードが手順を案内し、\n' "$DIM"
  printf '  コピーした値を受け取って保存します。Ctrl-C でいつでも中断でき、\n'
  printf '  保存済みの値を保持したまま後から再開できます。%s\n' "$RESET"
  pause "開始する準備はできましたか？"
}

# stage "名前" — 画面をクリアし、ステージ名と進捗を表示。
# 画面をクリアすることで、現在のステップのみに集中できるようにします。
stage() {
  _clear
  _STAGE_INDEX=$((_STAGE_INDEX + 1))
  printf '\n%s%s▸ ステージ %s/%s · %s%s\n' \
    "$BOLD" "$BLUE" "$_STAGE_INDEX" "$TOTAL_STAGES" "$1" "$RESET"
}

# say "..." — 通常の指示文行。
say()  { printf '  %s\n' "$1"; }
# step "..." — ブラウザで人間が実行する具体的なアクション。
step() { printf '  %s•%s %s\n' "$BLUE" "$RESET" "$1"; }
note() { printf '  %s%s%s\n' "$DIM" "$1" "$RESET"; }
warn() { printf '  %s⚠ %s%s\n' "$YELLOW" "$1" "$RESET"; }

# open_url URL — ブラウザでURLを開く（WSLを含むクロスプラットフォーム対応）。
open_url() {
  local url="$1"
  printf '  %s↗ 開いています%s %s\n' "$GREEN" "$RESET" "$url"
  { if   command -v wslview     >/dev/null 2>&1; then wslview "$url"
    elif command -v explorer.exe >/dev/null 2>&1; then explorer.exe "$url"
    elif command -v xdg-open    >/dev/null 2>&1; then xdg-open "$url"
    elif command -v open        >/dev/null 2>&1; then open "$url"
    else warn "ブラウザを開けませんでした。手動でアクセスしてください: $url"; fi
  } >/dev/null 2>&1 || warn "ブラウザを開けませんでした。手動でアクセスしてください: $url"
}

# pause "メッセージ" — 人間が手動操作を完了するのを待機。
pause() {
  printf '  %s%s%s ' "$DIM" "${1:-Enterキーを押して続行}" "$RESET"
  read -r _ || true
}

# confirm "質問文" — y/N による確認ゲート。Yesの場合に正常終了（0）を返す。
confirm() {
  local reply=""
  printf '  %s? %s [y/N] ' "$YELLOW" "$1"
  read -r reply || true
  [[ "$reply" =~ ^[Yy] ]]
}

# _existing KEY — ENV_FILE 内にある KEY の現在の値を取得（存在する場合）。
_existing() {
  [[ -f "$ENV_FILE" ]] || return 1
  local line; line=$(grep -E "^${1}=" "$ENV_FILE" | tail -n1) || return 1
  printf '%s' "${line#*=}"
}

# ask KEY "プロンプト" — $KEY に値を読み込む。再実行時は既存の .env の値をデフォルトとして提示（Enterで維持）。公開値用。
ask() {
  local key="$1" prompt="$2" current input
  current=$(_existing "$key" || true)
  if [[ -n "$current" ]]; then
    printf '  %s%s%s %s[Enterで現在の値を維持]%s ' "$BOLD" "$prompt" "$RESET" "$DIM" "$RESET"
  else
    printf '  %s%s%s ' "$BOLD" "$prompt" "$RESET"
  fi
  read -r input || true
  [[ -z "$input" && -n "$current" ]] && input="$current"
  printf -v "$key" '%s' "$input"
}

# ask_secret KEY "プロンプト" — askと同様だが、入力文字を非表示にする。機密情報用。
ask_secret() {
  local key="$1" prompt="$2" current input
  current=$(_existing "$key" || true)
  if [[ -n "$current" ]]; then
    printf '  %s%s%s %s[Enterで現在の値を維持]%s ' "$BOLD" "$prompt" "$RESET" "$DIM" "$RESET"
  else
    printf '  %s%s%s ' "$BOLD" "$prompt" "$RESET"
  fi
  read -rs input || true
  printf '\n'
  [[ -z "$input" && -n "$current" ]] && input="$current"
  printf -v "$key" '%s' "$input"
}

# write_env KEY VALUE — ENV_FILE に KEY=VALUE を書き込み/更新（ファイルがなければ作成、既存行は置換）。べき等。
write_env() {
  local key="$1" value="$2" tmp
  touch "$ENV_FILE"
  tmp=$(mktemp)
  grep -vE "^${key}=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$key" "$value" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
  WRITTEN_ENV+=("$key")
  printf '  %s✓ 保存しました%s %s → %s\n' "$GREEN" "$RESET" "$key" "$ENV_FILE"
}

# set_secret NAME VALUE — ghコマンドを使用してGitHub Actionsのリポジトリシークレットを設定。
# ghが使えない、または未認証の場合は警告を出して記録。
set_secret() {
  local name="$1" value="$2"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    if printf '%s' "$value" | gh secret set "$name" >/dev/null 2>&1; then
      WRITTEN_SECRET+=("$name")
      printf '  %s✓ 設定しました%s GitHub secret %s\n' "$GREEN" "$RESET" "$name"
      return
    fi
  fi
  SKIPPED+=("GitHub secret $name (手動で設定してください: gh secret set $name)")
  warn "GitHub secret $name をスキップしました（ghコマンドが未準備です。後で設定してください）"
}

# set_var NAME VALUE — GitHub Actionsのリポジトリ変数（非シークレット）を設定。
set_var() {
  local name="$1" value="$2"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    if gh variable set "$name" --body "$value" >/dev/null 2>&1; then
      printf '  %s✓ 設定しました%s GitHub variable %s\n' "$GREEN" "$RESET" "$name"
      return
    fi
  fi
  SKIPPED+=("GitHub variable $name")
  warn "GitHub variable $name をスキップしました（ghコマンドが未準備です。後で設定してください）"
}

# finish — 画面をクリアし、設定されたすべての項目のサマリーを表示。
finish() {
  _clear
  printf '\n%s%s  ✓ セットアップが完了しました%s\n' "$BOLD" "$GREEN" "$RESET"
  (( ${#WRITTEN_ENV[@]} ))    && note "$ENV_FILE に ${#WRITTEN_ENV[@]} 個の値を書き込みました: ${WRITTEN_ENV[*]}"
  (( ${#WRITTEN_SECRET[@]} )) && note "${#WRITTEN_SECRET[@]} 個のGitHub secretを設定しました: ${WRITTEN_SECRET[*]}"
  if (( ${#SKIPPED[@]} )); then
    printf '\n'; warn "手動での対応が必要な項目:"
    for s in "${SKIPPED[@]}"; do note "  - $s"; done
  fi
  printf '\n'
}

# ──────────────────────────────────────────────────────────────────────────
# STAGES — このセクションを記述してください。人間が行うステップごとに stage() を1つ配置します。
# 以下のサンプルを実際の手順に置き換えてください。TOTAL_STAGES には記述したステージ数を指定します。
# ──────────────────────────────────────────────────────────────────────────

TOTAL_STAGES=1

banner "Stripeのセットアップ"

# ── サンプルステージ: 実際の手順に置き換えてください ────────────────────────
stage "Stripe — APIキー"
say "Stripeのテスト用キーを取得し、ローカル開発環境とCI用に保存します。"
open_url "https://dashboard.stripe.com/test/apikeys"
step "APIキーのページで、公開可能キー（pk_test_ で始まる文字列）をコピーしてください。"
ask STRIPE_PUBLISHABLE_KEY "公開可能キーを貼り付けてください:"
step "シークレットキーの行にある「テスト用キーを表示」をクリックしてコピーしてください。"
ask_secret STRIPE_SECRET_KEY "シークレットキーを貼り付けてください:"
write_env STRIPE_PUBLISHABLE_KEY "$STRIPE_PUBLISHABLE_KEY"
write_env STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
set_secret STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"   # CIで必要なキー
# ──────────────────────────────────────────────────────────────────────────

finish
