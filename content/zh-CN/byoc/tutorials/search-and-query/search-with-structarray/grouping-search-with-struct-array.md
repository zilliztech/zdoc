---
title: "使用 StructArray 进行 Grouping Search | BYOC"
slug: /grouping-search-with-struct-array
sidebar_label: "使用 StructArray 进行 Grouping Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本页介绍如何按父 Entity 对 StructArray Element-level Search 结果进行分组。当多个 Struct 元素匹配查询时，Element-level Search 可能从同一个 Entity 返回多个命中。Grouping 会折叠这些元素命中，使每个父 Entity 最多出现一次。 | BYOC"
type: origin
token: NJzrwqw57iDvnVkgTcUcwtu0nKg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 使用 StructArray 进行 Grouping Search

本页介绍如何按父 Entity 对 StructArray Element-level Search 结果进行分组。当多个 Struct 元素匹配查询时，Element-level Search 可能从同一个 Entity 返回多个命中。Grouping 会折叠这些元素命中，使每个父 Entity 最多出现一次。

本页使用 [创建 StructArray Field](./create-struct-array) 中的 `tech_articles` Collection。该 Collection 包含名为 `chunks` 的 StructArray Field。`chunks[emb]` Vector 子字段使用常规 Vector metric 建立 Index，用于 Element-level Search。

## Grouping 如何应用于 StructArray\{#how-grouping-applies-to-structarray}

| 搜索模式 | Grouping 行为 | 结果行为 |
| --- | --- | --- |
| EmbeddingList Search | 不支持。 | 不适用。 |
| Element-level Search | 支持按主键分组。 | 每个父 Entity 最多返回一个结果。Element-level 元数据会被保留，因此当 API 或 SDK 暴露时，可返回被选中元素的 index 或 offset。 |
| Hybrid Search | 仅当所有子搜索都指向同一 StructArray Field 下的 Element-level Vector Field 时支持。 | Element-level 子搜索先按主键分组，再进行最终结果处理。 |

<Admonition type="info" icon="📘" title="Notes">

当未分组的 Element-level Search 返回过多重复父 Entity 时，请使用 Grouping。如果希望每个匹配的 Struct 元素都作为单独命中返回，请使用不带 `group_by_field` 的[使用 StructArray 进行基础向量搜索](./search-with-struct-array)。

</Admonition>

## 开始前\{#before-you-begin}

运行 Grouping Search 前，请先准备好 Collection、数据和 Index。

| 要求 | 说明 |
| --- | --- |
| Element-level Vector 子字段 | 使用 `chunks[emb]` 等 StructArray Vector 子字段，并通过常规 Vector metric 建立 Index。 |
| 常规 Vector 查询 | 使用常规查询 Vector，而不是 `EmbeddingList`。 |
| 主键分组 | 使用 Collection 主键作为 `group_by_field`，例如 `doc_id`。 |
| 不使用范围参数 | 不要将 Grouping Search 与 `radius` 或 `range_filter` 等 Range Search 参数组合使用。 |

Index 设置请参见[为 StructArray Field 创建 Index](./index-struct-array)。

## 执行分组的 Element-level Search\{#run-grouped-element-level-search}

以下示例先搜索单个 chunk，再按父 Entity 的主键对元素命中进行分组。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query_vector = [0.19, 0.24, 0.30, 0.37]

results = client.search(
    collection_name="tech_articles",
    data=[query_vector],
    anns_field="chunks[emb]",
    search_params={
        "metric_type": "COSINE",
        "params": {},
    },
    limit=5,
    group_by_field="doc_id",
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[page]",
        "chunks[quality_score]",
    ],
)

for hits in results:
    for hit in hits:
        print(
            "doc_id:", hit["id"],
            "distance:", hit["distance"],
            "offset:", hit.get("offset"),
            "entity:", hit["entity"],
        )
```

如果不分组，当多个 chunk 匹配查询时，同一个 `doc_id` 可能出现多次。设置 `group_by_field="doc_id"` 后，每个父 Entity 最多出现一次。Grouping 会保留 Element-level 元数据，因此当 API 或 SDK 暴露时，分组后的结果仍可包含被选中 Struct 元素的 index 或 offset。

## 添加标量过滤器\{#add-scalar-filters}

可以将 Grouping Search 与 StructArray 标量过滤结合使用。当标量条件应限制哪些 Struct 元素参与 Element-level Vector Search 时，请使用 `element_filter`。

```python
filter_expr = (
    'category == "search" && '
    'element_filter(chunks, '
    '$[section] == "index" && '
    '$[quality_score] > 0.9)'
)

results = client.search(
    collection_name="tech_articles",
    data=[query_vector],
    anns_field="chunks[emb]",
    search_params={
        "metric_type": "COSINE",
        "params": {},
    },
    filter=filter_expr,
    limit=5,
    group_by_field="doc_id",
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)
```

顶层谓词选择候选 Entity。`element_filter` 谓词将 Element-level Vector Search 限制到匹配的 Struct 元素。随后，Grouping 按主键折叠匹配的元素命中。

## 在 Hybrid Search 中使用 Grouping\{#use-grouping-in-hybrid-search}

StructArray 中的 Hybrid Grouping 是一种 Element-level 功能。只有当所有子搜索都指向同一 StructArray Field 下的 Element-level Vector Field 时才支持。不要在分组的 StructArray Hybrid Search 中使用 EmbeddingList-level 请求。

以下示例假设 `chunks` StructArray Field 包含两个 Element-level Vector 子字段：`chunks[emb]` 和 `chunks[code_emb]`，且二者都使用常规 Vector metric 建立 Index。

```python
from pymilvus import AnnSearchRequest, RRFRanker

index_chunk_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="chunks[emb]",
    param={
        "metric_type": "COSINE",
        "params": {},
    },
    limit=10,
    expr='element_filter(chunks, $[section] == "index")',
)

code_chunk_req = AnnSearchRequest(
    data=[code_query_vector],
    anns_field="chunks[code_emb]",
    param={
        "metric_type": "COSINE",
        "params": {},
    },
    limit=10,
    expr='element_filter(chunks, $[has_code] == true)',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[index_chunk_req, code_chunk_req],
    ranker=RRFRanker(),
    limit=5,
    group_by_field="doc_id",
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
    ],
)
```

在此示例中，两个子请求都指向 `chunks` 下的 Element-level Vector Field。如果 Hybrid Search 混用了普通 Vector Field、不同 StructArray Field 或 EmbeddingList-level 请求，则不支持 Element-level group-by。

## 理解分组结果\{#interpret-grouped-results}

| 结果项 | 含义 |
| --- | --- |
| `id` | 分组后的父 Entity 主键。 |
| `distance` 或 score | 该父 Entity 中被选中 Struct 元素的评分或距离。 |
| `offset` | 返回时表示被选中 Struct 元素从 0 开始的位置。 |
| 重复主键 | 按主键分组时通常不会出现。 |
| `limit` | 作用于分组后的父 Entity 结果。 |

## 限制\{#limitations}

- Grouping Search 仅适用于 Element-level StructArray Vector Search。EmbeddingList Search 和 EmbeddingList-level Hybrid Search 不支持 group-by。

- 请使用主键作为 `group_by_field`。StructArray Element-level Grouping 不是面向任意标量 Field 的通用 group-by。

- 不要将 Grouping Search 与 Range Search 组合使用。

- 不要使用 `EmbeddingList` 查询或 `MAX_SIM*` metric 执行 Grouping Search。

- Hybrid Grouping 仅在所有子搜索都指向同一 StructArray Field 下的 Element-level Vector Field 时支持。

- 当 Hybrid Search 混用了普通 Vector Field、不同 StructArray Field 或 EmbeddingList-level 请求时，不支持 Hybrid Grouping。

## 常见错误\{#common-mistakes}

- 对用于 EmbeddingList Search 的 `chunks[emb_list_vector]` 使用 Grouping。

- 按非主键标量 Field 分组。

- 按多个 Field 分组。Element-level StructArray Grouping 只支持主键分组。

- 误以为分组结果表示每个匹配的 Struct 元素。Grouping 会让每个父 Entity 最多返回一个结果。

- 误以为分组后的 Element-level Search 会重新计算 EmbeddingList 风格的 `MAX_SIM*` 分数。Grouping 只是折叠 Element-level 命中，不会改变评分模型。

- 将 `group_by_field` 与 `radius` 或 `range_filter` 组合使用。

## 下一步\{#next-steps}

1. 如需先了解未分组的 Element-level Search，请阅读[使用 StructArray 进行基础向量搜索](./search-with-struct-array)。

1. 如需为分组搜索添加标量过滤，请阅读[使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays)。

1. 如需使用评分或距离边界而不是 Grouping，请阅读[使用 StructArray 进行范围搜索](./range-search-with-struct-arrays)。

1. 如需查看 StructArray 搜索限制，请阅读 [StructArray 限制](./struct-array-limits)。

