---
title: "Number Field | Cloud"
slug: /use-number-field
sidebar_label: "Number Field"
beta: FALSE
notebook: FALSE
description: "Number fields are used to store non-vector numerical data in Zilliz Cloud clusters. These fields are typically employed to describe additional information related to vector data, such as age, price, etc. By using this data, you can better describe vectors and improve the efficiency of data filtering and conditional queries. | Cloud"
type: origin
token: EwArwXCOPip15hkSvvpciAMJnSe
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - number field
  - int
  - integer
  - float
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Number Field

Number fields are used to store non-vector numerical data in Zilliz Cloud clusters. These fields are typically employed to describe additional information related to vector data, such as age, price, etc. By using this data, you can better describe vectors and improve the efficiency of data filtering and conditional queries.

Number fields are particularly useful in many scenarios. For example, in e-commerce recommendations, a price field can be used for filtering; in user profile analysis, age ranges can help refine the results. Combined with vector data, number fields can help the system provide similarity searches while meeting personalized user needs more precisely.

## Supported number field types{#supported-number-field-types}

Zilliz Cloud supports various number field types to meet different data storage and query needs:

<table>
   <tr>
     <th><p>Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>BOOL</code></p></td>
     <td><p>Boolean type for storing <code>true</code> or <code>false</code>, suitable for describing binary states.</p></td>
   </tr>
   <tr>
     <td><p><code>INT8</code></p></td>
     <td><p>8-bit integer, suitable for storing small-range integer data.</p></td>
   </tr>
   <tr>
     <td><p><code>INT16</code></p></td>
     <td><p>16-bit integer, for medium-range integer data.</p></td>
   </tr>
   <tr>
     <td><p><code>INT32</code></p></td>
     <td><p>32-bit integer, ideal for general integer data storage like product quantities or user IDs.</p></td>
   </tr>
   <tr>
     <td><p><code>INT64</code></p></td>
     <td><p>64-bit integer, suitable for storing large-range data like timestamps or identifiers.</p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT</code></p></td>
     <td><p>32-bit floating-point number, for data requiring general precision, such as ratings or temperature.</p></td>
   </tr>
   <tr>
     <td><p><code>DOUBLE</code></p></td>
     <td><p>64-bit double-precision floating-point number, for high-precision data like financial information or scientific calculations.</p></td>
   </tr>
</table>

## Add number field{#add-number-field}

To use number fields in Zilliz Cloud clusters, define the relevant fields in the collection schema, setting the `datatype` to a supported type such as `BOOL` or `INT8`. For a complete list of supported number field types, refer to [Supported number field types](./use-number-field).

The following example shows how to define a schema that includes number fields `age` and `price`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="age", datatype=DataType.INT64)
schema.add_field(field_name="price", datatype=DataType.FLOAT)
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
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
        
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Float)
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
    name: "age",
    data_type: DataType.Int64,
  },
  {
    name: "price",
    data_type: DataType.Float,
  },
  {
    name: "pk",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "embedding",
    data_type: DataType.FloatVector,
    dim: 3,
  },
];

```

</TabItem>

<TabItem value='bash'>

```bash
export int64Field='{
    "fieldName": "age",
    "dataType": "Int64"
}'

export floatField='{
    "fieldName": "price",
    "dataType": "Float"
}'

export pkField='{
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
        $int64Field,
        $floatField,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>The primary field and vector field are mandatory when you create a collection. The primary field uniquely identifies each entity, while the vector field is crucial for similarity search. For more details, refer to <a href="./primary-field-auto-id">Primary Field & AutoId</a>, <a href="./use-dense-vector">Dense Vector</a>, <a href="./use-binary-vector">Binary Vector</a>, or <a href="./use-sparse-vector">Sparse Vector</a>.</p>

</Admonition>

## Set index params{#set-index-params}

Setting index parameters for number fields is optional but can significantly improve retrieval efficiency.

In the following example, we create an `AUTOINDEX` for the `age` number field, allowing Zilliz Cloud to automatically create an appropriate index based on the data type. For more information, refer to [AUTOINDEX Explained](./autoindex-explained).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="age",
    index_type="AUTOINDEX",
    index_name="inverted_index"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("age")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());

```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = {
    index_name: 'inverted_index',
    field_name: 'age',
    index_type: IndexType.AUTOINDEX,
);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "age",
            "indexName": "inverted_index",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

In this example, we use `AUTOINDEX` to create the index for the number field.

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
import { IndexType } from "@zilliz/milvus2-sdk-node";
const indexParams = [
  {
    field_name: "age",
    index_name: "inverted_index",
    index_type: IndexType.AUTOINDEX,
  },
  {
    field_name: "embedding",
    metric_type: "COSINE",
    index_type: IndexType.AUTOINDEX,
  },
];

```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "age",
            "indexName": "inverted_index",
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

Once the schema and indexes are defined, you can create a collection that includes number fields.

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
        .collectionName("my_scalar_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "my_scalar_collection",
    schema: schema,
    index_params: indexParams
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
    \"collectionName\": \"my_scalar_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## Insert data{#insert-data}

After creating the collection, you can insert data that includes number fields.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"age": 25, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"age": 30, "price": 149.50, "pk": 2, "embedding": [0.4, 0.5, 0.6]},
    {"age": 35, "price": 199.99, "pk": 3, "embedding": [0.7, 0.8, 0.9]},
]

client.insert(
    collection_name="my_scalar_collection",
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
rows.add(gson.fromJson("{\"age\": 25, \"price\": 99.99, \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 30, \"price\": 149.50, \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 35, \"price\": 199.99, \"pk\": 3, \"embedding\": [0.7, 0.8, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_scalar_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  { age: 25, price: 99.99, pk: 1, embedding: [0.1, 0.2, 0.3] },
  { age: 30, price: 149.5, pk: 2, embedding: [0.4, 0.5, 0.6] },
  { age: 35, price: 199.99, pk: 3, embedding: [0.7, 0.8, 0.9] },
];

client.insert({
  collection_name: "my_scalar_collection",
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
        {"age": 25, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
        {"age": 30, "price": 149.50, "pk": 2, "embedding": [0.4, 0.5, 0.6]},
        {"age": 35, "price": 199.99, "pk": 3, "embedding": [0.7, 0.8, 0.9]}       
    ],
    "collectionName": "my_scalar_collection"
}'
```

</TabItem>
</Tabs>

In this example, we insert data that includes `age`, `price`, `pk` (primary field), and vector representations (`embedding`). To ensure that the inserted data matches the fields defined in the schema, it's recommended to check data types in advance to avoid errors.

If you set `enable_dynamic_fields=True` when defining the schema, Zilliz Cloud allows you to insert number fields that were not defined in advance. However, keep in mind that this may increase the complexity of queries and management, potentially impacting performance. For more information, refer to [Dynamic Field](./enable-dynamic-field).

## Search and query{#search-and-query}

After adding number fields, you can use them for filtering in search and query operations to achieve more precise search results.

### Filter queries{#filter-queries}

After adding number fields, you can use them for filtering in queries. For example, you can query all entities where `age` is between 30 and 40:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "30 <= age <= 40"

res = client.query(
    collection_name="my_scalar_collection",
    filter=filter,
    output_fields=["age","price"]
)

print(res)

# Output
# data: ["{'age': 30, 'price': np.float32(149.5), 'pk': 2}", "{'age': 35, 'price': np.float32(199.99), 'pk': 3}"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "30 <= age <= 40";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_scalar_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price"))
        .build());
System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={price=149.5, pk=2, age=30}), QueryResp.QueryResult(entity={price=199.99, pk=3, age=35})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_scalar_collection',
    filter: '30 <= age <= 40',
    output_fields: ['age', 'price']
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
    "collectionName": "my_scalar_collection",
    "filter": "30 <= age <= 40",
    "outputFields": ["age","price"]
}'

## {"code":0,"cost":0,"data":[{"age":30,"pk":2,"price":149.5},{"age":35,"pk":3,"price":199.99}]}
```

</TabItem>
</Tabs>

This query expression returns all matching entities and outputs their `age` and `price` fields. For more information on filter queries, refer to [Filtering](./filtering).

### Vector search with number filtering{#vector-search-with-number-filtering}

In addition to basic number field filtering, you can combine vector similarity searches with number field filters. For example, the following code shows how to add a number field filter to a vector search:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "25 <= age <= 35"

res = client.search(
    collection_name="my_scalar_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["age","price"],
    filter=filter
)

print(res)

# Output
# data: ["[{'id': 1, 'distance': -0.06000000238418579, 'entity': {'age': 25, 'price': 99.98999786376953}}, {'id': 2, 'distance': -0.12000000476837158, 'entity': {'age': 30, 'price': 149.5}}, {'id': 3, 'distance': -0.18000000715255737, 'entity': {'age': 35, 'price': 199.99000549316406}}]"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "25 <= age <= 35";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_scalar_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("age", "price"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={price=199.99, age=35}, score=-0.19054288, id=3), SearchResp.SearchResult(entity={price=149.5, age=30}, score=-0.20163085, id=2), SearchResp.SearchResult(entity={price=99.99, age=25}, score=-0.2364331, id=1)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_scalar_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['age', 'price'],
    filter: '25 <= age <= 35'
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
    "collectionName": "my_scalar_collection",
    "data": [
        [0.3, -0.6, 0.1]
    ],
    "annsField": "embedding",
    "limit": 5,
    "outputFields": ["age", "price"]
}'

## {"code":0,"cost":0,"data":[{"age":35,"distance":-0.19054288,"id":3,"price":199.99},{"age":30,"distance":-0.20163085,"id":2,"price":149.5},{"age":25,"distance":-0.2364331,"id":1,"price":99.99}]}
```

</TabItem>
</Tabs>

In this example, we first define a query vector and add a filter condition `25 <= age <= 35` during the search. This ensures that the search results are not only similar to the query vector but also meet the specified age range. For more information, refer to [Filtering](./filtering).