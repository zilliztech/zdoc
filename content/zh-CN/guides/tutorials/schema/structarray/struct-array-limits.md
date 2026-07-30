---
title: "StructArray 限制 | Cloud"
slug: /struct-array-limits
sidebar_label: "StructArray 限制"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray 支持范围涵盖 Schema 定义、insert payload、Index、Search mode，以及 StructArray 专用 Filter。在生产中依赖 StructArray 行为前，请使用本文作为限制参考。 | Cloud"
type: origin
token: RANTwGTbUizuOOk4JQYcVZPbn7f
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray 限制

StructArray 支持范围涵盖 Schema 定义、insert payload、Index、Search mode，以及 StructArray 专用 Filter。在生产中依赖 StructArray 行为前，请使用本文作为限制参考。

大多数 StructArray 限制来自三个方面：StructArray Schema 模型、为 Vector subfield 选择的 Search mode，以及 Collection 运行所在的 Zilliz Cloud 版本。

## 限制概览 \{#limits-at-a-glance}

| 范围 | 限制 |
| --- | --- |
| Schema 形状 | Struct 只能用作 Array Field 的 element type。不支持将 Struct 作为顶层 Collection Field。 |
| Subfield Schema | 同一个 StructArray Field 中的所有 Struct 元素共享一个预定义 Struct Schema。 |
| Capacity | `max_capacity` 是必需的，并限制一个 Entity 可以在 StructArray Field 中存储多少个 Struct 元素。 |
| Subfield 变更 | 创建 StructArray Field 后，不能向该现有 StructArray Field 添加 subfield。 |
| Subfield path | 对 Index、Search 目标、Output Field 和 Filter 使用 `chunks[emb]` 等 `structArray[subfield]` path。不要使用 `chunks.emb`。 |
| Insert 形状 | 将 StructArray Field 作为对象数组插入。不要在 insert payload 内使用路径语法。 |
| Vector Index | 一个 Vector Field 或 Vector subfield 只能接受一个 Index。EmbeddingList Search 和 Element-level Search 请使用独立的 Vector subfield。 |
| Functions | StructArray Field 内部的 Field 或 subfield 不支持 Field function。 |
| Nullable Field | Nullable StructArray Field 受版本限制。支持时，null 作用于整个 StructArray Field，而不是单个 Struct 元素。 |
| Dynamic add Field | 向现有 Collection 添加 StructArray Field 受版本限制，并要求新增 Field 为 Nullable。 |

## Schema 限制 \{#schema-limits}

| 限制 | 详情 |
| --- | --- |
| Struct 不是顶层 Field type。 | 使用 `datatype=DataType.ARRAY`、`element_type=DataType.STRUCT` 和 `struct_schema` 创建 StructArray Field。 |
| 所有元素共享一个 Schema。 | StructArray Field 中的每个 Struct 元素都遵循相同的 subfield 列表和 subfield 数据类型。 |
| `max_capacity` 是必需的。 | 一个 Entity 中 Struct 元素数量不能超过 StructArray Field 配置的 `max_capacity`。 |
| 现有 subfield 是固定的。 | 不能向现有 StructArray Field 追加新的 subfield。如需更改 subfield Schema，请删除 StructArray Field，然后使用更新后的 Schema 重新添加。 |
| 不支持嵌套 StructArray。 | StructArray Field 不能包含嵌套的 `Array`、`ArrayOfVector`、`Struct` 或 `ArrayOfStruct` subfield。 |
| StructArray 内部不支持 Function。 | 不要为 StructArray Field 或其 subfield 定义 Field function。 |

关于 Schema 创建示例，请参阅 [创建 StructArray Field](./create-struct-array)。

## 支持的 subfield 数据类型 \{#supported-subfield-data-types}

StructArray subfield 会映射到物理上的数组式存储。下表列出支持和不支持的物理类型。

| Struct subfield 物理类型 | 支持情况 | 说明 |
| --- | --- | --- |
| `Array<Bool>` | 支持 | 将 subfield 定义为 `DataType.BOOL`。 |
| `Array<Int8/Int16/Int32/Int64>` | 支持 | 将 subfield 定义为 `DataType.INT8`、`DataType.INT16`、`DataType.INT32` 或 `DataType.INT64`。 |
| `Array<Float/Double>` | 支持 | 将 subfield 定义为 `DataType.FLOAT` 或 `DataType.DOUBLE`。 |
| `Array<VarChar>` | 支持 | 将 subfield 定义为 `DataType.VARCHAR` 并设置 `max_length`。 |
| `ArrayOfVector<FloatVector>` | 支持 | 将 subfield 定义为 `DataType.FLOAT_VECTOR` 并设置 `dim`。 |
| `ArrayOfVector<Float16Vector>` | 支持 | 将 subfield 定义为 `DataType.FLOAT16_VECTOR` 并设置 `dim`。 |
| `ArrayOfVector<BFloat16Vector>` | 支持 | 将 subfield 定义为 `DataType.BFLOAT16_VECTOR` 并设置 `dim`。 |
| `ArrayOfVector<Int8Vector>` | 支持 | 将 subfield 定义为 `DataType.INT8_VECTOR` 并设置 `dim`。 |
| `ArrayOfVector<BinaryVector>` | 支持 | 将 subfield 定义为 `DataType.BINARY_VECTOR` 并设置 `dim`。 |
| `ArrayOfVector<SparseFloatVector>` | 不支持 | StructArray Field 不支持 Sparse vector subfield。 |
| `Array<String>` | 不支持 | 使用 `VARCHAR`，不要使用 `String`。 |
| `Array<JSON>` | 不支持 | StructArray Field 不支持 JSON subfield。 |
| `Array<Geometry>` | 不支持 | StructArray Field 不支持 Geometry subfield 和 GIS function。 |
| `Array<Text>` | 不支持 | StructArray Field 不支持 Text subfield。 |
| `Array<Timestamptz>` | 不支持 | StructArray Field 不支持 Timestamptz subfield 和 time-specific expression。 |
| 嵌套的 `Array`、`ArrayOfVector`、`Struct` 或 `ArrayOfStruct` | 不支持 | StructArray Field 不支持嵌套数组、Vector 数组、Struct 或 Array-of-Struct subfield。 |

## Nullable 和 dynamic schema 限制 \{#nullable-and-dynamic-schema-limits}

Nullable StructArray 行为和动态添加 StructArray Field 都受版本限制。

| 能力 | 限制 |
| --- | --- |
| Nullable StructArray Field | 仅在包含 Nullable StructArray 和 Nullable Vector 数组支持的版本中可用。 |
| Python 中的 null value | 在 Python 中使用 `None` 插入 null StructArray value。不要使用 `Null` 或 `null`。 |
| Null 作用范围 | Null 作用于整个 StructArray Field。例如，只有当 `chunks` 为 Nullable 时，`chunks=None` 才有效。 |
| 部分为 null 的 StructArray value | 当 StructArray Field 包含有效数组值时，不要在同一个 value 中混合 null subfield array 和有效 subfield array。 |
| Dynamic add StructArray Field | 仅在包含 dynamic StructArray Field 支持的版本中可用。 |
| Dynamic add 的 Nullable 要求 | 向现有 Collection 添加的 StructArray Field 必须是 Nullable，因为已有 Entity 没有新 Field 的值。 |
| Dynamic add 后的已有 Entity | 已有 Entity 会在新增 StructArray Field 的所有 subfield 上返回 `null`。 |

在 Milvus v3.0.x 中，Nullable StructArray Field、Nullable Vector 数组和动态添加 StructArray Field 可用。

在兼容 Milvus v3.0.x 的 cluster 中，Nullable StructArray Field、Nullable Vector 数组和动态添加 StructArray Field 可用。

关于 Nullable StructArray Field 的插入示例，请参阅 [向 StructArray Field 插入数据](./insert-struct-array)。

## 插入限制 \{#insert-limits}

| 限制 | 详情 |
| --- | --- |
| Payload 结构 | 将 StructArray Field 作为 Struct 对象数组插入，例如 `chunks: [{"text": "...", "emb": [...]}]`。 |
| Subfield 名称 | 在每个 Struct 对象内部使用 `text` 和 `emb` 等 subfield 名称，不要使用 `chunks[text]` 等 path。 |
| Schema 对齐 | 每个 Struct 元素都必须匹配 Struct Schema。 |
| 容量 | 一个 Entity 中 Struct 元素数量不能超过 `max_capacity`。 |
| Vector dimension | Vector 值必须匹配对应 Vector subfield 配置的 `dim`。 |
| 搜索模式重复 | 如果同时需要 EmbeddingList Search 和 Element-level Search，请将 Vector 写入两个独立的 Vector subfield。 |

## Index 和 metric 限制 \{#index-and-metric-limits}

StructArray Vector subfield 可以为 EmbeddingList Search 或 Element-level Search 创建 Index。同一个 Vector subfield 不能同时使用两个 metric 类型族，因为每个 Vector Field 或 Vector subfield 只能接受一个 Index。

| Search mode | Metric 类型族 | 结果层级 |
| --- | --- | --- |
| EmbeddingList Search | `MAX_SIM`、`MAX_SIM_COSINE`、`MAX_SIM_IP`、`MAX_SIM_L2`，或 binary `MAX_SIM_*` metric | Entity 级结果。 |
| Element-level Search | `L2`、`IP`、`COSINE`、`HAMMING` 或 `JACCARD` 等常规 Vector metric | Element-level 结果，可包含匹配元素偏移量。 |

同时需要两种模式时，请使用独立的 Vector subfield。例如，使用 `chunks[emb_list_vector]` 做 EmbeddingList Search，使用 `chunks[emb]` 做 Element-level Search。

规划 Collection Schema 时，StructArray Vector subfield 会计入 Vector subfield。请确保 Vector Field 和 Vector subfield 总数符合目标版本和服务层级的限制。

关于支持的 Index type 和 metric type matrix，请参阅 [为 StructArray Field 创建 Index](./index-struct-array)。

## Search 限制 \{#search-limits}

| Search 行为 | 支持情况和限制 |
| --- | --- |
| Basic EmbeddingList Search | 支持在使用 `MAX_SIM*` metric 创建 Index 的 StructArray Vector subfield 上执行。返回 Entity 级结果。 |
| Basic Element-level Search | 支持在使用常规 Vector metric 创建 Index 的 StructArray Vector subfield 上执行。可以返回匹配元素偏移量。 |
| Range Search | 根据目标版本的 Search mode 和 Index/metric 支持情况而定。对于 Element-level StructArray request 的 Hybrid Search range 行为，请检查目标版本。 |
| Grouping Search | Element-level Grouping Search 可以返回偏移量。Element-level StructArray request 的 Hybrid Search group-by 行为受版本限制。 |
| Hybrid Search | 只有目标版本支持对应搜索组合时，Hybrid Search request 才可以包含 StructArray Vector subfield request。每个 request 仍遵循已创建 Index 的 Vector subfield metric 类型族。 |
| Offset output | 偏移量可用于 Element-level Search 结果。EmbeddingList Search 返回 Entity 级结果，并且不以元素偏移量作为主要结果单元。 |

## Filter 和 operator 限制 \{#filter-and-operator-limits}

StructArray Scalar Filtering 由 `element_filter` 和 `MATCH_*` family 等 StructArray operator 处理。详细 predicate support matrix 请参阅 [StructArray 操作符](./struct-array-filtering)。

概括来说：

- 只在 StructArray operator 内部使用 `$[subfield]`。

- 使用 Scalar subfield 编写 Scalar predicate。

- 不要将 Vector subfield 用作 `$[...]` Scalar predicate 输入。

- StructArray Element-level predicate 不支持 JSON path syntax、JSON function、array container function、text match function、Geometry / GIS function 和 Timestamptz expression。

- 优先使用 `$[has_code] == true` 等显式布尔比较，而不是裸布尔表达式。

## 相关页面 \{#related-pages}

1. 要创建 StructArray Field，请阅读 [创建 StructArray Field](./create-struct-array)。

1. 要插入数据，请阅读 [向 StructArray Field 插入数据](./insert-struct-array)。

1. 要创建 Vector 和 Scalar Index，请阅读 [为 StructArray Field 创建 Index](./index-struct-array)。

1. 要查看 StructArray Filter syntax，请阅读 [StructArray 操作符](./struct-array-filtering)。

