---
title: "search | Cloud"
slug: /cli/cli/Vector-search
sidebar_label: "search"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于搜索相似向量。 | Cloud"
type: docx
token: QcWcdXbgxooJO4xuwADc9YqAn8c
sidebar_position: 6
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
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

此操作用于搜索相似向量。

## Description\{#description}

ANN 和 k-Nearest Neighbors（kNN）搜索是向量相似度搜索中最常见的方法。在 kNN 搜索中，在找出最相似的向量之前，必须先将向量空间中的所有向量与搜索请求中携带的查询向量进行比较，这会耗费大量时间和资源。

ANN 搜索依赖于预先构建的索引，而搜索吞吐量、内存使用量和搜索正确性可能会因所选索引类型而异。你需要在搜索性能和正确性之间进行权衡。

为了降低学习门槛，Zilliz Cloud 提供了 **AUTOINDEX**。借助 **AUTOINDEX**，Zilliz Cloud 可以在构建索引时分析集合中的数据分布，并基于分析结果设置最优化的索引参数，从而在搜索性能和正确性之间取得平衡。

有关 AUTOINDEX 和适用的度量类型的详细信息，请参见 [AUTOINDEX Explained](/docs/autoindex-explained) 和 [Metric Types](/docs/search-metrics-explained)。

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

    表示集合名称。

- **--data** (*array*) -

    **[REQUIRED]**

    表示作为 JSON 数组的查询向量。

    该 JSON 数组应符合以下 schema：

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

    表示要搜索的向量字段。

- **--limit** (*integer*) -

    表示要返回的最大结果数。

    该值默认为 **10**，且其与 `offset` 的乘积应小于 **16,384**。

- **--filter** (*string*) -

    表示标量过滤表达式。

- **--output-fields** (*array*) -

    表示要作为 JSON 数组返回的字段。

- **--database** (*string*) -

    表示数据库名称。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于过滤输出的 JMESPath 表达式。

- **--partition, -p** (*array*) -

    表示要搜索的分区名称列表。若未指定，则搜索所有分区。

- **--offset** (*integer*) -

    表示在返回匹配结果之前要跳过的结果数量。用于配合 `--limit` 进行分页。

    其与 `limit` 的乘积应小于 **16,384**。

- **--search-params** (*json*) -

    表示搜索参数的 JSON 字符串。例如，`{"metricType":"COSINE","params":{"level": 5}}`）。

## Example\{#example}

```bash
# Basic vector search
zilliz vector search --collection my_col --data '[[0.1, 0.2, 0.3]]' --limit 10

# Search with scalar filter
zilliz vector search --collection my_col --data '[[0.1, 0.2]]' --filter 'age > 18' --output-fields '["name", "age"]'
```
