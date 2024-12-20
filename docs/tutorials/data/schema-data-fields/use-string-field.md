---
title: "String Field | Cloud"
slug: /use-string-field
sidebar_label: "String Field"
beta: FALSE
notebook: FALSE
description: "In Milvus, `VARCHAR` is the data type used for storing string-type data, suitable for storing variable-length strings. It can store strings with both single- and multi-byte characters, with a maximum length of up to 60,535 characters. When defining a `VARCHAR` field, you must also specify the maximum length parameter `maxlength`. The `VARCHAR` string type offers an efficient and flexible way to store and manage text data, making it ideal for applications that handle strings of varying lengths. | Cloud"
type: origin
token: QBXVwP7oiiuEovkprDnckJlEnoK
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - string field
  - varchar field

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# String Field

In Milvus, `VARCHAR` is the data type used for storing string-type data, suitable for storing variable-length strings. It can store strings with both single- and multi-byte characters, with a maximum length of up to 60,535 characters. When defining a `VARCHAR` field, you must also specify the maximum length parameter `max_length`. The `VARCHAR` string type offers an efficient and flexible way to store and manage text data, making it ideal for applications that handle strings of varying lengths.

## Add VARCHAR field{#add-varchar-field}

To use string data in Milvus, define a `VARCHAR` field when creating a collection. This process includes:

1. Setting `datatype` to the supported string data type, i.e., `VARCHAR`.

1. Specifying the maximum length of the string type using the `max_length` parameter, which cannot exceed 60,535 characters.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="http://localhost:19530")

# define schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="varchar_field1", datatype=DataType.VARCHAR, max_length=100)
schema.add_field(field_name="varchar_field2", datatype=DataType.VARCHAR, max_length=200)
schema.add_field(field_name="pk", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=3)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("http://localhost:19530")
        .build());
        
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("varchar_field1")
        .dataType(DataType.VarChar)
        .maxLength(100)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("varchar_field2")
        .dataType(DataType.VarChar)
        .maxLength(200)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("pk")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(3)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const schema = [
  {
    name: "metadata",
    data_type: DataType.JSON,
  },
  {
    name: "pk",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "varchar_field2",
    data_type: DataType.VarChar,
    max_length: 200,
  },
  {
    name: "varchar_field1",
    data_type: DataType.VarChar,
    max_length: 100,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export varcharField1='{
    "fieldName": "varchar_field1",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 100
    }
}'

export varcharField2='{
    "fieldName": "varchar_field2",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 200
    }
}'

export primaryField='{
    "fieldName": "pk",
    "dataType": "Int64",
    "isPrimary": true
}'

export vectorField='{
    "fieldName": "embedding",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 3
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $varcharField1,
        $varcharField2,
        $primaryField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

In this example, we add two `VARCHAR` fields: `varchar_field1` and `varchar_field2`, with maximum lengths set to 100 and 200 characters, respectively. It is recommended to set `max_length` based on your data characteristics to ensure it accommodates the longest data while avoiding excessive space allocation. Additionally, we have added a primary field `pk` and a vector field `embedding`.

<Admonition type="info" icon="📘" title="Notes">

<p>The primary field and vector field are mandatory when you create a collection. The primary field uniquely identifies each entity, while the vector field is crucial for similarity search. For more details, refer to <a href="./primary-field-auto-id">Primary Field & AutoId</a>, <a href="./use-dense-vector">Dense Vector</a>, <a href="./use-binary-vector">Binary Vector</a>, or <a href="./use-sparse-vector">Sparse Vector</a>.</p>

</Admonition>

## Set index params{#set-index-params}

Setting index parameters for `VARCHAR` fields is optional but can significantly improve retrieval efficiency.

In the following example, we create an `AUTOINDEX` for `varchar_field1`, meaning Milvus will automatically create an appropriate index based on the data type. For more information, refer to [AUTOINDEX Explained](./autoindex-explained).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="varchar_field1",
    index_type="AUTOINDEX",
    index_name="varchar_index"
)
```

</TabItem>

<TabItem value='java'>

```java

import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("varchar_field1")
        .indexName("varchar_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    index_name: 'varchar_index',
    field_name: 'varchar_field1',
    index_type: IndexType.AUTOINDEX,
)];
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "varchar_field1",
            "indexName": "varchar_index",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

Moreover, before creating the collection, you must create an index for the vector field. In this example, we use `AUTOINDEX` to simplify vector index settings.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add vector index
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",  # Use automatic indexing to simplify complex index settings
    metric_type="COSINE"  # Specify similarity metric type, options include L2, COSINE, or IP
)
```

</TabItem>

<TabItem value='java'>

```java
indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    index_name: 'embedding_index',
    field_name: 'embedding',
    metric_type: MetricType.COSINE,
    index_type: IndexType.AUTOINDEX,
});
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "varchar_field1",
            "indexName": "varchar_index",
            "indexType": "AUTOINDEX"
        },
        {
            "fieldName": "embedding",
            "metricType": "COSINE",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

## Create collection{#create-collection}

Once the schema and index are defined, you can create a collection that includes string fields.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create Collection
client.create_collection(
    collection_name="your_collection_name",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_varchar_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "my_varchar_collection",
    schema: schema,
    index_params: index_params
})
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_varchar_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
## {"code":0,"data":{}}
```

</TabItem>
</Tabs>

## Insert data{#insert-data}

After creating the collection, you can insert data that includes string fields.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"varchar_field1": "Product A", "varchar_field2": "High quality product", "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"varchar_field1": "Product B", "varchar_field2": "Affordable price", "pk": 2, "embedding": [0.4, 0.5, 0.6]},
    {"varchar_field1": "Product C", "varchar_field2": "Best seller", "pk": 3, "embedding": [0.7, 0.8, 0.9]},
]

client.insert(
    collection_name="my_varchar_collection",
    data=data
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
rows.add(gson.fromJson("{\"varchar_field1\": \"Product A\", \"varchar_field2\": \"High quality product\", \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"Product B\", \"varchar_field2\": \"Affordable price\", \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"Product C\", \"varchar_field2\": \"Best seller\", \"pk\": 3, \"embedding\": [0.7, 0.8, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_varchar_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  {
    varchar_field1: "Product A",
    varchar_field2: "High quality product",
    pk: 1,
    embedding: [0.1, 0.2, 0.3],
  },
  {
    varchar_field1: "Product B",
    varchar_field2: "Affordable price",
    pk: 2,
    embedding: [0.4, 0.5, 0.6],
  },
  {
    varchar_field1: "Product C",
    varchar_field2: "Best seller",
    pk: 3,
    embedding: [0.7, 0.8, 0.9],
  },
];
client.insert({
  collection_name: "my_sparse_collection",
  data: data,
});

```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"varchar_field1": "Product A", "varchar_field2": "High quality product", "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"varchar_field1": "Product B", "varchar_field2": "Affordable price", "pk": 2, "embedding": [0.4, 0.5, 0.6]},
    {"varchar_field1": "Product C", "varchar_field2": "Best seller", "pk": 3, "embedding": [0.7, 0.8, 0.9]}       
    ],
    "collectionName": "my_varchar_collection"
}'

## {"code":0,"cost":0,"data":{"insertCount":3,"insertIds":[1,2,3]}}
```

</TabItem>
</Tabs>

In this example, we insert data that includes `VARCHAR` fields (`varchar_field1` and `varchar_field2`), a primary field (`pk`), and vector representations (`embedding`). To ensure that the inserted data matches the fields defined in the schema, it is recommended to check data types in advance to avoid insertion errors.

If you set `enable_dynamic_fields=True` when defining the schema, Milvus allows you to insert string fields that were not defined in advance. However, keep in mind that this may increase the complexity of queries and management, potentially impacting performance. For more information, refer to [Dynamic Field](./enable-dynamic-field).

## Search and query{#search-and-query}

After adding string fields, you can use them for filtering in search and query operations, achieving more precise search results.

### Filter queries{#filter-queries}

After adding string fields, you can filter results using these fields in queries. For example, you can query all entities where `varchar_field1` equals `"Product A"`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'varchar_field1 == "Product A"'

res = client.query(
    collection_name="my_varchar_collection",
    filter=filter,
    output_fields=["varchar_field1", "varchar_field2"]
)

print(res)

# Output
# data: ["{'varchar_field1': 'Product A', 'varchar_field2': 'High quality product', 'pk': 1}"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "varchar_field1 == \"Product A\"";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_varchar_collection")
        .filter(filter)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={varchar_field1=Product A, varchar_field2=High quality product, pk=1})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_varchar_collection',
    filter: 'varchar_field1 == "Product A"',
    output_fields: ['varchar_field1', 'varchar_field2']
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_varchar_collection",
    "filter": "varchar_field1 == \"Product A\"",
    "outputFields": ["varchar_field1", "varchar_field2"]
}'
## {"code":0,"cost":0,"data":[{"pk":1,"varchar_field1":"Product A","varchar_field2":"High quality product"}]}
```

</TabItem>
</Tabs>

This query expression returns all matching entities and outputs their `varchar_field1` and `varchar_field2` fields. For more information on filter queries, refer to [Filtering](./filtering).

### Vector search with string filtering{#vector-search-with-string-filtering}

In addition to basic scalar field filtering, you can combine vector similarity searches with scalar field filters. For example, the following code shows how to add a scalar field filter to a vector search:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'varchar_field1 == "Product A"'

res = client.search(
    collection_name="my_varchar_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["varchar_field1", "varchar_field2"],
    filter=filter
)

print(res)

# Output
# data: ["[{'id': 1, 'distance': -0.06000000238418579, 'entity': {'varchar_field1': 'Product A', 'varchar_field2': 'High quality product'}}]"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "varchar_field1 == \"Product A\"";
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_varchar_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={varchar_field1=Product A, varchar_field2=High quality product}, score=-0.2364331, id=1)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_varchar_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['varchar_field1', 'varchar_field2'],
    filter: 'varchar_field1 == "Product A"'
    params: {
       nprobe:10
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_varchar_collection",
    "data": [
        [0.3, -0.6, 0.1]
    ],
    "limit": 5,
    "searchParams":{
        "params":{"nprobe":10}
    },
    "outputFields": ["varchar_field1", "varchar_field2"],
    "filter": "varchar_field1 == \"Product A\""
}'

## {"code":0,"cost":0,"data":[{"distance":-0.2364331,"id":1,"varchar_field1":"Product A","varchar_field2":"High quality product"}]}
```

</TabItem>
</Tabs>

In this example, we first define a query vector and add a filter condition `varchar_field1 == "Product A"` during the search. This ensures that the search results are not only similar to the query vector but also match the specified string filter condition. For more information, refer to [Filtering](./filtering).