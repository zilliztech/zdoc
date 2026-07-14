---
title: "load | Cloud"
slug: /cli/cli/Collection-load
sidebar_label: "load"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、検索のためにコレクションをメモリにロードします。 | Cloud"
type: docx
token: SOaOdH3o6o7dsyx1VjPc4LPynqc
sidebar_position: 10
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - load
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# load

この操作は、検索のためにコレクションをメモリにロードします。

## Synopsis\{#synopsis}

```bash
zilliz collection load
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[必須]**

    コレクション名を示します。

- **--database** (*string*) -

    データベース名を示します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションが未設定であれば、それが属するデータベースが自動的に適用されます。

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
zilliz collection load --name my_collection
```
