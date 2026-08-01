---
title: "StructArray 概述 | BYOC"
slug: /use-array-of-structs
sidebar_label: "StructArray 概述"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "当一个 Entity 需要存储有序的结构化元素列表时，可以使用 StructArray，例如一个文档包含多个片段、一个页面包含多个视觉块，或一个视频包含多个片段。StructArray 会把这些元素保留在父 Entity 内，同时仍允许对每个元素内部的 Field 执行 Vector Search 和 Scalar Filtering。 | BYOC"
type: origin
token: J8HhwBs8riYN7kk2FSpcaUjTn9c
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# StructArray 概述

当一个 Entity 需要存储有序的结构化元素列表时，可以使用 StructArray，例如一个文档包含多个片段、一个页面包含多个视觉块，或一个视频包含多个片段。StructArray 会把这些元素保留在父 Entity 内，同时仍允许对每个元素内部的 Field 执行 Vector Search 和 Scalar Filtering。

## 什么是 StructArray？ \{#what-is-structarray}

**StructArray** 也称为 array of structs，会在每个 Entity 中存储一组有序的 Struct 元素。数组中的每个 Struct 元素都遵循相同的 Schema。一个 Struct 元素可以包含 Scalar subfield、Vector subfield，或二者同时包含。

例如，一个 Collection 可以把一篇文章存为一个 Entity，并把文章片段存储在名为 `chunks` 的 StructArray Field 中。每个片段可以包含文本、章节元数据、质量评分，以及一个或多个 Vector embedding。

```json
{
  "doc_id": 1,
  "title": "Vector search tuning guide",
  "category": "search",
  "title_vector": [0.10, 0.20, 0.30, 0.40],
  "chunks": [
    {
      "text": "Use HNSW efSearch to trade recall for latency.",
      "section": "index",
      "page": 1,
      "quality_score": 0.92,
      "has_code": true,
      "emb_list_vector": [0.11, 0.21, 0.31, 0.41],
      "emb": [0.12, 0.20, 0.33, 0.39]
    },
    {
      "text": "Range search returns vectors within a distance boundary.",
      "section": "search",
      "page": 2,
      "quality_score": 0.86,
      "has_code": false,
      "emb_list_vector": [0.18, 0.23, 0.29, 0.36],
      "emb": [0.19, 0.24, 0.30, 0.37]
    }
  ]
}
```

<Admonition type="info" icon="📘" title="说明">

此示例中的两个 Vector subfield 代表同一个片段的两种搜索视角。`chunks[emb_list_vector]` 用于基于 `MAX_SIM*` metric 的 EmbeddingList Search，而 `chunks[emb]` 用于基于常规 Vector metric（如 `COSINE`、`IP` 或 `L2`）的 Element-level Search。

</Admonition>

## 何时使用 StructArray \{#when-to-use-structarray}

当你想返回的自然单元大于想搜索或过滤的自然单元时，可以使用 StructArray。

| 使用场景 | StructArray 的作用 | 典型 StructArray Field |
| --- | --- | --- |
| 文档检索 | 将一个文档存为一个 Entity，同时在它的片段上搜索。 | `chunks` |
| Late-interaction 检索 | 将文档或页面存为 EmbeddingList，并用 `MAX_SIM*` 评分。 | `chunks[emb_list_vector]` 或 `patches[emb]` |
| Element-level 检索 | 返回最相关的片段、视频片段、视觉块或观测项，并包含其数组偏移量。 | `chunks[emb]` |
| 结构化过滤 | 按 Struct 元素内部的 Scalar subfield 过滤，例如章节、评分、页码或标记。 | `chunks[section]`、`chunks[quality_score]` |
| 减少重复父结果 | 将子元素保留在同一个父 Entity 下，而不是把每个子元素存成单独的行。 | `chunks`、`clips`、`patches` |

## 决策矩阵 \{#decision-matrix}

使用下表选择合适的 StructArray 路径。

| 目标 | 推荐路径 | 结果粒度 | 从这里开始 |
| --- | --- | --- | --- |
| 为一个包含多个结构化子对象的父对象建模。 | 创建 StructArray Field。 | Entity 包含有序的 Struct 元素。 | [创建 StructArray Field](./create-struct-array) |
| 插入包含嵌套子对象数据的父记录。 | 插入一个 StructArray Field 为 Struct 对象列表的 Entity。 | Entity 级插入。 | [向 StructArray Field 插入数据](./insert-struct-array) |
| 运行 ColBERT、ColPali 或文档级 late-interaction 检索。 | 使用带 `MAX_SIM*` Index 的 EmbeddingList Search。 | Entity 级。 | [使用 EmbeddingList 搜索：ColBERT 和 ColPali](./tutorial-colbert-colpali) |
| 搜索单个片段、视频片段或视觉块。 | 使用基于常规 Vector metric 的 Element-level Search。 | Struct 元素级，可在支持时返回偏移量。 | [使用 StructArray 进行基础向量搜索](./search-with-struct-array) |
| 将 Element-level Vector Search 限制在满足 Scalar 条件的元素内。 | 使用 `element_filter`。 | Element-level 过滤；结果形状取决于搜索类型。 | [使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays) |
| 根据满足条件的 Struct 元素数量选择 Entity。 | 使用 `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST` 或 `MATCH_EXACT`。 | Entity 级。 | [StructArray 操作符](./struct-array-filtering) |
| 在 StructArray Vector subfield 上使用评分或距离边界。 | 使用 Element-level Range Search。 | Struct 元素级。 | [使用 StructArray 进行范围搜索](./range-search-with-struct-arrays) |
| 在 Element-level Search 后每个父 Entity 最多返回一个结果。 | 按 Primary Key 使用 Grouping Search。 | 分组后为 Entity 级。 | [使用 StructArray 进行分组搜索](./grouping-search-with-struct-array) |
| 将 StructArray Element Search 与另一个 Vector Field 组合。 | 使用 Hybrid Search，其中一个 AnnSearchRequest 指向 StructArray Vector subfield。 | Element-level 子搜索，Entity 级重排。 | [使用 StructArray 进行 Hybrid Search](./hybrid-search-with-struct-array) |

## 理解两种搜索模型 \{#understand-the-two-search-models}

<Grid columnSize="2" widthRatios="50,50">

    <div>

        ### EmbeddingList Search\{#embeddinglist-search}

        EmbeddingList Search 会把 StructArray Vector subfield 中的向量视为父 Entity 的一个 EmbeddingList。查询本身也是一个 EmbeddingList。Zilliz Cloud 使用 `MAX_SIM*` metric 比较查询 EmbeddingList 和已存储的 EmbeddingList，并返回匹配的 Entity。

        - 查询数据：EmbeddingList。

        - Metric 类型族：`MAX_SIM*`。

        - 结果粒度：Entity 级。

        - 适合：文档级或页面级 late-interaction 检索。

    </div>

    <div>

        ### Element-level Search\{#element-level-search}

        Element-level Search 会把每个 Struct 元素视为独立的 Vector Search 候选项。每个命中项表示 StructArray Field 内部匹配到的元素，未分组结果可以暴露元素偏移量。

        - 查询数据：常规 Vector。

        - Metric 类型族：常规 Vector metric。

        - 结果粒度：Struct 元素级。

        - 适合：片段级、视频片段级或视觉块级检索。

    </div>

</Grid>

<Admonition type="warning" icon="🚧" title="警告">

如果 Collection 同时需要 EmbeddingList Search 和 Element-level Search，请使用两个独立的 Vector subfield。一个 Vector Field 或 Vector subfield 只能接受一个 Index，而两种搜索模式需要不同的 metric 类型族。

</Admonition>

## 文档地图 \{#documentation-map}

StructArray 文档分为建模页面和搜索页面。使用建模页面定义并准备数据，使用搜索页面选择合适的 retrieval 和 filtering 行为。

| 分类 | 页面 | 用途 |
| --- | --- | --- |
| 建模 | [创建 StructArray Field](./create-struct-array) | 定义 Struct Schema 并添加 StructArray Field。 |
| 建模 | [向 StructArray Field 插入数据](./insert-struct-array) | 准备并插入嵌套 StructArray 数据。 |
| 建模 | [为 StructArray Field 创建 Index](./index-struct-array) | 在 StructArray subfield 上创建 Vector 和 Scalar Index。 |
| 参考 | [StructArray 限制](./struct-array-limits) | 检查 Schema、数据类型、Index、Search、Filter 和版本限制。 |
| 搜索 | [使用 StructArray 进行基础向量搜索](./search-with-struct-array) | 比较 EmbeddingList Search 与 Element-level Vector Search。 |
| 搜索 | [使用 StructArray 进行范围搜索](./range-search-with-struct-arrays) | 在 StructArray Vector subfield 上使用范围约束。 |
| 搜索 | [使用 StructArray 进行分组搜索](./grouping-search-with-struct-array) | 按 Primary Key 对 Element-level Search 结果分组。 |
| 搜索 | [使用 StructArray 进行 Hybrid Search](./hybrid-search-with-struct-array) | 将 StructArray Element-level Search 与其他 Vector Search 组合。 |
| 搜索 | [使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays) | 在 Search、Query 和 Hybrid Search 中使用 StructArray Filter。 |
| 搜索 | [使用 EmbeddingList 搜索：ColBERT 和 ColPali](./tutorial-colbert-colpali) | 使用 StructArray 构建 ColBERT 和 ColPali 风格的检索系统。 |
| 过滤 | [StructArray 操作符](./struct-array-filtering) | 参考 `element_filter` 和 `MATCH_*` operator 的语法。 |

## 首先检查的关键限制 \{#key-limits-to-check-first}

- Struct 可用作 Array Field 的 element type。它不会作为顶层 Collection Field 使用。

- 同一个 StructArray Field 中的所有 Struct 元素共享一个预定义 Schema。

- Vector subfield 在 Search 前需要 Index。EmbeddingList Search 使用 `MAX_SIM*` metric，而 Element-level Search 使用常规 Vector metric。

- `element_filter` 和 `MATCH_*` 用于 StructArray Field 内的 Scalar subfield。只在这些 operator 中使用 `$[subfield]`。

- 某些搜索组合受版本或模式限制。在依赖 Range Search、Grouping Search、Hybrid Search、Nullable Field 或动态添加 Field 前，请检查 [StructArray 限制](./struct-array-limits)。

## 下一步 \{#next-steps}

1. 要设计 Schema，请阅读 [创建 StructArray Field](./create-struct-array)。

1. 要准备数据，请阅读 [向 StructArray Field 插入数据](./insert-struct-array)。

1. 要选择 Index，请阅读 [为 StructArray Field 创建 Index](./index-struct-array)。

1. 要搜索 StructArray Vector subfield，请从 [使用 StructArray 进行基础向量搜索](./search-with-struct-array) 开始。

1. 要过滤 StructArray Scalar subfield，请阅读 [StructArray 操作符](./struct-array-filtering) 和 [使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays)。

