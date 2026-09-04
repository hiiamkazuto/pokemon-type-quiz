#!/usr/bin/env bash
# HITL（ヒューマンインザループ）再現ループ。
# このファイルをコピーし、以下の手順を編集して実行してください。
# エージェントがスクリプトを実行し、ユーザーがターミナルのプロンプトに従って操作します。
#
# 使用方法:
#   bash hitl-loop.template.sh
#
# 2つのヘルパー関数:
#   step "<指示内容>"             → 指示を表示し、Enterキーの入力を待機
#   capture 変数名 "<質問内容>"   → 質問を表示し、回答を変数に代入
#
# スクリプト終了時、収集した値が KEY=VALUE 形式で出力され、エージェントが結果をパースします。
#
# `capture` は値をターミナルに出力しエージェントがそれを読み取るため、
# 観察結果の記録には `capture` を使い、サインイン等の操作手順には `step` を使用してください。

set -euo pipefail

step() {
  printf '\n>>> %s\n' "$1"
  read -r -p "    [完了したらEnterを押してください] " _
}

capture() {
  local var="$1" question="$2" answer
  printf '\n>>> %s\n' "$question"
  read -r -p "    > " answer
  printf -v "$var" '%s' "$answer"
}

# --- ここから下を編集 ----------------------------------------------------

step "http://localhost:3000 でアプリを開き、サインインしてください。"

capture ERRORED "「エクスポート」ボタンをクリックしてください。エラーが発生しましたか？ (y/n)"

capture ERROR_MSG "エラーメッセージを貼り付けてください（ない場合は 'none'）:"

# --- ここまでを編集 ------------------------------------------------------

printf '\n--- 収集結果 ---\n'
printf 'ERRORED=%s\n' "$ERRORED"
printf 'ERROR_MSG=%s\n' "$ERROR_MSG"
