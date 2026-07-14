---
title: "list | Cloud"
slug: /cli/cli/Database-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はすべてのデータベースを一覧表示します。 | Cloud"
type: docx
token: KiwWdLJ8houEeRxGECEcc3glnoh
sidebar_position: 4
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
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

この操作はすべてのデータベースを一覧表示します。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated clusters に適用されます。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz database list
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## オプション\{#options}

- **--output, -o** (*string*) -

    出力形式を指定します。使用可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## 例\{#example}

```bash
zilliz database list
```
