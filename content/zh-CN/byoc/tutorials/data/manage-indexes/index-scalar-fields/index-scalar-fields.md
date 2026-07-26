---
title: "创建 Scalar Index | BYOC"
slug: /index-scalar-fields
sidebar_label: "创建 Scalar Index"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持对标量字段（非向量字段）进行索引，从而显著加速过滤和搜索性能，尤其适用于大型数据集。 | BYOC"
type: origin
token: AHv5wa2FiiWoyGkTIsHcfIcyngg
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 索引
  - index
  - AUTOINDEX
  - 标量索引

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 创建 Scalar Index

Zilliz Cloud 支持对标量字段（非向量字段）进行索引，从而显著加速过滤和搜索性能，尤其适用于大型数据集。

## 概述\{#overview}

对标量字段进行索引是可选操作，但如果你经常在过滤条件中访问某个特定标量字段，建议为其建立索引以加速查询性能。

Zilliz Cloud 支持对以下字段类型使用 `AUTOINDEX`：

<table>
   <tr>
     <th><p>字段类型</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>字符串。有关更多信息，请参阅<a href="./use-string-field">字符串类型</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>INT8</code>, <code>INT32</code>, <code>INT64</code></p></td>
     <td><p>整数。有关更多信息，请参阅<a href="./use-number-field">布尔与数值类型</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT</code>, <code>DOUBLE</code></p></td>
     <td><p>浮点数。有关更多信息，请参阅<a href="./use-number-field">布尔与数值类型</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>BOOL</code></p></td>
     <td><p>布尔值。有关更多信息，请参阅<a href="./use-number-field">布尔与数值类型</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY</code></p></td>
     <td><p>标量值的同质数组。有关更多信息，请参阅 <a href="./use-array-fields">Array 类型</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>GEOMETRY</code></p></td>
     <td><p>几何数据类型。有关更多信息，请参阅 <a href="./use-geometry-field">Geometry 类型</a>。</p></td>
   </tr>
</table>

## 准备工作\{#preparations}

在创建索引之前，定义一个包含向量字段和标量字段的 collection。Zilliz Cloud 要求每个 collection 都有一个向量字段。

在此示例中，我们为产品目录定义一个 schema，其中包含一个必需的向量字段（`vector`）和一个 `DOUBLE` 类型的标量字段（`price`）：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your cluster endpoint

# Define schema with dynamic field support
schema = client.create_schema(
    auto_id=False,
    # highlight-next-line
    enable_dynamic_field=True # Enable dynamic field
)

# Define fields
schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5) # Vector field
schema.add_field(field_name="price", datatype=DataType.DOUBLE) # Scalar field

# Create the collection
client.create_collection(
    collection_name="product_catalog",
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.*;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.AddFieldReq;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(true)
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Double)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("product_catalog")
        .collectionSchema(schema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

// initialize client
const client = new MilvusClient({
  address: 'localhost:19530', // Replace with your cluster endpoint
});

const collectionName = 'product_catalog';

// define schema
const schema = [
  {
    name: 'product_id',
    description: 'Primary key',
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: false,
  },
  {
    name: 'vector',
    description: 'Embedding vector',
    data_type: DataType.FloatVector,
    type_params: {
      dim: '5',
    },
  },
  {
    name: 'price',
    description: 'Product price',
    data_type: DataType.Double,
  },
];

// create collection
const res = await client.createCollection({
    collection_name: collectionName,
    fields: schema,
    enable_dynamic_field: true,
});

console.log('Create collection result:', res);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "localhost:19530",
})
if err != nil {
    return err
}

schema := entity.NewSchema().WithDynamicFieldEnabled(true)
schema.WithField(entity.NewField().
    WithName("product_id").pk
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
).WithField(entity.NewField().
    WithName("price").
    WithDataType(entity.FieldTypeDouble),
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("product_catalog", schema))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

```bash
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export productIdField='{
  "fieldName": "product_id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": false
}'

export vectorField='{
  "fieldName": "vector",
  "dataType": "FloatVector",
  "elementTypeParams": {
    "dim": 5
  }
}'

export priceField='{
  "fieldName": "price",
  "dataType": "Double"
}'

export schema="{
  \"autoID\": false,
  \"enableDynamicField\": true,
  \"fields\": [
    $productIdField,
    $vectorField,
    $priceField
  ]
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"schema\": $schema
}"

```

</TabItem>
</Tabs>

## 为标量字段建立索引\{#index-a-scalar-field}

您可以使用 `AUTOINDEX` 为任何非 JSON 标量字段创建索引。无需额外的索引参数。以下示例展示了如何为 `price` 字段建立索引：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params() # Prepare an empty IndexParams object, without having to specify any index parameters

index_params.add_index(
    field_name="price", # Name of the scalar field to be indexed
    # highlight-next-line
    index_type="AUTOINDEX", # Type of index to be created
    index_name="price_index" # Name of the index to be created
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(IndexParam.builder()
        .fieldName("price")
        .indexName("price_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    collection_name: collectionName,
    field_name: 'price',
    index_type: 'AUTOINDEX',
    index_name: 'price_index'
}];
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/index"
)

indexOpt := client.NewCreateIndexOption("product_catalog", "price",
        index.NewInvertedIndex())
```

</TabItem>

<TabItem value='bash'>

```bash
export priceIndex='{
  "fieldName": "price",
  "indexName": "price_index",
  "params": {
    "index_type": "AUTOINDEX"
  }
}'
```

</TabItem>
</Tabs>

定义索引参数后，您可以使用 `create_index()` 将它们应用到 collection：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_index(
    collection_name="product_catalog",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.CreateIndexReq;

client.createIndex(CreateIndexReq.builder()
        .collectionName("product_catalog")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.createIndex(indexParams)
```

</TabItem>

<TabItem value='go'>

```go
indexTask1, err := client.CreateIndex(ctx, indexOpt1)
if err != nil {
    return err
}
indexTask2, err := client.CreateIndex(ctx, indexOpt2)
if err != nil {
    return err
}
indexTask3, err := client.CreateIndex(ctx, indexOpt3)
if err != nil {
    return err
}
indexTask4, err := client.CreateIndex(ctx, indexOpt4)
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"indexParams\": [$priceIndex]
}"
```

</TabItem>
</Tabs>

## 查看索引详情\{#check-index-details}

创建索引后，您可以查看其详细信息：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# Describe index
res = client.list_indexes(
    collection_name="product_catalog"
)

print(res)

res = client.describe_index(
    collection_name="product_catalog",
    index_name="price_index"
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;

// Describe index
// List the index names
ListIndexesReq listIndexesReq = ListIndexesReq.builder()
    .collectionName("product_catalog")
    .build();

List<String> indexNames = client.listIndexes(listIndexesReq);

System.out.println(indexNames);

// Describe an index
DescribeIndexReq describeIndexReq = DescribeIndexReq.builder()
    .collectionName("product_catalog")
    .indexName("price_index")
    .build();

DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);

System.out.println(JSONObject.toJSON(describeIndexResp));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Describe the index
res = await client.describeIndex({
    collection_name: "product_catalog",
    index_name: "price_index"
})

console.log(JSON.stringify(res.index_descriptions, null, 2))
```

</TabItem>
</Tabs>

## 删除索引\{#drop-an-index}

当您不需要索引时，可以考虑将其删除。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# Drop index
client.drop_index(
    collection_name="product_catalog",
    index_name="price_index"
)
```

</TabItem>

<TabItem value='java'>

```java
// Drop index

DropIndexReq dropIndexReq = DropIndexReq.builder()
    .collectionName("product_catalog")
    .indexName("price_index")
    .build();

client.dropIndex(dropIndexReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Drop the index
res = await client.dropIndex({
    collection_name: "product_catalog",
    index_name: "price_index"
})

console.log(res.error_code)
```

</TabItem>
</Tabs>

## 高级功能\{#advanced-features}

除了基础功能外，标量索引还提供了一些进阶特性，能够满足更复杂的数据检索需求。

import DocCardList from '@theme/DocCardList';

<DocCardList />