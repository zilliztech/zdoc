---
title: "get-stats | Cloud"
slug: /cli/cli/Collection-getstats
sidebar_label: "get-stats"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection の統計情報（行数など）を取得します。 | Cloud"
type: docx
token: XTHTd7x3soBmeTx9ftwc369PnCe
sidebar_position: 7
keywords: 
  - Vector index
  - オープンソース vector database
  - オープンソース vector db
  - vector database の例
  - zilliz
  - zilliz cloud
  - cloud
  - get-stats
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# get-stats

この操作は collection の統計情報（行数など）を取得します。

## Synopsis\{#synopsis}

```bash
zilliz collection get-stats
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--partition-names <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    collection 名を指定します。

- **--database** (*string*) -

    database 名を指定します。

    `zilliz context set` を使用して cluster が設定されている場合、このオプションを設定しなくても、それが属する database が自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## Example\{#example}

```bash
zilliz collection get-stats --name my_collection
```
