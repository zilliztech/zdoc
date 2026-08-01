---
title: "使用 StructArray 进行 Hybrid Search | BYOC"
slug: /hybrid-search-with-struct-array
sidebar_label: "使用 StructArray 进行 Hybrid Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本页介绍如何在一个 Hybrid Search 请求中将 StructArray 向量搜索与其他向量搜索结合使用。StructArray Hybrid Search 可以生成 Entity-level 结果，也可以生成 Element-level 结果，具体取决于组合的 `AnnSearchRequest` 对象。 | BYOC"
type: origin
token: IlkswK6MgifcgIkLLnRcXRr9nLc
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 使用 StructArray 进行 Hybrid Search

本页介绍如何在一个 Hybrid Search 请求中将 StructArray 向量搜索与其他向量搜索结合使用。StructArray Hybrid Search 可以生成 Entity-level 结果，也可以生成 Element-level 结果，具体取决于组合的 `AnnSearchRequest` 对象。

本页使用 [创建 StructArray Field](./create-struct-array) 中的 `tech_articles` Collection。该 Collection 包含一个名为 `title_vector` 的顶层 Vector Field，以及一个名为 `chunks` 的 StructArray Field。`chunks[emb_list_vector]` 子字段用于 EmbeddingList Search，`chunks[emb]` 用于 Element-level Search。

## Hybrid Search 如何应用于 StructArray\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` 组合 | 最终候选范围 | 结果行为 | `element_scope` |
| --- | --- | --- | --- |
| Collection-level Vector Field + StructArray EmbeddingList 子字段 | Entity 级 | 最终候选以主键为 key。 | 不要使用。 |
| Collection-level Vector Field + StructArray Element-level 子字段 | Entity 级 | Element-level 命中会在 Hybrid 重新排序前折叠为 Entity-level 候选。 | 可在 StructArray Element-level `AnnSearchRequest` 上设置折叠配置。 |
| 同一 StructArray Field 下的多个 Element-level 子字段 | Element 级 | 最终候选以主键加 Struct 元素 offset 为 key。 | 不要使用。 |
| 不同 StructArray Field 下的 Element-level 子字段 | Entity 级 | Element offset 不共享身份，因此每个 StructArray Element-level `AnnSearchRequest` 都会在重新排序前折叠。 | 可在每个 StructArray Element-level `AnnSearchRequest` 上设置折叠配置。 |

<Admonition type="warning" icon="🚧" title="Warning">

`element_scope` 只用于为非同一 Struct 的 Element-level Hybrid Search 中的 StructArray Element-level `AnnSearchRequest` 配置折叠。不要将它用于 EmbeddingList 请求、Collection-level Vector 请求或同一 StructArray 下的 Element-level Hybrid Search。

</Admonition>

## 开始前\{#before-you-begin}

运行 Hybrid Search 前，请先准备好 Collection、数据和 Index。

| 要求 | 说明 |
| --- | --- |
| StructArray Field | Collection 包含 `chunks` 等 StructArray Field。 |
| Vector 子字段 | 为 EmbeddingList Search 和 Element-level Search 使用独立的 Vector 子字段。 |
| Index | `chunks[emb_list_vector]` 使用 `MAX_SIM*` metric。`chunks[emb]` 使用 `COSINE`、`IP` 或 `L2` 等常规 Vector metric。 |
| Reranker | 选择 `RRFRanker` 或应用支持的其他 Hybrid reranker。 |

Index 设置请参见[为 StructArray Field 创建 Index](./index-struct-array)。

## 使用 EmbeddingList 请求执行 Hybrid Search\{#run-hybrid-search-with-an-embeddinglist-request}

在 Hybrid Search 中，StructArray Vector 子字段上的 EmbeddingList Search 是 Entity-level 的。它的行为类似 Entity-level Vector Search 请求，不会返回某个匹配 Struct 元素的 offset。

```python
from pymilvus import AnnSearchRequest, MilvusClient, RRFRanker
from pymilvus.client.embedding_list import EmbeddingList

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query_vector = [0.19, 0.24, 0.30, 0.37]

query_list = EmbeddingList()
query_list.add([0.12, 0.21, 0.32, 0.44])
query_list.add([0.18, 0.23, 0.29, 0.36])

title_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="title_vector",
    param={
        "metric_type": "COSINE",
        "params": {},
    },
    limit=10,
)

chunk_list_req = AnnSearchRequest(
    data=[query_list],
    anns_field="chunks[emb_list_vector]",
    param={
        "metric_type": "MAX_SIM_COSINE",
        "params": {},
    },
    limit=10,
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_list_req],
    ranker=RRFRanker(),
    limit=5,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
    ],
)
```

在此示例中，两个 `AnnSearchRequest` 对象都会生成 Entity-level 候选。最终结果以父 Entity 主键为 key。不要为 EmbeddingList 请求添加 `element_scope`。

## 执行同一 StructArray 下的 Element-level Hybrid Search\{#run-same-structarray-element-level-hybrid-search}

当所有 `AnnSearchRequest` 对象都指向同一 StructArray Field 下的 Element-level Vector 子字段时，Hybrid Search 可以在重新排序过程中保留 Element-level 候选。这是唯一一种最终结果仍保持 Element-level 的 StructArray Hybrid 模式。

以下示例假设 `chunks` StructArray Field 有两个 Element-level Vector 子字段：`chunks[emb]` 和 `chunks[code_emb]`，且二者都使用常规 Vector metric。

```python
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
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
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

两个 `AnnSearchRequest` 对象都搜索 `chunks` 下的 Vector 子字段。同一个从 0 开始的 offset 指向同一个 Struct 元素，因此 Hybrid reranker 可以直接对元素候选进行排序。该模式不会执行 Entity-level 折叠，因此不要设置 `element_scope`。

## 为 Entity-level Hybrid Search 折叠 Element-level 命中\{#collapse-element-level-hits-for-entity-level-hybrid-search}

如果 Hybrid Search 将 StructArray Element-level `AnnSearchRequest` 与 Collection-level Vector 请求、EmbeddingList 请求，或另一个 StructArray Field 下的 Element-level 请求混合使用，最终候选范围就是 Entity 级。在这种情况下，每个 StructArray Element-level `AnnSearchRequest` 都会在 Hybrid 重新排序前折叠为 Entity-level 候选。

当需要控制同一 Entity 中多个匹配元素如何折叠时，请在 StructArray Element-level `AnnSearchRequest` 的 `params` 中使用 `element_scope`。

```python
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
            "element_scope": {
                "collapse": {
                    "strategy": "topk_sum",
                    "topk": 3,
                },
            },
        },
    },
    limit=30,
    expr='element_filter(chunks, $[quality_score] > 0.8)',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_req],
    ranker=RRFRanker(),
    limit=5,
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

在此示例中，`title_req` 是 Entity-level，因此最终 Hybrid 结果也是 Entity-level。`chunk_req` 请求会先从 `chunks[emb]` 返回元素命中，然后对同一 Entity 中返回的元素按最佳三个元素分数求和进行折叠。如果需要 Entity-level 折叠但省略了 `element_scope`，默认折叠策略为 `max`。

## 选择折叠策略\{#choose-a-collapse-strategy}

| 策略 | 行为 | `topk` | Metric 要求 |
| --- | --- | --- | --- |
| `max` | 保留该 Entity 的最佳返回元素分数。 | 不允许。 | 任意受支持的常规 Vector metric。 |
| `sum` | 对该 Entity 的所有返回元素分数求和。 | 不允许。 | 仅适用于正相关 metric，例如 `IP` 或 `COSINE`。 |
| `avg` | 对该 Entity 的所有返回元素分数取平均值。 | 不允许。 | 任意受支持的常规 Vector metric。 |
| `topk_sum` | 对该 Entity 的最佳 `K` 个返回元素分数求和。 | 必填，且必须为正数。 | 仅适用于正相关 metric，例如 `IP` 或 `COSINE`。 |
| `topk_avg` | 对该 Entity 的最佳 `K` 个返回元素分数取平均值。 | 必填，且必须为正数。 | 任意受支持的常规 Vector metric。 |

折叠只使用该 StructArray Element-level `AnnSearchRequest` 返回的元素命中。它不会在 ANN Search 后扫描 Entity 中的所有 Struct 元素。请将请求的 `limit` 设置得足够大，以便提供你希望参与折叠的元素。

## 添加过滤器、Range Search 和 Grouping\{#add-filters-range-search-and-grouping}

当标量条件应作用于参与向量搜索的同一个 Struct 元素时，可以把 `element_filter` 附加到 StructArray Element-level `AnnSearchRequest` 上。也可以在 `hybrid_search()` 上使用顶层 `filter` 处理父 Entity 条件。

StructArray Element-level Vector Field 支持在 Hybrid Search 中使用 Range Search。请将 `radius` 以及可选的 `range_filter` 添加到 Element-level `AnnSearchRequest` 中。EmbeddingList-level StructArray 请求不支持 Range Search。

Element-level Hybrid Grouping 仅当所有 `AnnSearchRequest` 对象都指向同一 StructArray Field 下的 Element-level Vector Field 时支持，且 `group_by_field` 必须是主键。当请求混用了 Collection-level Vector Field、不同 StructArray Field 或 EmbeddingList-level 请求时，不支持 Hybrid Grouping。不要将 Range Search 与 Grouping 组合使用。

## 理解 Hybrid 结果\{#interpret-hybrid-results}

| 最终候选范围 | 结果 key | Offset 行为 | 发生场景 |
| --- | --- | --- | --- |
| Entity 级 | 主键。 | 最终结果中没有元素 offset。 | Hybrid 请求包含 Collection-level Vector Field、EmbeddingList 请求，或不同 StructArray Field 下的 Element-level 请求。 |
| Element 级 | 主键加父 StructArray Field 加元素 offset。 | 当 API 或 SDK 暴露时，可返回被选中元素的 offset。 | 所有 `AnnSearchRequest` 对象都是 Element-level，且位于同一 StructArray Field 下。 |

## 限制\{#limitations}

- `element_scope` 只用于在 Hybrid Search 中必须折叠为 Entity-level 候选的 StructArray Element-level `AnnSearchRequest`。

- 不要将 `element_scope` 用于 EmbeddingList 请求、Collection-level Vector 请求或同一 StructArray 下的 Element-level Hybrid Search。

- `sum` 和 `topk_sum` 折叠策略要求使用正相关 metric，例如 `IP` 或 `COSINE`。不要将它们与 `L2` 一起使用。

- `topk_sum` 和 `topk_avg` 要求 `topk` 为正数。其他折叠策略不得包含 `topk`。

- EmbeddingList-level StructArray 请求不支持 Range Search 或 group-by。

- Hybrid group-by 仅支持同一 StructArray 下的 Element-level Hybrid Search，且只能按主键分组。

- 不要将 Range Search 与 group-by 组合使用。

## 常见错误\{#common-mistakes}

- 为同一 StructArray 下的 Element-level Hybrid 请求添加 `element_scope`。该请求保持 Element-level，不会执行 Entity-level 折叠。

- 为 `chunks[emb_list_vector]` 添加 `element_scope`。EmbeddingList Search 已经是 Entity-level。

- 误以为两个 StructArray Field 共享元素 offset。`chunks` 中的 offset `3` 和另一个 StructArray Field 中的 offset `3` 是不同元素，因此 Hybrid 请求会变成 Entity-level。

- 将 `topk_sum` 与 `L2` 一起使用。对于负距离 metric，请使用 `max`、`avg` 或 `topk_avg`。

- 期待 Entity-level Hybrid 结果在折叠后仍包含被选中 Struct 元素的 offset。

## 下一步\{#next-steps}

1. 如需了解两种基础 StructArray 向量搜索模式，请阅读[使用 StructArray 进行基础向量搜索](./search-with-struct-array)。

1. 如需为 Hybrid Search 添加标量过滤，请阅读[使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays)。

1. 如需在 Hybrid Search 中使用评分或距离边界，请阅读[使用 StructArray 进行范围搜索](./range-search-with-struct-arrays)。

1. 如需按父 Entity 对 Element-level Hybrid 结果进行分组，请阅读[使用 StructArray 进行分组搜索](./grouping-search-with-struct-array)。

1. 如需查看 StructArray 搜索限制，请阅读 [StructArray 限制](./struct-array-limits)。

