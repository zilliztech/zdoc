---
title: "了解 Schema | Cloud"
slug: /schema-explained
sidebar_key: schema-explained
sidebar_label: "了解 Schema"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Schema 定义了 Collection 的数据结构。在创建 Collection 之前，您需要根据业务需要，设计并创建好 Collection 的 Schema。本章将介绍设计与创建 Schema 时需要注意的相关事项。 | Cloud"
type: origin
token: L2M6wPhQOic817knYpacZuhJnX2
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - schema 概述

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 了解 Schema

Schema 定义了 Collection 的数据结构。在创建 Collection 之前，您需要根据业务需要，设计并创建好 Collection 的 Schema。本章将介绍设计与创建 Schema 时需要注意的相关事项。

## 概述\{#overview}

在 Zilliz Cloud 中，Collection Schema 和传统关系型数据库中的数据表结构类似，定义了 Collection 的数据组织方式。

精心设计的 Schema 至关重要，因为它抽象了数据模型，并决定了能否通过搜索实现业务目标。此外，由于插入到集合中的每一行数据都必须遵循 Schema 定义，从而保持数据的一致性和长期质量。从技术角度看，定义明确的 Schema 可实现有序的列数据存储和更简洁的索引结构，从而提高搜索性能。

如下图所示，一个典型的 Collection Schema 包含一个主键，至少一个向量列和若干标量列。下图说明了如何将一篇文章映射成一个 Collection Schema。

![RFGTbrPmmoa7b8xAg34cRdUmnXe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/RFGTbrPmmoa7b8xAg34cRdUmnXe.png "RFGTbrPmmoa7b8xAg34cRdUmnXe")

搜索系统的数据模型设计通常包括分析业务需求，并将信息抽象为使用 Schema 表达的数据模型。例如，搜索一段文本时，必须通过 Embedding 将字面字符串转换为向量并对这些向量字段建立索引。除这一基本要求外，Schema 中可能还需要定义其他属性，如出版时间和作者。有了这些元数据（标量字段），就可以通过元数据过滤来完善语义搜索，以便返回特定日期之后或特定作者发表的文本。您还可以在搜索时要求在搜索结果中返回这些标量甚至主文本，然后在应用程序中呈现信息量更为丰富的搜索结果。您应该为每个标量分配一个以整数或字符串形式命名的唯一标识符，它们对于实现复杂的搜索逻辑至关重要。

关于如何结合您的数据完成 Schema 设计，可以参考 [Schema 设计指南](./schema-design-hands-on)。该文通过一个示例演示了关于 Schema 设计的思考过程，帮助您了解如何设计一个符合业务需求的 Collection Schema。

## 创建 Schema\{#create-schema}

您可以参考如下代码创建一个 Schema 对象。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = client.createSchema();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const schema = []
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/entity"

schema := entity.NewSchema()
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
    "fields": []
}'
```

</TabItem>
</Tabs>

## 添加主键\{#add_primary_field}

主键唯一标识一个 Entity，只支持 **Int64** 或 **VarChar** 类型的数据。具体添加方法如下：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_id",
    datatype=DataType.INT64,
    # highlight-start
    is_primary=True,
    auto_id=False,
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq; 

schema.addField(AddFieldReq.builder()
        .fieldName("my_id")
        .dataType(DataType.Int64)
        // highlight-start
        .isPrimaryKey(true)
        .autoID(false)
        // highlight-end
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_id",
    data_type: DataType.Int64,
    // highlight-start
    is_primary_key: true,
    autoID: false
    // highlight-end
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_id").
    WithDataType(entity.FieldTypeInt64).
    // highlight-start
    WithIsPrimaryKey(true).
    WithIsAutoID(false),
    // highlight-end
)
```

</TabItem>

<TabItem value='bash'>

```bash
export primaryField='{
    "fieldName": "my_id",
    "dataType": "Int64",
    "isPrimary": true
}'

export schema='{
    \"autoID\": false,
    \"fields\": [
        $primaryField
    ]
}'
```

</TabItem>
</Tabs>

当您在添加主键字段时，需要显式指定该字段为主键字段，即设置 `is_primary` 为 `True`。如果您选择使用 **Int64** 类型的主键，主键值应该类似 `12345` 这样的整数；如果您选择使用 **VarChar** 类型的主键，主键值应该类似于 `'my_entity_1234'` 这样的字符串。

您还可以通过设置 `autoId` 为 `True` 的方式让 Zilliz Cloud 自动为插入的 Entity 分配主键值。

关于主键字段的更多内容可参考[主键与 AutoId](./primary-field-auto-id)。

## 添加向量字段\{#add-vector-fields}

向量字段用于存放各种类型的稀疏和稠密向量数据。在 Zilliz Cloud 中，您可以在一个 Collection 中添加最多 4 个向量字段。具体添加方法如下：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_vector",
    datatype=DataType.FLOAT_VECTOR,
    # highlight-next-line
    dim=5
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_vector")
        .dataType(DataType.FloatVector)
        // highlight-next-line
        .dimension(5)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_vector",
    data_type: DataType.FloatVector,
    // highlight-next-line
    dim: 5
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_vector").
    WithDataType(entity.FieldTypeFloatVector).
    // highlight-next-line
    WithDim(5),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export vectorField='{
    "fieldName": "my_vector",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 5
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

在上述代码中使用的 `dim` 字段表示该字段可以存放的向量数据的维度，`FLOAT_VECTOR` 表示该字段可以存放的向量数据类型是一组 32 位浮点数。在科学计算和机器学习领域中，它们通常用来表示真数。除此之外，Zilliz Cloud 还支持如下几种向量类型：

- `FLOAT16_VECTOR`

    用于存放 16 位半精浮点数列表，通常用于内存和带宽受限的深度学习和 GPU 计算场景。

- `BFLOAT16_VECTOR`

    用于存放精度降低但指数范围与 Float32 相同的 16 位浮点数列表。这类数据通常用于深度学习场景，在降低内存占用的同时不会给准确度带来显著影响。

- `BINARY_VECTOR`

    用于存放二进制数据，通常为一组由 0 和 1 组成的数字序列。它们在图像处理和信息检索场景下的用于表示数据的紧凑特征。

- `SPARSE_FLOAT_VECTOR`

    用于存放一组非零元素及其序号，用来表示一个稀疏向量。

## 添加标量字段\{#add-scalar-fields}

通常情况下，您可以将标量字段做为向量字段的元数据添加到 Collection 中，通过向量搜索和标量过滤相结合的方式来提升搜索结果的准确性。Zilliz Cloud 支持多种标量数据类型，包括 **VarChar**、**Boolean**、**Int**、**Float**、**Double**、**Array** 和 **JSON**。

### 添加字符串类型的字段\{#add-string-fields}

在 Zilliz Cloud 中，您可以使用 VarChar 类型的字段来存放字符串数据。关于 VarChar 字段的更多内容，可参考[字符串类型](./use-string-field)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_varchar",
    datatype=DataType.VARCHAR,
    # highlight-next-line
    max_length=512
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_varchar")
        .dataType(DataType.VarChar)
        // highlight-next-line
        .maxLength(512)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_varchar",
    data_type: DataType.VarChar,
    // highlight-next-line
    max_length: 512
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_varchar").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(512),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export varCharField='{
    "fieldName": "my_varchar",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 512
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField
    ]
}"
```

</TabItem>
</Tabs>

### 添加数值类型的字段\{#add-number-fields}

Zilliz Cloud 支持的数值类型字段包括 `Int8`、`Int16`、`Int32`、`Int64`、`Float` 和 `Double`。关于数值类型的更多内容，可参考[标量数值类型](./use-number-field)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_int64",
    datatype=DataType.INT64,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_int64")
        .dataType(DataType.Int64)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_int64",
    data_type: DataType.Int64,
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_int64").
    WithDataType(entity.FieldTypeInt64),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export int64Field='{
    "fieldName": "my_int64",
    "dataType": "Int64"
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $int64Field
    ]
}"
```

</TabItem>
</Tabs>

### 添加 Boolean 类型的字段\{#add-boolean-fields}

Zilliz Cloud 支持 Boolean 类型的字段。您可以参考如下代码添加该类型的字段。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_bool",
    datatype=DataType.BOOL,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_bool")
        .dataType(DataType.Bool)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_bool",
    data_type: DataType.Boolean,
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_bool").
    WithDataType(entity.FieldTypeBool),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export boolField='{
    "fieldName": "my_bool",
    "dataType": "Boolean"
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $int64Field,
        $boolField
    ]
}"
```

</TabItem>
</Tabs>

### 添加 JSON 类型的字段\{#add-json-fields}

JSON 类型的字段用于存放半结构化的 JSON 数据。关于 JSON 类型的更多内容，可参考[JSON 类型](./use-json-fields)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_json",
    datatype=DataType.JSON,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_json")
        .dataType(DataType.JSON)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_json",
    data_type: DataType.JSON,
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_json").
    WithDataType(entity.FieldTypeJSON),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export jsonField='{
    "fieldName": "my_json",
    "dataType": "JSON"
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $int64Field,
        $boolField,
        $jsonField
    ]
}"
```

</TabItem>
</Tabs>

### 添加 Array 类型的字段\{#add-array-fields}

Array 字段用于存放列表类型的数据。Array 字段中的元素数据类型需要保持一致。关于 Array 类型的更多内容，可参考[Array 类型](./use-array-fields)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_array",
    datatype=DataType.ARRAY,
    element_type=DataType.VARCHAR,
    max_capacity=5,
    max_length=512,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_array")
        .dataType(DataType.Array)
        .elementType(DataType.VarChar)
        .maxCapacity(5)
        .maxLength(512)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_array",
    data_type: DataType.Array,
    element_type: DataType.VarChar,
    max_capacity: 5,
    max_length: 512
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_array").
    WithDataType(entity.FieldTypeArray).
    WithElementType(entity.FieldTypeInt64).
    WithMaxLength(512).
    WithMaxCapacity(5),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export arrayField='{
    "fieldName": "my_array",
    "dataType": "Array",
    "elementDataType": "VarChar",
    "elementTypeParams": {
        "max_length": 512
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $int64Field,
        $boolField,
        $jsonField,
        $arrayField
    ]
}"
```

</TabItem>
</Tabs>

