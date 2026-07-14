---
title: "list | Cloud"
slug: /cli/cli/Role-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はすべてのロールを一覧表示します。 | Cloud"
type: docx
token: BNH0dujcioUq4Px0EmncEqlOnVe
sidebar_position: 5
keywords: 
  - vector db とは
  - vector databases とは
  - vector databases comparison
  - Faiss
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

この操作はすべてのロールを一覧表示します。

<Admonition type="info" icon="📘" title="Notes">

このコマンドは Dedicated クラスターでのみ使用できます。`zilliz context set` を実行してクラスターを切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role list
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

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

- **--database** (*string*) -

    データベース名を示します。デフォルト値は `default` です。

## Example\{#example}

```bash
zilliz role list
```
