---
title: "Index Vector Fields | Cloud"
slug: /index-vector-fields
sidebar_label: "Index Vector Fields"
beta: FALSE
notebook: FALSE
description: "This guide walks you through the basic operations on creating and managing indexes on vector fields in a collection. | Cloud"
type: origin
token: Qc0SwFomWiEXvMkDAH9cMAhlnIh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - vector field
  - index
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Index Vector Fields

This guide walks you through the basic operations on creating and managing indexes on vector fields in a collection. 

## Overview{#overview}

Leveraging the metadata stored in an index file, Zilliz Cloud organizes your data in a specialized structure, facilitating rapid retrieval of requested information during searches or queries.

Zilliz Cloud employs [AUTOINDEX](./autoindex-explained) to enable efficient similarity searches. It also offers these [metric types](./search-metrics-explained): **Cosine Similarity** (COSINE), **Euclidean Distance** (L2), **Inner Product** (IP), **JACCARD**, and **HAMMING** to measure the distances between vector embeddings. To learn more about vector field types and metrics, refer to [Metric Types](./search-metrics-explained) and [Schema Explained](./schema-explained).

It is recommended to create indexes for both the vector field and scalar fields that are frequently accessed.

If your collection contains more than one vector field, you can create an index for each vector field separately.

## Preparations{#preparations}

As explained in [Create Collection](./manage-collections-sdks), Zilliz Cloud automatically generates an index and loads it into memory when creating a collection if any of the following conditions are specified in the collection creation request:

- The dimensionality of the vector field and the metric type, or

- The schema and the index parameters.

The code snippet below repurposes the existing code to establish a connection to a Zilliz Cloud cluster and create a collection without specifying its index parameters. In this case, the collection lacks an index and remains unloaded.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# 2. Create schema
# 2.1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True,
)

# 2.2. Add fields to schema
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
# The dim value should be an integer greater than 1
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3. Create collection
client.create_collection(
    collection_name="customized_setup", 
    schema=schema, 
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a collection

// 2.1 Create schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();

// 2.2 Add fields to schema
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(true).autoID(false).build());
// The dimension value should be an integer greater than 1.
schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(5).build());

// 3 Create a collection without schema and index parameters
CreateCollectionReq customizedSetupReq = CreateCollectionReq.builder()
.collectionName("customized_setup")
.collectionSchema(schema)
.build();

client.createCollection(customizedSetupReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 1. Set up a Milvus Client
client = new MilvusClient({address, token});

// 2. Define fields for the collection
const fields = [
    {
        name: "id",
        data_type: DataType.Int64,
        is_primary_key: true,
        auto_id: false
    },
    {
        name: "vector",
        data_type: DataType.FloatVector,
        dim: 5 // The dim value should be greater than 1.
    },
]

// 3. Create a collection
res = await client.createCollection({
    collection_name: "customized_setup",
    fields: fields,
})

console.log(res.error_code)  

// Output
// 
// Success
// 
```

</TabItem>
</Tabs>

## Index a Collection{#index-a-collection}

To create an index for a collection or index a collection, you need to set up the index parameters and call `create_index()`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 4. Set up index
# 4.1. Set up the index parameters
index_params = MilvusClient.prepare_index_params()

# 4.2. Add an index on the vector field.
index_params.add_index(
    field_name="vector",
    metric_type="COSINE",
    index_type="AUTOINDEX",
    index_name="vector_index"
)

# 4.4. Create an index file
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 5. Describe index
res = client.list_indexes(
    collection_name="customized_setup"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

// 4 Prepare index parameters

// 4.2 Add an index for the vector field "vector"
IndexParam indexParamForVectorField = IndexParam.builder()
    .fieldName("vector")
    .indexName("vector_index")
    .indexType(IndexParam.IndexType.AUTOINDEX)
    .metricType(IndexParam.MetricType.COSINE)
    .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForVectorField);

// 4.3 Crate an index file
CreateIndexReq createIndexReq = CreateIndexReq.builder()
    .collectionName("customized_setup")
    .indexParams(indexParams)
    .build();

client.createIndex(createIndexReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Set up index for the collection
// 4.1. Set up the index parameters
res = await client.createIndex({
    collection_name: "customized_setup",
    field_name: "vector",
    index_type: "AUTOINDEX",
    metric_type: "COSINE",   
    index_name: "vector_index"
})

console.log(res.error_code)

// Output
// 
// Success
// 
```

</TabItem>
</Tabs>

In the provided code snippet, we have established indexes on the vector field with the index type set to `AUTOINDEX` and metric type set to `COSINE`. Additionally, an index on a scalar field has been created with the index type `AUTOINDEX`. To learn more about the index type and metric types, read [AUTOINDEX Explained](./autoindex-explained) and [Metric Types](./search-metrics-explained).

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, you can create only one index file for each field in a collection.</p>

</Admonition>

## Check Index Details{#check-index-details}

Once you have created an index, you can check its details.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 5. Describe index
res = client.list_indexes(
    collection_name="customized_setup"
)

print(res)

# Output
#
# [
#     "vector_index"
# ]

res = client.describe_index(
    collection_name="customized_setup",
    index_name="vector_index"
)

print(res)

# Output
#
# {
#     "index_type": "AUTOINDEX",
#     "metric_type": "COSINE",
#     "field_name": "vector",
#     "index_name": "vector_index"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;

// 5. Describe index
// 5.1 List the index names
ListIndexesReq listIndexesReq = ListIndexesReq.builder()
    .collectionName("customized_setup")
    .build();

List<String> indexNames = client.listIndexes(listIndexesReq);

System.out.println(indexNames);

// Output:
// [
//     "vector_index"
// ]

// 5.2 Describe an index
DescribeIndexReq describeIndexReq = DescribeIndexReq.builder()
    .collectionName("customized_setup")
    .indexName("vector_index")
    .build();

DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);

System.out.println(JSONObject.toJSON(describeIndexResp));

// Output:
// {
//     "metricType": "COSINE",
//     "indexType": "AUTOINDEX",
//     "fieldName": "vector",
//     "indexName": "vector_index"
// }
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. Describe the index
res = await client.describeIndex({
    collection_name: "customized_setup",
    index_name: "vector_index"
})

console.log(JSON.stringify(res.index_descriptions, null, 2))

// Output
// 
// [
//   {
//     "params": [
//       {
//         "key": "index_type",
//         "value": "AUTOINDEX"
//       },
//       {
//         "key": "metric_type",
//         "value": "COSINE"
//       }
//     ],
//     "index_name": "vector_index",
//     "indexID": "449007919953063141",
//     "field_name": "vector",
//     "indexed_rows": "0",
//     "total_rows": "0",
//     "state": "Finished",
//     "index_state_fail_reason": "",
//     "pending_index_rows": "0"
//   }
// ]
// 
```

</TabItem>
</Tabs>

You can check the index file created on a specific field, and collect the statistics on the number of rows indexed using this index file.

## Drop an Index{#drop-an-index}

You can simply drop an index if it is no longer needed.

<Admonition type="info" icon="📘" title="Notes">

<p>Before dropping an index, make sure it has been released first.</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 6. Drop index
client.drop_index(
    collection_name="customized_setup",
    index_name="vector_index"
)
```

</TabItem>

<TabItem value='java'>

```java
// 6. Drop index

DropIndexReq dropIndexReq = DropIndexReq.builder()
    .collectionName("customized_setup")
    .indexName("vector_index")
    .build();

client.dropIndex(dropIndexReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. Drop the index
res = await client.dropIndex({
    collection_name: "customized_setup",
    index_name: "vector_index"
})

console.log(res.error_code)

// Output
// 
// Success
// 
```

</TabItem>
</Tabs>