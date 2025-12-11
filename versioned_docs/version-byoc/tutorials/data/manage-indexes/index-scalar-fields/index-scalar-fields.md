---
title: "Index Scalar Fields | BYOC"
slug: /index-scalar-fields
sidebar_label: "Index Scalar Fields"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud supports indexing on scalar fields (non-vector fields) to significantly accelerate filtering and search performance, especially on large datasets. | BYOC"
type: origin
token: XCCwwOLqKi2nYGkfy5Gc0Vnfnpb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - scalar field
  - index
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Index Scalar Fields

Zilliz Cloud supports indexing on scalar fields (non-vector fields) to significantly accelerate filtering and search performance, especially on large datasets.

## Overview\{#overview}

Indexing a scalar field is optional, but recommended if you frequently access a specific scalar field in filter conditions.

Zilliz Cloud supports `AUTOINDEX` for the following field types:

<table>
   <tr>
     <th><p>Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>String data type. For details, refer to <a href="./use-string-field">String Field</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>INT8</code>, <code>INT32</code>, <code>INT64</code></p></td>
     <td><p>Integer. For details, refer to <a href="./use-number-field">Boolean & Number</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT</code>, <code>DOUBLE</code></p></td>
     <td><p>Floating point. For details, refer to <a href="./use-number-field">Boolean & Number</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>BOOL</code></p></td>
     <td><p>Boolean. For details, refer to <a href="./use-number-field">Boolean & Number</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY</code></p></td>
     <td><p>Homogeneous array of scalar values. For details, refer to <a href="./use-array-fields">Array Field</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>GEOMETRY</code></p></td>
     <td><p>Geometric data that stores spatial information. For details, refer to <a href="./use-geometry-field">Geometry Field</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>TIMESTAMPTZ</code></p></td>
     <td><p>time zone-aware ISO 8601 inputs, stored as UTC for consistent filtering and ordering across time zones. For details, refer to <a href="./undefined">TIMESTAMPTZ Field</a>.</p></td>
   </tr>
</table>

## Preparations\{#preparations}

Before creating indexes, define a collection that includes both vector and scalar fields. Zilliz Cloud requires a vector field in every collection.

In this example, we define a schema for a product catalog, including a required vector field (`vector`) and a scalar field of the `DOUBLE` type (`price`):

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
  address: 'YOUR_CLUSTER_ENDPOINT', // Replace with your cluster endpoint
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
    Address: "YOUR_CLUSTER_ENDPOINT",
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

## Index a scalar field\{#index-a-scalar-field}

You can create an index on a scalar field using `AUTOINDEX`. No additional index parameters are needed. The example below creates an index on the `price` field:

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

After defining the index parameters, you can apply them to the collection using `create_index()`:

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

## Check index details\{#check-index-details}

Once you have created an index, you can check its details.

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

## Drop an index\{#drop-an-index}

Use the `drop_index()` method to remove an existing index from a collection.

<Admonition type="info" icon="📘" title="Notes">

<p>In your cluster compatible with <strong>Milvus v2.6.x</strong>, you can drop a scalar index directly once it’s no longer needed—no need to release the collection first.</p>

</Admonition>

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

## Advanced features\{#advanced-features}

There are also several advanced features around scalar indexes that you may be interested in.

import DocCardList from '@theme/DocCardList';

<DocCardList />