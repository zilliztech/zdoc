---
title: "创建 StructArray Field | BYOC"
slug: /create-struct-array
sidebar_label: "创建 StructArray Field"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "当一个 Entity 需要包含有序的结构化元素列表时，可以创建 StructArray Field。StructArray Field 是一个 element type 为 Struct 的 Array Field。每个 Struct 元素都遵循相同的 Schema，并且可以包含 Scalar subfield、Vector subfield，或二者同时包含。 | BYOC"
type: origin
token: KaxHwqbfaiszEUkk8CScBYPSnSt
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 创建 StructArray Field

当一个 Entity 需要包含有序的结构化元素列表时，可以创建 StructArray Field。StructArray Field 是一个 element type 为 Struct 的 Array Field。每个 Struct 元素都遵循相同的 Schema，并且可以包含 Scalar subfield、Vector subfield，或二者同时包含。

本文介绍如何定义 Struct Schema、将其添加为 StructArray Field、选择后续用于 Search 和 Filtering 的 subfield，以及在插入或创建 Index 前需要理解的 Schema 规则。

## 开始之前 \{#before-you-begin}

本文使用名为 `tech_articles` 的 Collection。每个 Entity 表示一篇技术文章，`chunks` Field 以 Struct 元素存储片段级数据。

| Field | 类型 | 用途 |
| --- | --- | --- |
| `doc_id` | `INT64` | 文章的 Primary Key。 |
| `title` | `VARCHAR` | 文章标题。 |
| `category` | `VARCHAR` | 文章级分类。 |
| `title_vector` | `FLOAT_VECTOR` | 文章级 Vector Field，用于后续 Hybrid Search 示例。 |
| `chunks` | `ARRAY<STRUCT>` | 存储片段级文本、元数据和 embedding 的 StructArray Field。 |

`chunks` StructArray Field 包含以下 subfield。

| Subfield | 类型 | 用途 |
| --- | --- | --- |
| `text` | `VARCHAR` | 片段文本。 |
| `section` | `VARCHAR` | 章节名称，例如 `index`、`search` 或 `filter`。 |
| `page` | `INT64` | 片段的页码或逻辑位置。 |
| `quality_score` | `FLOAT` | 用于 Scalar Filtering 和 range 示例的片段级评分。 |
| `has_code` | `BOOL` | 片段是否包含代码。 |
| `emb_list_vector` | `FLOAT_VECTOR` | 用于基于 `MAX_SIM*` metric 的 EmbeddingList Search 的 Vector subfield。 |
| `emb` | `FLOAT_VECTOR` | 用于 Element-level Search 的 Vector subfield。 |

<Admonition type="info" icon="📘" title="说明">

一个 Vector Field 或 Vector subfield 只能接受一个 Index。如果同时需要 EmbeddingList Search 和 Element-level Search，请定义两个独立的 Vector subfield。在此示例中，`chunks[emb_list_vector]` 用于 EmbeddingList Search，`chunks[emb]` 用于 Element-level Search。

</Admonition>

## 支持的 subfield 数据类型 \{#supported-subfield-data-types}

StructArray Field 会为每个 Struct subfield 存储一个数组值。定义 Struct Schema 时，请从受支持的 Scalar 和 Vector 类型族中选择 subfield 类型。

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
| 嵌套的 `Array`、`ArrayOfVector`、`Struct` 或 `ArrayOfStruct` | 不支持 | StructArray Field 不能包含嵌套数组、嵌套 Vector 数组、嵌套 Struct Field 或嵌套 Array-of-Struct Field。 |

关于特定版本支持、Nullable 行为和其他限制，请参阅 [StructArray 限制](./struct-array-limits)。

## 创建带有 StructArray Field 的 Collection \{#create-a-collection-with-a-structarray-field}

要创建 StructArray Field，请先定义每个元素使用的 Struct Schema。然后添加 Array Field，并将其 element type 设置为 Struct。

1. 创建 Collection Schema。

1. 添加 Collection 级 Field，例如 Primary Key 和文章级 Field。

1. 为 StructArray Field 内部存储的元素创建 Struct Schema。

1. 向 Struct Schema 添加 Scalar 和 Vector subfield。

1. 添加一个 `element_type=DataType.STRUCT` 的 Array Field。

1. 将 `struct_schema` 设置为 Struct Schema。

1. 设置 `max_capacity`，限制每个 Entity 可以在该 Field 中存储多少个 Struct 元素。

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

schema = client.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# Collection-level fields.
schema.add_field(
    field_name="doc_id",
    datatype=DataType.INT64,
    is_primary=True,
)
schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512,
)
schema.add_field(
    field_name="category",
    datatype=DataType.VARCHAR,
    max_length=128,
)
schema.add_field(
    field_name="title_vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)

# Struct schema used by each element in the StructArray field.
chunk_schema = client.create_struct_field_schema()
chunk_schema.add_field(
    field_name="text",
    datatype=DataType.VARCHAR,
    max_length=65535,
)
chunk_schema.add_field(
    field_name="section",
    datatype=DataType.VARCHAR,
    max_length=128,
)
chunk_schema.add_field(
    field_name="page",
    datatype=DataType.INT64,
)
chunk_schema.add_field(
    field_name="quality_score",
    datatype=DataType.FLOAT,
)
chunk_schema.add_field(
    field_name="has_code",
    datatype=DataType.BOOL,
)

# Vector subfield for EmbeddingList search.
chunk_schema.add_field(
    field_name="emb_list_vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)

# Vector subfield for element-level search.
chunk_schema.add_field(
    field_name="emb",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)

# Add the StructArray field.
schema.add_field(
    field_name="chunks",
    datatype=DataType.ARRAY,
    element_type=DataType.STRUCT,
    struct_schema=chunk_schema,
    max_capacity=1000,
)

client.create_collection(
    collection_name="tech_articles",
    schema=schema,
)
```

## 理解 StructArray Field path \{#understand-structarray-field-paths}

创建 StructArray Field 后，请使用 `structArray[subfield]` 路径语法引用它的 subfield。创建 Index、搜索 Vector subfield、输出 subfield 或构建 Scalar Filter 时都使用此语法。

| Path | 含义 | 常见用途 |
| --- | --- | --- |
| `chunks[text]` | 每个 Struct 元素内的 `text` subfield。 | Output Field 或 Scalar Filtering。 |
| `chunks[section]` | 每个片段的章节标签。 | Scalar Filtering。 |
| `chunks[quality_score]` | 片段级质量评分。 | Scalar Filtering 或 Scalar Index。 |
| `chunks[emb_list_vector]` | 作为 EmbeddingList 使用的 Vector subfield。 | 基于 `MAX_SIM*` 的 EmbeddingList Search。 |
| `chunks[emb]` | 由每个 Struct 元素独立使用的 Vector subfield。 | Element-level Vector Search。 |

## 将 StructArray Field 设为 Nullable \{#make-a-structarray-field-nullable}

Clusters compatible with Milvus v3.0.x support Nullable StructArray Field。Nullable StructArray Field 允许 Entity 为整个 StructArray Field 存储 `null`。

```python
schema.add_field(
    field_name="chunks",
    datatype=DataType.ARRAY,
    element_type=DataType.STRUCT,
    struct_schema=chunk_schema,
    max_capacity=1000,
    nullable=True,
)
```

<Admonition type="warning" icon="🚧" title="警告">

Nullable StructArray Field 仅在 clusters compatible with Milvus v3.0.x 中可用。对于 Nullable StructArray Field，Entity 可以提供有效的 StructArray value，也可以将整个 Field 设为 `null`。插入有效的 StructArray value 时，所有 subfield 应同时为 null 或同时具有有效值。如果某些 subfield 为 null 而其他 subfield 为有效值，会导致错误。详情请参阅 [StructArray 限制](./struct-array-limits)。

</Admonition>

## 向现有 Collection 添加 StructArray Field \{#add-a-structarray-field-to-an-existing-collection}

Clusters compatible with Milvus v3.0.x support 向现有 Collection 添加 StructArray Field。新增的 StructArray Field 必须是 Nullable，因为 Collection 中已存在的 Entity 没有这个新 Field 的值。

要向现有 Collection 添加 StructArray Field，请先定义 Struct Schema。然后调用 `add_collection_struct_field()` 并设置 `nullable=True`。

```python
chunk_schema = client.create_struct_field_schema()
chunk_schema.add_field(
    field_name="text",
    datatype=DataType.VARCHAR,
    max_length=65535,
)
chunk_schema.add_field(
    field_name="section",
    datatype=DataType.VARCHAR,
    max_length=128,
)
chunk_schema.add_field(
    field_name="page",
    datatype=DataType.INT64,
)
chunk_schema.add_field(
    field_name="quality_score",
    datatype=DataType.FLOAT,
)
chunk_schema.add_field(
    field_name="has_code",
    datatype=DataType.BOOL,
)
chunk_schema.add_field(
    field_name="emb_list_vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)
chunk_schema.add_field(
    field_name="emb",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)

client.add_collection_struct_field(
    collection_name="tech_articles",
    field_name="chunks",
    struct_schema=chunk_schema,
    max_capacity=1000,
    nullable=True,
)
```

添加 StructArray Field 后，已有 Entity 会在该新 Field 的所有 subfield 上返回 `null`。

创建 StructArray Field 后，不能再向该现有 StructArray Field 添加新的 subfield。如果后续需要更多元素属性，请调用 `drop_collection_field()` 删除 StructArray Field，然后用更新后的 Struct Schema 添加新的 StructArray Field。

```python
client.drop_collection_field(
    collection_name="tech_articles",
    field_name="chunks",
)

client.add_collection_struct_field(
    collection_name="tech_articles",
    field_name="chunks",
    struct_schema=updated_chunk_schema,
    max_capacity=1000,
    nullable=True,
)
```

## Schema 规则 \{#schema-rules}

| 规则 | 说明 |
| --- | --- |
| Struct 用作 Array element type。 | 将 StructArray Field 创建为 `element_type=STRUCT` 的 Array Field。不要将 Struct 创建为顶层 Collection Field。 |
| 所有元素共享一个 Schema。 | 同一个 StructArray Field 中的每个 Struct 元素都遵循为该 Field 定义的 Struct Schema。 |
| `max_capacity` 是必需的。 | 它限制每个 Entity 可以在 StructArray Field 中存储多少个 Struct 元素。 |
| 只能使用受支持的 subfield 类型。 | 使用 StructArray 支持的 Scalar 和 Vector subfield 类型。不要定义 JSON、Geometry、Text、Timestamptz、SparseFloatVector 或嵌套 Struct / Array subfield。 |
| Vector subfield 在 Search 前需要 Index。 | 运行 Vector Search 前，请在 `chunks[emb_list_vector]` 或 `chunks[emb]` 等 path 上创建 Index。 |
| 一个 Vector subfield 只有一个 Index。 | 如果同时需要 EmbeddingList Search 和 Element-level Search，请创建两个独立的 Vector subfield。 |
| 现有 StructArray subfield 是固定的。 | 创建 StructArray Field 后，不应期望继续向同一个 StructArray Field 添加更多 subfield。 |
| Struct 内部不支持 Function。 | 不要为 StructArray Field 或其 subfield 定义 Function。 |
| Scalar subfield 应匹配过滤需求。 | 只有在后续需要过滤、分组或输出时，才添加 `section`、`quality_score` 或 `has_code` 等 Field。 |

## 常见错误 \{#common-mistakes}

- 将 `DataType.STRUCT` 创建为顶层 Collection Field，而不是将其用作 Array Field 的 element type。

- 忘记在 StructArray Field 上设置 `max_capacity`。

- 定义不受支持的 subfield 类型，例如 JSON、Geometry、Text、Timestamptz、SparseFloatVector、嵌套 Array、嵌套 Struct 或 Array-of-Struct。

- 将 `String` 用作 subfield 类型。请使用 `VARCHAR` 并设置 `max_length`。

- 用一个 Vector subfield 同时承担 EmbeddingList Search 和 Element-level Search。

- 只添加 Vector subfield，却忘记后续 Filtering 所需的 Scalar subfield，例如 `section`、`quality_score` 或 `has_code`。

- 将 Vector subfield 当作 `$[...]` Scalar predicate 输入。Vector subfield 用于 Vector Search，Scalar subfield 用于 Scalar predicate。

- 假设 StructArray Field 创建后还能继续向现有 Field 添加新的 subfield。

- 使用 `chunks.emb` 或 `chunks.emb_list_vector`，而不是必需的路径语法 `chunks[emb]` 或 `chunks[emb_list_vector]`。

- 假设 Nullable StructArray 行为在所有目标版本中都可用。

## 下一步 \{#next-steps}

1. 要向 StructArray Field 插入嵌套数据，请阅读 [向 StructArray Field 插入数据](./insert-struct-array)。

1. 要创建 Vector 和 Scalar Index，请阅读 [为 StructArray Field 创建 Index](./index-struct-array)。

1. 要搜索 StructArray Vector subfield，请阅读 [使用 StructArray 进行基础向量搜索](./search-with-struct-array)。

1. 要查看支持的数据类型、Nullable 行为和特定版本限制，请阅读 [StructArray 限制](./struct-array-limits)。

