---
title: "list | Cloud"
slug: /cli/cli/Import-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クラスターのインポートジョブを一覧表示します。 | Cloud"
type: docx
token: ObdhdVWTpogXQhx3A0YcdU2yntd
sidebar_position: 1
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

この操作は、クラスターのインポートジョブを一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz import list
--cluster-id <value>
[--page-size <value>]
[--page <size>]
[--database <value>]
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    `inxx-xxxxx` に似たクラスター ID を示します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションが未設定であれば自動的に適用されます。

- **--page-size** (*integer*) -

    1 ページあたりの項目数を示します。デフォルト値は **10** です。

- **--page** (*integer*) -

    現在のページ番号を示します。デフォルト値は **1** です。

- **--database** (*string*) -

    指定されたクラスター内のデータベース名を示します。

    `zilliz context set` を使用してデータベースが設定されている場合、このオプションが未設定であれば自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

## Example\{#example}

```bash
zilliz import list --cluster-id in01-xxxxxxxxxxxx
```
