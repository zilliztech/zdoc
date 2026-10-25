---
title: "list | Cloud"
slug: /cli/cli/History-list
sidebar_label: "list"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ローカルの履歴ログに記録された最近のコマンドを新しい順に一覧表示します。各エントリには、タイムスタンプ、コマンドライン、コマンドタイプ、成功フラグが含まれます。 | Cloud"
type: docx
token: JsXAdb04GodEnVxihb5csm28nze
sidebar_position: 2
keywords: 
  - 階層型ナビゲーブルスモールワールド
  - 高密度埋め込み
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

この操作は、ローカルの履歴ログに記録された最近のコマンドを新しい順に一覧表示します。各エントリには、タイムスタンプ、コマンドライン、コマンドタイプ、成功フラグが含まれます。

## Synopsis\{#synopsis}

```bash
zilliz history list
[--limit <integer>]
[--all]
```

## Options\{#options}

- **--limit** (*integer*) -

    表示するエントリの最大数を示します。デフォルト: 50。`--all` が設定されている場合は無視されます。

- **--all** (*boolean*) -

    最新の `--limit` 件のエントリではなく、記録されたすべてのエントリを表示します。

## Example\{#example}

```bash
# Last 50 entries
zilliz history list

# Last 10 entries as JSON
zilliz history list --limit 10 -o json

# Full history
zilliz history list --all
```
