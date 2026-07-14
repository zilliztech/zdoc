---
title: "query | Cloud"
slug: /cli/cli/Vector-query
sidebar_label: "query"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スカラー フィルター式によってエンティティをクエリします。 | Cloud"
type: docx
token: VSRhdmsCvodJ7pxwGgqcuvZ3n7g
sidebar_position: 5
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - cloud
  - query
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# query

この操作は、スカラー フィルター式によってエンティティをクエリします。

## Description\{#description}

Zilliz Cloud は、ニーズに合ったフィルター式を構築するのに役立つ一連の便利なフィルタリング演算子を提供しています。詳細については、[Filtering Overview](/docs/filtering-overview) および関連ページを参照してください。

## Synopsis\{#synopsis}

```bash
zilliz vector query
--collection <value>
--filter <value>
[--limit <value>]
[--database <value>]
[--partition <value>]
[--offset <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    コレクション名を示します。

- **--filter** (*string*) -

    **[REQUIRED]**

    スカラー フィルター式を示します。

- **--limit** (*integer*) -

    返される結果の最大数を示します。 

    デフォルト値は **10** で、`offset` との積は **16,384** 未満である必要があります。

- **--output-fields** (*array*) -

    JSON 配列として返すフィールドを示します。

- **--database** (*string*) -

    データベース名を示します。

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

- **--offset** (*integer*) -

    一致結果を返す前にスキップする結果数を示します。`--limit` とともにページネーションに使用されます。

    `limit` との積は **16,384** 未満である必要があります。

- **--partition, -p** (*array*) -

    クエリ対象とするパーティション名のリストを示します。指定しない場合は、すべてのパーティションをクエリします。

## Example\{#example}

```bash
zilliz vector query --collection my_col --filter 'id > 100' --limit 10
```
