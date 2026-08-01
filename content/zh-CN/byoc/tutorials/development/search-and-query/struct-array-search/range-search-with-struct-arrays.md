---
title: "使用 StructArray 进行 Range Search | BYOC"
slug: /range-search-with-struct-arrays
sidebar_label: "使用 StructArray 进行 Range Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本页介绍如何在 StructArray Vector 子字段上执行 Range Search。Range Search 会返回评分或距离落在指定边界内的向量命中。对于 StructArray Field，请将 Range Search 与 Element-level Vector Search 结合使用，此时每个 Struct 元素都会被独立搜索。 | BYOC"
type: origin
token: MI8Ewfb9NiYf7lkT5mscb6REnCd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 使用 StructArray 进行 Range Search

本页介绍如何在 StructArray Vector 子字段上执行 Range Search。Range Search 会返回评分或距离落在指定边界内的向量命中。对于 StructArray Field，请将 Range Search 与 Element-level Vector Search 结合使用，此时每个 Struct 元素都会被独立搜索。

本页使用 [创建 StructArray Field](./create-struct-array) 中的 `tech_articles` Collection。该 Collection 包含名为 `chunks` 的 StructArray Field。`chunks[emb]` Vector 子字段使用 `COSINE`、`IP` 或 `L2` 等常规 Vector metric 建立 Index，用于 Element-level Search。

## Range Search 如何应用于 StructArray\{#how-range-search-applies-to-structarray}

| 搜索模式 | Range Search 行为 | 结果粒度 |
| --- | --- | --- |
| EmbeddingList Search | 不支持。 | 不适用。 |
| Element-level Search | 使用常规 Vector 查询，并设置 `radius`，也可按需设置 `range_filter`。 | Struct 元素级。 |
| Hybrid Search | 当 StructArray 请求的目标是 Element-level Vector Field 时支持。EmbeddingList-level 请求不支持 Range Search。 | Element-level 子搜索，然后进行 Hybrid 重新排序。 |

<Admonition type="info" icon="📘" title="Notes">

如果只需要最近的 Struct 元素，请先阅读[使用 StructArray 进行基础向量搜索](./search-with-struct-array)。当结果必须满足评分或距离边界，而不只是 Top-K 排名时，再使用 Range Search。

</Admonition>

## 开始前\{#before-you-begin}

运行 Range Search 前，请先准备好 Collection、数据和 Index。

| 要求 | 说明 |
| --- | --- |
| StructArray Field | Collection 包含 `chunks` 等 StructArray Field。 |
| Element-level Vector 子字段 | 目标 Vector 子字段是 `chunks[emb]`，而不是 `chunks[emb_list_vector]`。 |
| Index metric | Vector 子字段使用 `COSINE`、`IP` 或 `L2` 等常规 Vector metric 建立 Index。 |
| 查询数据 | 查询是常规 Vector，而不是 `EmbeddingList`。 |

Index 设置请参见[为 StructArray Field 创建 Index](./index-struct-array)。

## 使用 radius 和 range_filter\{#use-radius-and-range-filter}

设置 `radius` 用于定义搜索边界。需要内层边界时，可同时设置 `range_filter`。边界方向取决于 metric 是距离越小越好，还是相似度评分越大越好。

| Metric 类型 | 分数越高越好吗？ | 使用 `range_filter` 时的范围条件 |
| --- | --- | --- |
| `L2` | 否。距离越小越好。 | `range_filter <= distance < radius` |
| `IP`、`COSINE` | 是。评分越大越好。 | `radius < distance <= range_filter` |

只设置 `radius` 时，Range Search 会返回满足该 metric 外层边界的命中。请根据 Embedding 的评分或距离尺度选择取值。

## 执行 Element-level Range Search\{#run-element-level-range-search}

以下示例搜索 `chunks[emb]` Vector 与查询 Vector 足够相似的单个 chunk。每个结果命中都代表一个匹配的 Struct 元素。

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
        "params": {
            "radius": 0.80,
            "range_filter": 0.95,
        },
    },
    limit=10,
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

在此示例中，`COSINE` 是相似度型 metric，因此结果范围是大于 `radius` 且小于等于 `range_filter`。返回时，`offset` 值标识 `chunks` 数组中匹配的 Struct 元素。

## 添加标量过滤器\{#add-scalar-filters}

可以将 Element-level Range Search 与 StructArray 标量过滤结合使用。父 Entity Field 使用顶层谓词；需要限制哪些 Struct 元素参与向量 Range Search 时，使用 `element_filter`。

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
        "params": {
            "radius": 0.80,
            "range_filter": 0.95,
        },
    },
    filter=filter_expr,
    limit=10,
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

顶层谓词选择候选 Entity。`element_filter` 谓词将向量 Range Search 限制到匹配的 Struct 元素。更多过滤示例请参见[使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays)。

## 在 Hybrid Search 中使用 Range Search\{#use-range-search-in-hybrid-search}

StructArray Element-level Vector Field 支持在 Hybrid Search 中使用 Range Search。请将 `radius` 以及可选的 `range_filter` 添加到目标为 StructArray Element-level Vector Field 的 `AnnSearchRequest` 中。

```python
from pymilvus import AnnSearchRequest, RRFRanker

title_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="title_vector",
    param={
        "metric_type": "COSINE",
        "params": {},
    },
    limit=10,
)

chunk_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="chunks[emb]",
    param={
        "metric_type": "COSINE",
        "params": {
            "radius": 0.80,
            "range_filter": 0.95,
        },
    },
    limit=10,
    expr='element_filter(chunks, $[section] == "index")',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_req],
    ranker=RRFRanker(),
    limit=5,
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)
```

在此示例中，只有 `chunks[emb]` 子请求使用 Range Search 参数。StructArray 请求仍遵循 Element-level 语义：在 Hybrid Search 合并并重新排序结果之前，范围边界先应用于 Struct 元素命中。

## 理解范围搜索结果\{#interpret-range-results}

| 结果项 | 含义 |
| --- | --- |
| `id` | 包含匹配 Struct 元素的 Entity 主键。 |
| `distance` 或 score | 查询 Vector 与匹配 Struct 元素 Vector 之间的评分或距离。 |
| `offset` | 返回时表示匹配 Struct 元素在 StructArray Field 中从 0 开始的位置。 |
| 重复主键 | 可能出现。同一 Entity 中可以有多个 Struct 元素落在指定范围内。 |
| `limit` | 作用于元素命中，而不是唯一父 Entity。 |

## 限制\{#limitations}

- 不要在 StructArray Vector 子字段上使用 `EmbeddingList` 查询或 `MAX_SIM*` metric 执行 Range Search。EmbeddingList-level Search 不支持 Range Search。

- 不要将 Range Search 与 Grouping Search 组合使用。如果需要每个父 Entity 返回一个结果，请在不设置范围参数的情况下执行 Element-level Search，并在支持时使用 Grouping。

- Hybrid Range Search 支持 StructArray 元素级向量字段，但不支持行级 StructArray 请求。

## 常见错误\{#common-mistakes}

- 对 `chunks[emb_list_vector]` 执行 Range Search；该子字段用于 EmbeddingList Search。

- 在 Element-level Range Search 中使用 `MAX_SIM_COSINE`，而不是 `COSINE` 等常规 metric。

- 使用 `EmbeddingList` 查询，而不是常规 Vector 查询。

- 误以为 Range Search 结果会按父 Entity 去重。Range Search 返回匹配的 Struct 元素命中。

- 使用 `chunks.emb`，而不是必需的子字段路径语法 `chunks[emb]`。

## 下一步\{#next-steps}

1. 如需了解两种基础 StructArray 向量搜索模式，请阅读[使用 StructArray 进行基础向量搜索](./search-with-struct-array)。

1. 如需为 Range Search 添加标量过滤，请阅读[使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays)。

1. 如需在支持时让每个父 Entity 最多返回一个结果，请阅读[使用 StructArray 进行分组搜索](./grouping-search-with-struct-array)。

1. 如需查看版本相关搜索限制，请阅读 [StructArray 限制](./struct-array-limits)。

