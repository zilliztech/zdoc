---
title: "使用 StructArray 进行 Basic Vector Search | BYOC"
slug: /search-with-struct-array
sidebar_label: "使用 StructArray 进行 Basic Vector Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本页介绍如何在 StructArray Field 中的向量子字段上执行相似性搜索。StructArray 支持两种基础向量搜索模式：EmbeddingList Search （行级） 和 Element-level Search（元素级）。前者对每个 Entity 中存储的 EmbeddingList 进行评分，后者则独立搜索每个 Struct 元素。 | BYOC"
type: origin
token: HoYbwnuFJi606WkUnlkcQLRWnre
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 使用 StructArray 进行 Basic Vector Search

本页介绍如何在 StructArray Field 中的向量子字段上执行相似性搜索。StructArray 支持两种基础向量搜索模式：EmbeddingList Search （行级） 和 Element-level Search（元素级）。前者对每个 Entity 中存储的 EmbeddingList 进行评分，后者则独立搜索每个 Struct 元素。

本页使用 [创建 StructArray Field](./create-struct-array) 中的 `tech_articles` Collection。该 Collection 包含一个名为 `chunks` 的 StructArray Field。每个 chunk 都包含文本、标量元数据、一个名为 `emb_list_vector` 向量子字段（我们将为其创建用于 EmbeddingList Search 的索引），以及一个名为 `emb` 的向量子字段（我们将为其创建用于 Element-level Search 的索引）。

## 开始前\{#before-you-begin}

请确保 Collection Schema、数据和 Index 已准备就绪。

| 要求 | 准备位置 |
| --- | --- |
| 创建 StructArray Field，例如 `chunks`。 | [创建 StructArray Field](./create-struct-array) |
| 插入 `chunks` Field 中包含 Struct 对象的 Entity。 | [向 StructArray Field 插入数据](./insert-struct-array) |
| 在 `chunks[emb_list_vector]` 上创建用于 EmbeddingList Search 的 `MAX_SIM*` Index。 | [为 StructArray Field 创建 Index](./index-struct-array) |
| 在 `chunks[emb]` 上创建用于 Element-level Search 的常规 Vector metric Index。 | [为 StructArray Field 创建 Index](./index-struct-array) |

<Admonition type="warning" icon="🚧" title="Warning">

一个 Vector Field 或 Vector 子字段只能接受一个 Index。如果同时需要 EmbeddingList Search 和 Element-level Search，请创建两个独立的 Vector 子字段。在本页中，`chunks[emb_list_vector]` 用于 EmbeddingList Search，`chunks[emb]` 用于 Element-level Search。

</Admonition>

## 选择搜索模式\{#choose-a-search-mode}

| 维度 | EmbeddingList Search | Element-level Search |
| --- | --- | --- |
| 目标子字段 | `chunks[emb_list_vector]` | `chunks[emb]` |
| 查询数据 | 包含一个或多个 Vector 的 EmbeddingList。 | 常规 Vector。 |
| Metric 类型族 | `MAX_SIM*`，例如 `MAX_SIM_COSINE`。 | 常规 Vector metric，例如 `COSINE`、`IP` 或 `L2`。 |
| 单个命中代表什么 | StructArray Vector 子字段与查询 EmbeddingList 相似的 Entity。 | StructArray Field 内匹配的 Struct 元素。 |
| 结果粒度 | Entity 级。 | Struct 元素级。 |
| Offset | 不适用。 | 返回时标识匹配 Struct 元素从 0 开始的位置。 |
| 典型用途 | ColBERT、ColPali 以及其他 late-interaction 检索模式。 | Chunk 级、passage 级、clip 级、patch 级或 fact 级检索。 |

## 执行 EmbeddingList Search\{#run-embeddinglist-search}

当查询本身包含多个 Vector，并且目标 StructArray Vector 子字段使用 `MAX_SIM*` metric 建立 Index 时，请使用 EmbeddingList Search。结果是 Entity 级匹配。

```python
from pymilvus import MilvusClient
from pymilvus.client.embedding_list import EmbeddingList

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query = EmbeddingList()
query.add([0.12, 0.21, 0.32, 0.44])
query.add([0.18, 0.23, 0.29, 0.36])

results = client.search(
    collection_name="tech_articles",
    data=[query],
    anns_field="chunks[emb_list_vector]",
    search_params={
        "metric_type": "MAX_SIM_COSINE",
        "params": {},
    },
    limit=3,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
    ],
)

for hits in results:
    for hit in hits:
        print(hit["id"], hit["distance"], hit["entity"])
```

在这种搜索模式下，`limit` 控制每个查询返回多少个 Entity。输出可以包含 StructArray 子字段，但命中本身表示匹配的父 Entity，而不是某一个具体的 Struct 元素。

<Admonition type="info" icon="📘" title="Notes">

如需完整的 ColBERT 或 ColPali 风格演示，请参见[使用 EmbeddingList 搜索：ColBERT 和 ColPali](./tutorial-colbert-colpali)。本页只介绍 StructArray 搜索的基础行为。

</Admonition>

## 执行 Element-level Search\{#run-element-level-search}

当每个 Struct 元素都应独立参与向量搜索时，请使用 Element-level Search。查询是常规 Vector，目标 Vector 子字段必须使用常规 Vector metric 建立 Index。

```python
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

在 Element-level Search 中，每个命中都代表一个匹配的 Struct 元素。`offset` 值是该元素在 StructArray Field 中从 0 开始的位置。如果同一个 Entity 中有多个 Struct 元素匹配查询，该 Entity 可能出现多次。`limit` 作用于元素命中，而不是去重后的父 Entity。

## 理解结果\{#interpret-results}

| 结果项 | EmbeddingList Search | Element-level Search |
| --- | --- | --- |
| `id` | 匹配 Entity 的主键。 | 包含匹配 Struct 元素的 Entity 主键。 |
| `distance` 或 score | 查询 EmbeddingList 与存储的 EmbeddingList 之间的评分或距离。 | 查询 Vector 与匹配 Struct 元素 Vector 之间的评分或距离。 |
| `offset` | 不适用。 | 返回时表示匹配 Struct 元素从 0 开始的位置。 |
| 重复主键 | 对单个查询通常不会出现，因为结果是 Entity 级。 | 可能出现，因为同一 Entity 中可以有多个 Struct 元素匹配。 |
| 请求的 StructArray 输出字段 | 从匹配的 Entity 返回。 | 按目标 API 和 SDK 支持的 Element-level 命中形态返回。 |

## 常见错误\{#common-mistakes}

- 使用 `chunks.emb`，而不是必需的子字段路径语法 `chunks[emb]`。

- 用 EmbeddingList 查询搜索使用常规 Vector metric 建立 Index 的 Vector 子字段。

- 用常规 Vector 查询搜索使用 `MAX_SIM*` metric 建立 Index 的 Vector 子字段。

- 误以为 Element-level Search 的 `limit` 会返回这么多个唯一父 Entity。它返回的是元素命中。

- 误以为 EmbeddingList Search 会返回某个具体元素的 offset。它返回的是 Entity 级匹配。

- 复用同一个 Vector 子字段支持两种搜索模式。由于每个 Vector 子字段只能接受一个 Index，请使用独立的 Vector 子字段。

## 下一步\{#next-steps}

1. 如需按标量条件限制 Element-level Search，请阅读[使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays)。

1. 如需按评分或距离边界搜索，请阅读[使用 StructArray 进行范围搜索](./range-search-with-struct-arrays)。

1. 如需在 Element-level Search 后让每个父 Entity 最多返回一个结果，请阅读[使用 StructArray 进行分组搜索](./grouping-search-with-struct-array)。

1. 如需将 StructArray Search 与其他向量搜索结合，请阅读[使用 StructArray 进行 Hybrid Search](./hybrid-search-with-struct-array)。

1. 如需查看支持的数据类型、metric、过滤器和版本相关限制，请阅读[StructArray 限制](./struct-array-limits)。

