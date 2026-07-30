---
title: "使用 StructArray 进行 Filtered Search | Cloud"
slug: /filtered-search-with-struct-arrays
sidebar_label: "使用 StructArray 进行 Filtered Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本页介绍如何为 StructArray Field 上的向量搜索添加标量过滤。StructArray 过滤分为两个层级：Row-level 过滤器用于选择父 Entity，Element-level 过滤器用于限制哪些 Struct 元素参与 Element-level Vector Search。 | Cloud"
type: origin
token: RJ94whCwCiBLfdk8o9mcigZ5n9f
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 使用 StructArray 进行 Filtered Search

本页介绍如何为 StructArray Field 上的向量搜索添加标量过滤。StructArray 过滤分为两个层级：Row-level 过滤器用于选择父 Entity，Element-level 过滤器用于限制哪些 Struct 元素参与 Element-level Vector Search。

本页使用 [创建 StructArray Field](./create-struct-array) 中的 `tech_articles` Collection。该 Collection 包含名为 `chunks` 的 StructArray Field，其中包含 `section`、`page`、`quality_score`、`has_code` 等标量子字段，以及用于搜索的 Vector 子字段。

## 选择过滤类型\{#choose-a-filter-type}

| 目标 | 使用方式 | 结果行为 |
| --- | --- | --- |
| 按顶层标量 Field 过滤，例如 `category`。 | 常规过滤表达式。 | 在搜索前或搜索过程中选择父 Entity。 |
| 将 Element-level Vector Search 限制到满足标量条件的 Struct 元素。 | `element_filter`。 | 只搜索匹配的 Struct 元素，并可返回匹配元素的 offset。 |
| 根据是否有任意、全部或指定数量的 Struct 元素满足谓词来选择 Entity。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST` 或 `MATCH_EXACT`。 | Row-level 过滤。这些操作符本身不返回 offset。 |

<Admonition type="info" icon="📘" title="Notes">

本页说明如何在搜索流程中使用 StructArray 过滤器。如需完整语法规则、支持的谓词类型和不支持的谓词矩阵，请参见 [StructArray 操作符](./struct-array-filtering)。

</Admonition>

## 按顶层 Field 过滤\{#filter-by-top-level-fields}

当条件属于父 Entity，而不是某个单独的 Struct 元素时，请使用常规过滤表达式。这种方式同时适用于 EmbeddingList Search 和 Element-level Search。

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
    filter='category == "search"',
    limit=3,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
    ],
)
```

上面的过滤器只选择顶层 `category` Field 为 `"search"` 的 Entity。它不会标识某一个匹配的 Struct 元素。

## 过滤 Element-level Vector Search\{#filter-element-level-vector-search}

当标量条件必须作用于参与 Element-level Vector Search 的同一个 Struct 元素时，请使用 `element_filter(structArrayField, predicate)`。在谓词中，使用 `$[subfield]` 引用当前 Struct 元素的标量子字段。

```python
query_vector = [0.19, 0.24, 0.30, 0.37]

filter_expr = (
    'category == "search" && '
    'element_filter(chunks, '
    '$[section] == "index" && '
    '$[quality_score] > 0.9 && '
    '$[has_code] == true)'
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
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[page]",
        "chunks[quality_score]",
        "chunks[has_code]",
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

在此示例中，顶层谓词 `category == "search"` 选择候选 Entity，`element_filter` 则将 Element-level Vector Search 限制到同一个 Struct 元素内同时满足 `section`、`quality_score` 和 `has_code` 条件的 chunk。

<Admonition type="warning" icon="🚧" title="Warning">

将顶层谓词与 `element_filter` 组合使用时，请把 `element_filter` 放在表达式末尾。一个过滤表达式只能包含一个 `element_filter`，且不能在另一个 StructArray 操作符内部嵌套 `element_filter` 或 `MATCH_*`。

</Admonition>

## 使用 MATCH 操作符过滤 Entity\{#filter-entities-with-match-operators}

当过滤器需要根据 Entity 内的 Struct 元素来判断父 Entity 是否符合条件时，请使用 `MATCH_*` 操作符。这些操作符是 Row-level 过滤器：它们选择 Entity，但本身不返回元素 offset。

| 操作符 | 使用场景 | 示例 |
| --- | --- | --- |
| `MATCH_ANY` | 至少一个 Struct 元素必须满足谓词。 | `MATCH_ANY(chunks, $[section] == "index")` |
| `MATCH_ALL` | 所有 Struct 元素都必须满足谓词。 | `MATCH_ALL(chunks, $[quality_score] > 0.5)` |
| `MATCH_LEAST` | 至少 `N` 个 Struct 元素必须满足谓词。 | `MATCH_LEAST(chunks, $[has_code] == true, threshold=2)` |
| `MATCH_MOST` | 至多 `N` 个 Struct 元素必须满足谓词。 | `MATCH_MOST(chunks, $[section] == "appendix", threshold=1)` |
| `MATCH_EXACT` | 恰好 `N` 个 Struct 元素必须满足谓词。 | `MATCH_EXACT(chunks, $[section] == "summary", threshold=1)` |

```python
filter_expr = (
    'category == "search" && '
    'MATCH_ANY(chunks, $[section] == "index" && $[quality_score] > 0.9)'
)

results = client.search(
    collection_name="tech_articles",
    data=[query],
    anns_field="chunks[emb_list_vector]",
    search_params={
        "metric_type": "MAX_SIM_COSINE",
        "params": {},
    },
    filter=filter_expr,
    limit=3,
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

这里使用 `MATCH_ANY`，因为 EmbeddingList Search 的结果是 Entity 级。该过滤器要求 Entity 内至少有一个 `"index"` chunk 质量较高，但搜索结果本身仍表示父 Entity。

## 在 Hybrid Search 中使用过滤器\{#use-filters-in-hybrid-search}

在 Hybrid Search 中，请把 StructArray 过滤器应用到条件应该生效的位置。顶层过滤器可以由整个 Hybrid Search 共享。`element_filter` 应附加到需要 Element-level 约束的 StructArray Element-level 请求上。

```python
from pymilvus import AnnSearchRequest, RRFRanker

query_vector = [0.19, 0.24, 0.30, 0.37]

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
        "params": {},
    },
    limit=10,
    expr='element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_req],
    ranker=RRFRanker(),
    filter='category == "search"',
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

`filter` 参数应用顶层 Entity 条件，而 `chunk_req` 上的 `expr` 只约束 StructArray Element-level Vector 请求。关于支持的 Hybrid Search 组合和版本相关限制，请参见[使用 StructArray 进行 Hybrid Search](./hybrid-search-with-struct-array)和[StructArray 限制](./struct-array-limits)。

## 谓词支持摘要\{#predicate-support-summary}

StructArray 谓词应使用标量子字段。Vector 子字段不能作为标量谓词输入。

| 子字段类型 | 典型谓词示例 |
| --- | --- |
| `BOOL` | `$[has_code] == true`、`!($[has_code] == true)` |
| 整数类型 | `$[page] >= 2`、`$[page] in [1, 2, 3]` |
| `FLOAT`、`DOUBLE` | `$[quality_score] > 0.9`、`0.7 < $[quality_score] < 0.95` |
| `VARCHAR` | `$[section] == "index"`、`$[text] like "range%"` |
| Vector 子字段 | 不支持作为 `$[...]` 标量谓词输入。请通过向量搜索使用 Vector 子字段。 |

对于 JSON path、数组容器函数、文本匹配函数、`$[...]` 上的 Null 谓词、Geometry 函数、Timestamptz 表达式以及通用函数调用等不支持的情况，请参见 [StructArray 操作符](./struct-array-filtering)。

## 常见错误\{#common-mistakes}

- 在 `element_filter` 或 `MATCH_*` 之外使用 `$[subfield]`。

- 使用 `chunks.section`，而不是 `element_filter(chunks, $[section] == "index")` 等 StructArray 操作符语法。

- 只需要 Row-level 过滤时却使用 `element_filter`。如果只需要选择 Entity，请改用 `MATCH_ANY`。

- 误以为 `MATCH_*` 会返回元素 offset。这些操作符选择 Entity，本身不会标识某个匹配元素。

- 编写 `$[has_code]` 这样的裸布尔谓词。请使用 `$[has_code] == true` 等显式比较。

- 在同一个过滤表达式中把 `element_filter` 放在顶层谓词前面。

## 下一步\{#next-steps}

1. 如需查看完整 StructArray 过滤语法，请阅读 [StructArray 操作符](./struct-array-filtering)。

1. 如需先执行无过滤的向量搜索，请阅读[使用 StructArray 进行基础向量搜索](./search-with-struct-array)。

1. 如需为常用 StructArray 过滤器创建标量 Index，请阅读[为 StructArray Field 创建 Index](./index-struct-array)。

1. 如需查看版本相关的过滤和搜索限制，请阅读 [StructArray 限制](./struct-array-limits)。

