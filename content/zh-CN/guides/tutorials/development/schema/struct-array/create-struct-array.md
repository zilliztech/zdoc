---
title: "创建 StructArray Field | Cloud"
slug: /create-struct-array
sidebar_label: "创建 StructArray Field"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "当一个 Entity 需要包含有序的结构化元素列表时，可以创建 StructArray Field。StructArray Field 是一个 element type 为 Struct 的 Array Field。每个 Struct 元素都遵循相同的 Schema，并且可以包含 Scalar subfield、Vector subfield，或二者同时包含。 | Cloud"
type: origin
token: KaxHwqbfaiszEUkk8CScBYPSnSt
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

<Admonition type="info" title="说明">

一个 Vector Field 或 Vector subfield 只能接受一个 Index。如果同时需要 EmbeddingList Search 和 Element-level Search，请定义两个独立的 Vector subfield。在此示例中，`chunks[emb_list_vector]` 用于 EmbeddingList Search，`chunks[emb]` 用于 Element-level Search。

</Admonition>

此外，subfield 还可以允许元素级 null（element-level null）：标量或向量子字段设置 `nullable=True`，array 子字段设置 `element_nullable=True`，允许单个 Struct 元素中的该子字段为 null。详情参见下文「在 Struct 元素中允许 null 值」。

## 支持的 subfield 数据类型 \{#supported-subfield-data-types}

StructArray Field 会为每个 Struct subfield 存储一个数组值。定义 Struct Schema 时，请从受支持的 Scalar、标量 array 和 Vector 类型族中选择 subfield 类型。

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
| `Array<Array>` | 支持 | 将 subfield 定义为 `DataType.ARRAY`，设置标量 `element_type` 和内层数组的 `max_capacity`。每个 Struct 元素持有一个内层数组。在子字段上设置 `nullable=True` 允许内层数组为 null，设置 `element_nullable=True` 允许内层数组中的值为 null。 |

## 添加标量 array 子字段 \{#add-a-scalar-array-subfield}

Struct subfield 可以是标量 `ARRAY`。此时每个 Struct 元素持有一个内层数组，例如每个 chunk 对应一个标签列表。定义该 subfield 时使用 `DataType.ARRAY`、标量 `element_type` 以及内层数组的 `max_capacity`。

```python
chunk_schema.add_field(
    field_name="tags",
    datatype=DataType.ARRAY,
    element_type=DataType.VARCHAR,
    max_capacity=16,
    max_length=64,
)
```

array 子字段遵循以下规则：

- 内层数组只能持有标量值，不能持有向量、Struct 元素或另一个数组。

- subfield 的 `max_capacity` 限制内层数组；StructArray Field 的 `max_capacity` 仍然限制 Struct 元素的数量。

- array 子字段不支持标量索引。

- 在过滤中使用 `array_contains`、`array_contains_any`、`array_contains_all` 和 `array_length` 操作 `$[tags]`（位于 `element_filter` 或 `MATCH_*` 中），或用于 `chunks[0][tags]` 这类位置路径。详情参见[StructArray 操作符](./struct-array-filtering)。

## 在 Struct 元素中允许 null 值 \{#allow-null-values-in-struct-elements}

标量、向量或 array 子字段可以允许在单个 Struct 元素中为该子字段存储 null 值（即 **element-nullable 子字段**）。在标量或向量子字段上设置 `nullable=True`；在 array 子字段上，设置 `nullable=True` 允许整个内层数组为 null，设置 `element_nullable=True` 允许内层数组中的值为 null。例如，一个 chunk 可以没有检测到的语言，而它的其他 subfield 仍有值。

下面的示例创建 `tech_articles` 集合，其 Schema 即[向 StructArray Field 插入数据](./insert-struct-array)中元素级 null 示例所使用的完整 Schema：包含第一个示例中的全部 subfield，外加一个 element-nullable 的 `lang` subfield 和一个 element-nullable 的 `tags` array 子字段。

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="{{var.example_endpoint}}",
    token="{{var.example_token}}",
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

# An element-nullable scalar subfield.
chunk_schema.add_field(
    field_name="lang",
    datatype=DataType.VARCHAR,
    max_length=16,
    nullable=True,
)

# An element-nullable array subfield: nullable=True allows a null inner
# array and element_nullable=True allows null values inside the inner array.
chunk_schema.add_field(
    field_name="tags",
    datatype=DataType.ARRAY,
    element_type=DataType.VARCHAR,
    max_capacity=16,
    max_length=64,
    nullable=True,
    element_nullable=True,
)

# Add the StructArray field. nullable=True applies to the whole field.
schema.add_field(
    field_name="chunks",
    datatype=DataType.ARRAY,
    element_type=DataType.STRUCT,
    struct_schema=chunk_schema,
    max_capacity=1000,
    nullable=True,
)

client.create_collection(
    collection_name="tech_articles",
    schema=schema,
)
```

元素级 null 遵循以下规则：

- 行级 `nullable` 作用于整个 StructArray Field，只能在父 Field 上设置。元素级 null 则设置在 subfield 自身：标量或向量子字段设置 `nullable=True`，array 子字段设置 `element_nullable=True`。

- Struct 元素本身不能为 null。若需表达 null，应将元素内相应 subfield 的值设为 null。

- 插入数据时，Struct 元素中的 element-nullable 子字段可以省略，也可以显式设为 `None`，两种写法均存储 null 值。非 element-nullable 的子字段必须出现在每个 Struct 元素中。

- 在 array 子字段上，`nullable=True` 允许某个 Struct 元素的内层数组整体为 null，`element_nullable=True` 允许内层数组中的值为 null。空的内层数组不是 null。

- element-nullable 向量子字段（`nullable=True`）仅支持元素级搜索；对其使用 `MAX_SIM*` 度量或 EmbeddingList 搜索会被拒绝，且 null 向量不参与搜索。

- element-nullable 子字段不支持标量索引。

- 在过滤条件中，subfield 为 null 会使元素谓词的结果为 unknown 而非 false。可在 `element_filter` 或 `MATCH_*` 中使用 `$[lang] is null` 或 `$[lang] is not null` 进行判断，详见[StructArray 操作符](./struct-array-filtering)。

<Tabs groupId="code" defaultValue='go' values={[{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "{{var.example_endpoint}}",
    APIKey:  "{{var.example_token}}",
})
if err != nil {
    fmt.Println(err)
    return
}

schema := entity.NewSchema().WithDynamicFieldEnabled(false)

// Collection-level fields.
schema.WithField(entity.NewField().
        WithName("doc_id").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true))
schema.WithField(entity.NewField().
        WithName("title").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(512))
schema.WithField(entity.NewField().
        WithName("category").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(128))
schema.WithField(entity.NewField().
        WithName("title_vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))

// Struct schema used by each element in the StructArray field.
chunkSchema := entity.NewStructSchema()
chunkSchema.WithField(entity.NewField().
        WithName("text").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(65535))
chunkSchema.WithField(entity.NewField().
        WithName("section").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(128))
chunkSchema.WithField(entity.NewField().
        WithName("page").
        WithDataType(entity.FieldTypeInt64))
chunkSchema.WithField(entity.NewField().
        WithName("quality_score").
        WithDataType(entity.FieldTypeFloat))
chunkSchema.WithField(entity.NewField().
        WithName("has_code").
        WithDataType(entity.FieldTypeBool))
chunkSchema.WithField(entity.NewField().
        WithName("emb_list_vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))
chunkSchema.WithField(entity.NewField().
        WithName("emb").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))

// An element-nullable scalar subfield.
chunkSchema.WithField(entity.NewField().
        WithName("lang").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(16).
        WithNullable(true))

// An element-nullable array subfield: WithNullable(true) allows a null
// inner array and WithElementNullable(true) allows null values inside it.
chunkSchema.WithField(entity.NewField().
        WithName("tags").
        WithDataType(entity.FieldTypeArray).
        WithElementType(entity.FieldTypeVarChar).
        WithMaxCapacity(16).
        WithMaxLength(64).
        WithNullable(true).
        WithElementNullable(true))

// Add the StructArray field. WithNullable(true) applies to the whole field.
schema.WithField(entity.NewField().
        WithName("chunks").
        WithDataType(entity.FieldTypeArray).
        WithElementType(entity.FieldTypeStruct).
        WithMaxCapacity(1000).
        WithNullable(true).
        WithStructSchema(chunkSchema))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("tech_articles", schema))
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "{{var.example_endpoint}}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer {{var.example_token}}" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "schema": {
      "autoID": false,
      "enableDynamicField": false,
      "fields": [
        {"fieldName": "doc_id", "dataType": "Int64", "isPrimary": true},
        {"fieldName": "title", "dataType": "VarChar", "elementTypeParams": {"max_length": "512"}},
        {"fieldName": "category", "dataType": "VarChar", "elementTypeParams": {"max_length": "128"}},
        {"fieldName": "title_vector", "dataType": "FloatVector", "elementTypeParams": {"dim": "4"}}
      ],
      "structFields": [
        {
          "fieldName": "chunks",
          "nullable": true,
          "typeParams": {"max_capacity": "1000"},
          "fields": [
            {"fieldName": "text", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "65535"}},
            {"fieldName": "section", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "128"}},
            {"fieldName": "page", "dataType": "Array", "elementDataType": "Int64"},
            {"fieldName": "quality_score", "dataType": "Array", "elementDataType": "Float"},
            {"fieldName": "has_code", "dataType": "Array", "elementDataType": "Bool"},
            {"fieldName": "lang", "dataType": "Array", "elementDataType": "VarChar", "elementNullable": true, "elementTypeParams": {"max_length": "16"}},
            {"fieldName": "tags", "dataType": "Array", "elementDataType": "Array", "elementNullable": true, "typeSchema": {"arrayElement": {"typeParams": {"max_capacity": "16"}, "arrayElement": {"leafType": "VarChar", "nullable": true, "typeParams": {"max_length": "64"}}}}},
            {"fieldName": "emb_list_vector", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}},
            {"fieldName": "emb", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}}
          ]
        }
      ]
    }
  }'
```

</TabItem>
</Tabs>

更多 element-nullable 规则与限制（如索引与搜索行为），参见[StructArray 限制](./struct-array-limits)。

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

兼容 Milvus v3.0.x 的集群支持 Nullable StructArray Field。Nullable StructArray Field 允许 Entity 为整个 StructArray Field 存储 `null`。

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

<Admonition type="warning" title="警告">

Nullable StructArray Field 仅在 兼容 Milvus v3.0.x 的集群 中可用。对于 Nullable StructArray Field，Entity 可以提供有效的 StructArray value，也可以将整个 Field 设为 `null`。插入有效的 StructArray value 时，所有 subfield 应同时为 null 或同时具有有效值。如果某些 subfield 为 null 而其他 subfield 为有效值，会导致错误。详情请参阅 [StructArray 限制](./struct-array-limits)。

</Admonition>

## 向现有 Collection 添加 StructArray Field \{#add-a-structarray-field-to-an-existing-collection}

兼容 Milvus v3.0.x 的集群支持 向现有 Collection 添加 StructArray Field。新增的 StructArray Field 必须是 Nullable，因为 Collection 中已存在的 Entity 没有这个新 Field 的值。

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

此外，还可以通过 `add_collection_field()` 以子字段路径为现有 StructArray Field 添加单个子字段，或通过 `drop_collection_field()` 按路径删除单个子字段（StructArray Field 的最后一个子字段除外）。子字段增删在兼容 Milvus v3.0.x 的 Dedicated 集群上支持；On-Demand 集群暂不支持子字段变更，此类集群可调用 `drop_collection_field()` 删除整个 StructArray Field，再用更新后的 Struct Schema 重新添加。

### 为现有 StructArray Field 添加子字段 \{#add-a-subfield-to-an-existing-structarray-field}

可以向已持有数据的 StructArray Field 添加子字段：调用 `add_collection_field()` 并以子字段路径作为字段名（如 `chunks[lang]`），并为新增子字段设置 `nullable=True`（这也是元素级 null 能力的来源）。在 array 子字段上还需额外设置 `element_nullable=True`。新增子字段会继承 StructArray Field 的行级 `nullable` 设置和 `max_capacity`。完整步骤与规则参见[修改 Collection Schema](./add-fields-to-an-existing-collection)。

### 删除 StructArray 子字段 \{#drop-a-subfield-from-a-structarray-field}

通过 `drop_collection_field()` 传入子字段路径，即可删除现有 StructArray Field 中的单个子字段。Milvus 会将该子字段及其索引一并从 Schema 中移除。不能删除最后一个子字段、Collection 的最后一个向量字段或被 Function 使用的子字段。

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

1. 假设所有集群都可以向现有 StructArray Field 添加新的 subfield，或新增的 subfield 不允许元素级 null。

## 下一步 \{#next-steps}

1. 要向 StructArray Field 插入嵌套数据，请阅读 [向 StructArray Field 插入数据](./insert-struct-array)。

1. 要创建 Vector 和 Scalar Index，请阅读 [为 StructArray Field 创建 Index](./index-struct-array)。

1. 要搜索 StructArray Vector subfield，请阅读 [使用 StructArray 进行基础向量搜索](./search-with-struct-array)。

1. 要查看支持的数据类型、Nullable 行为和特定版本限制，请阅读 [StructArray 限制](./struct-array-limits)。

