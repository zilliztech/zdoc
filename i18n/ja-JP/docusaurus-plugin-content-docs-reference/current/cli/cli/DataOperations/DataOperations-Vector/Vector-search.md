---
title: "search | Cloud"
slug: /cli/cli/Vector-search
sidebar_label: "search"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は類似ベクトルを検索します。 | Cloud"
type: docx
token: QcWcdXbgxooJO4xuwADc9YqAn8c
sidebar_position: 6
keywords: 
  - オープンソース vector db
  - vector database の例
  - rag vector database
  - vector db とは
  - zilliz
  - zilliz cloud
  - cloud
  - search
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# search

この操作は類似ベクトルを検索します。

## Description\{#description}

ANN と k-Nearest Neighbors（kNN）検索は、ベクトル類似性検索で最も一般的な方法です。kNN 検索では、最も類似したベクトルを特定する前に、ベクトル空間内のすべてのベクトルを検索リクエストに含まれるクエリベクトルと比較する必要があるため、時間がかかり、リソース消費も大きくなります。

ANN 検索は事前構築された index に依存しており、検索スループット、メモリ使用量、検索の正確性は、選択する index タイプによって異なる場合があります。検索パフォーマンスと正確性のバランスを取る必要があります。

学習コストを下げるために、Zilliz Cloud は **AUTOINDEX** を提供しています。**AUTOINDEX** を使用すると、Zilliz Cloud は index の構築中に collection 内のデータ分布を分析し、その分析に基づいて最適化された index パラメータを設定して、検索パフォーマンスと正確性のバランスを取ることができます。

AUTOINDEX および適用可能な metric type の詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) および [Metric Types](/docs/search-metrics-explained) を参照してください。

## Synopsis\{#synopsis}

```bash
zilliz vector search
--collection <value>
--data <value>
--anns-field <value>
[--limit <value>]
[--filter <value>]
[--database <value>]
[--partition <value>]
[--offset <value>]
[--search-params <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    collection 名を示します。

- **--data** (*array*) -

    **[REQUIRED]**

    クエリベクトルを JSON 配列として示します。

    JSON 配列は次のスキーマに一致する必要があります。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "search data",
        "type": "array",
        "items": {
            "type": "array",
            "description": "A vector embedding, whose length should match the dimensionality of the target vector field.",
            "items": {
                "type": "number",
                "description": "A dimension value of the vector embedding"
            }
        }
    }
    ```

- **--anns-field** (*string*) -

    検索対象の vector field を示します。

- **--limit** (*integer*) -

    返される結果の最大数を示します。

    デフォルト値は **10** で、`offset` との積は **16,384** 未満である必要があります。

- **--filter** (*string*) -

    scalar フィルター式を示します。

- **--output-fields** (*array*) -

    返す field を JSON 配列として示します。

- **--database** (*string*) -

    database 名を示します。

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

- **--partition, -p** (*array*) -

    検索対象の partition 名のリストを示します。指定しない場合はすべての partition を検索します。

- **--offset** (*integer*) -

    一致結果を返す前にスキップする結果数を示します。`--limit` とともにページネーションに使用されます。

    `limit` との積は **16,384** 未満である必要があります。

- **--search-params** (*json*) -

    検索パラメータの JSON 文字列を示します。例: `{"metricType":"COSINE","params":{"level": 5}}`)。

## Example\{#example}

```bash
# Basic vector search
zilliz vector search --collection my_col --data '[[0.1, 0.2, 0.3]]' --limit 10

# Search with scalar filter
zilliz vector search --collection my_col --data '[[0.1, 0.2]]' --filter 'age > 18' --output-fields '["name", "age"]'
```
