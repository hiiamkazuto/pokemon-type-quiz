# Issueトラッカー：GitHub

このリポジトリのIssueおよび仕様はGitHub Issuesとして管理されます。すべての操作には `gh` コマンドを使用してください。

## 規約

- **Issueの作成**: `gh issue create --title "..." --body "..."`。複数行の本文にはヒアドキュメントを使用してください。
- **Issueの閲覧**: `gh issue view <number> --comments`。コメントを `jq` でフィルタリングし、ラベルも取得します。
- **Issueの一覧取得**: 適切な `--label` および `--state` フィルタを付けた `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`。
- **Issueへのコメント**: `gh issue comment <number> --body "..."`
- **ラベルの付与 / 削除**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **クローズ**: `gh issue close <number> --comment "..."`

リポジトリは `git remote -v` から推測します（クローン内で実行した場合、`gh` が自動で行います）。

## トリアージ対象としてのプルリクエスト

**PRをリクエスト対象とするか: no** _（このリポジトリで外部PRを機能リクエストとして扱う場合は `yes` に設定してください。`/triage` がこのフラグを読み込みます）_

`yes` に設定されている場合、PRはIssueと同等の `gh pr` コマンドを使用して、Issueと同じラベルとステータスで処理されます：

- **PRの閲覧**: `gh pr view <number> --comments`、および差分取得のための `gh pr diff <number>`。
- **トリアージ対象の外部PR一覧取得**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` を実行し、`authorAssociation` が `CONTRIBUTOR`、`FIRST_TIME_CONTRIBUTOR`、または `NONE` のものだけを残します（`OWNER`/`MEMBER`/`COLLABORATOR` は除外）。
- **コメント / ラベル / クローズ**: `gh pr comment`、`gh pr edit --add-label`/`--remove-label`、`gh pr close`。

GitHubはIssueとPRで同一の番号体系を共有しているため、単なる `#42` はどちらの可能性もあります。`gh pr view 42` で解決を試み、失敗した場合は `gh issue view 42` にフォールバックしてください。

## スキルが「Issueトラッカーに公開する」と指示した場合

GitHub Issueを作成してください。

## スキルが「関連チケットを取得する」と指示した場合

`gh issue view <number> --comments` を実行してください。

## 八咫烏の運用

`/yatagarasu` で使用されます。**マップ**は単一のIssueであり、**子**Issueが各チケットとなります。

- **マップ**: `yatagarasu:map` というラベルが付いた単一のIssueであり、本文に「メモ」「これまでの決定事項」「不確実な領域」を保持します。作成コマンド: `gh issue create --label yatagarasu:map`。
- **子チケット**: マップにGitHubサブIssueとしてリンクされたIssue（サブIssueのエンドポイントに対する `gh api` を使用）。サブIssueが有効でない場合は、マップ本文のタスクリストに子を追加し、子本文の先頭に `Part of #<map>` を記載します。ラベル: `yatagarasu:<type>`（`research`/`prototype`/`grill`/`task`）。担当者が確定したら、主導する開発者にチケットを割り当てます。
- **依存関係**: GitHubの**ネイティブのIssue依存関係** — UI上に表示される標準の表現形式。`gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` で依存関係を追加します。ここで `<blocker-db-id>` はブロッカーの数値形式の**データベースID**です（`#番号` や `node_id` ではなく、`gh api repos/<owner>/<repo>/issues/<n> --jq .id` で取得）。GitHubは `issue_dependencies_summary.blocked_by`（オープン状態のブロッカーのみ — 現在のゲート）を報告します。依存関係機能が利用できない場合は、子本文の先頭に `Blocked by: #<n>, #<n>` 行を追加する方法にフォールバックします。すべてのブロッカーがクローズされると、チケットのブロックが解除されます。
- **フロンティアの問い合わせ**: マップのオープンな子Issueを一覧取得し（マップのサブIssue / タスクリストに対象を絞った `gh issue list --state open`）、オープンなブロッカーがあるもの（`issue_dependencies_summary.blocked_by > 0`、または `Blocked by` 行にオープンなIssueが含まれるもの）や担当者が割り当てられているものを除外します。マップ内の順序で最初のものが優先されます。
- **担当への着手**: `gh issue edit <n> --add-assignee @me` — セッションの最初の書き込み操作。
- **解決**: `gh issue comment <n> --body "<answer>"` を実行し、次に `gh issue close <n>` を実行します。その後、マップの「これまでの決定事項」にコンテキストへのポインタ（要約とリンク）を追記します。
