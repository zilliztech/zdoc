---
title: "String Field | Cloud"
slug: /use-string-field
sidebar_label: "String Field"
beta: FALSE
notebook: FALSE
description: "In Zilliz Cloud clusters, `VARCHAR` is the data type used for storing string data. When you define a `VARCHAR` field, two parameters are mandatory | Cloud"
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
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# String Field

In Zilliz Cloud clusters, `VARCHAR` is the data type used for storing string data. When you define a `VARCHAR` field, two parameters are mandatory:

- Set the `datatype` to `DataType.VARCHAR`.

- Specify the `max_length`, which defines the maximum number of characters the `VARCHAR` field can store. The valid range for `max_length` is from 1 to 65,535.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud supports null values and default values for <code>VARCHAR</code> fields. To enable these features, set <code>nullable</code> to <code>True</code> and <code>default_value</code> to a string value. For details, refer to <a href="./nullable-and-default">Nullable & Default</a>.</p>

</Admonition>

## Add VARCHAR field{#add-varchar-field}

To store string data in Zilliz Cloud clusters, define a `VARCHAR` field in your collection schema. Below is an example of defining a collection schema with two `VARCHAR` fields:

- `varchar_field1`: stores up to 100 characters, allows null values, and has a default value of `"Unknown"`.

- `varchar_field2`: stores up to 200 characters, allows null values, but does not have a default value.

<Admonition type="info" icon="📘" title="Notes">

<p>If you set <code>enable_dynamic_fields=True</code> when defining the schema, Zilliz Cloud allows you to insert scalar fields that were not defined in advance. However, this may increase the complexity of queries and management, potentially impacting performance. For more information, refer to <a href="./enable-dynamic-field">Dynamic Field</a>.</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Import necessary libraries
from pymilvus import MilvusClient, DataType

# Define server address
SERVER_ADDR = "YOUR_CLUSTER_ENDPOINT"

# Create a MilvusClient instance
client = MilvusClient(uri=SERVER_ADDR)

# Define the collection schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

# Add `varchar_field1` that supports null values with default value "Unknown"
schema.add_field(field_name="varchar_field1", datatype=DataType.VARCHAR, max_length=100, nullable=True, default_value="Unknown")
# Add `varchar_field2` that supports null values without default value
schema.add_field(field_name="varchar_field2", datatype=DataType.VARCHAR, max_length=200, nullable=True)
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
        .fieldName("varchar_field1")
        .dataType(DataType.VarChar)
        .maxLength(100)
        .isNullable(true)
        .defaultValue("Unknown")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("varchar_field2")
        .dataType(DataType.VarChar)
        .maxLength(200)
        .isNullable(true)
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

const client = new MilvusClient({
  address: `YOUR_CLUSTER_ENDPOINT`
});

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
    },
    "nullable": true
}'

export varcharField2='{
    "fieldName": "varchar_field2",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 200
    },
    "nullable": true
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

## Set index params{#set-index-params}

Indexing helps improve search and query performance. In Zilliz Cloud clusters, indexing is mandatory for vector fields but optional for scalar fields.

The following example creates indexes on the vector field `embedding` and the scalar field `varchar_field1`, both using the `AUTOINDEX` index type. With this type, Milvus automatically selects the most suitable index based on the data type.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params

index_params = client.prepare_index_params()

# Index `varchar_field1` with AUTOINDEX
index_params.add_index(
    field_name="varchar_field1",
    index_type="AUTOINDEX",
    index_name="varchar_index"
)

# Index `embedding` with AUTOINDEX and specify metric_type
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",  # Use automatic indexing to simplify complex index settings
    metric_type="COSINE"  # Specify similarity metric type, options include L2, COSINE, or IP
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
        
indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    index_name: 'varchar_index',
    field_name: 'varchar_field1',
    index_type: IndexType.AUTOINDEX,
)];

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
        }
    ]'
    
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

Once the schema and index are defined, create a collection that includes string fields.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create Collection
client.create_collection(
    collection_name="my_varchar_collection",
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

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection({
    collection_name: "my_varchar_collection",
    schema: schema,
    index_params: index_params
});
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

After creating the collection, insert entities that match the schema.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample data
data = [
    {"varchar_field1": "Product A", "varchar_field2": "High quality product", "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"varchar_field1": "Product B", "pk": 2, "embedding": [0.4, 0.5, 0.6]}, # varchar_field2 field is missing, which should be NULL
    {"varchar_field1": None, "varchar_field2": None, "pk": 3, "embedding": [0.2, 0.3, 0.1]},  # `varchar_field1` should default to `Unknown`, `varchar_field2` is NULL
    {"varchar_field1": "Product C", "varchar_field2": None, "pk": 4, "embedding": [0.5, 0.7, 0.2]},  # `varchar_field2` is NULL
    {"varchar_field1": None, "varchar_field2": "Exclusive deal", "pk": 5, "embedding": [0.6, 0.4, 0.8]},  # `varchar_field1` should default to `Unknown`
    {"varchar_field1": "Unknown", "varchar_field2": None, "pk": 6, "embedding": [0.8, 0.5, 0.3]},  # `varchar_field2` is NULL
    {"varchar_field1": "", "varchar_field2": "Best seller", "pk": 7, "embedding": [0.8, 0.5, 0.3]}, # Empty string is not treated as NULL
]

# Insert data
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
rows.add(gson.fromJson("{\"varchar_field1\": \"Product B\", \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": null, \"varchar_field2\": null, \"pk\": 3, \"embedding\": [0.2, 0.3, 0.1]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"Product C\", \"varchar_field2\": null, \"pk\": 4, \"embedding\": [0.5, 0.7, 0.2]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": null, \"varchar_field2\": \"Exclusive deal\", \"pk\": 5, \"embedding\": [0.6, 0.4, 0.8]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"Unknown\", \"varchar_field2\": null, \"pk\": 6, \"embedding\": [0.8, 0.5, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"\", \"varchar_field2\": \"Best seller\", \"pk\": 7, \"embedding\": [0.8, 0.5, 0.3]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_varchar_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// go
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

await client.insert({
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
--data '{
    "data": [
        {"varchar_field1": "Product A", "varchar_field2": "High quality product", "pk": 1, "embedding": [0.1, 0.2, 0.3]},
        {"varchar_field1": "Product B", "pk": 2, "embedding": [0.4, 0.5, 0.6]},
        {"varchar_field1": null, "varchar_field2": null, "pk": 3, "embedding": [0.2, 0.3, 0.1]},  
        {"varchar_field1": "Product C", "varchar_field2": null, "pk": 4, "embedding": [0.5, 0.7, 0.2]},  
        {"varchar_field1": null, "varchar_field2": "Exclusive deal", "pk": 5, "embedding": [0.6, 0.4, 0.8]},  
        {"varchar_field1": "Unknown", "varchar_field2": null, "pk": 6, "embedding": [0.8, 0.5, 0.3]},  
        {"varchar_field1": "", "varchar_field2": "Best seller", "pk": 7, "embedding": [0.8, 0.5, 0.3]}  
    ],
    "collectionName": "my_varchar_collection"
}'

## {"code":0,"cost":0,"data":{"insertCount":3,"insertIds":[1,2,3]}}
```

</TabItem>
</Tabs>

## Query with filter expressions{#query-with-filter-expressions}

After inserting entities, use the `query` method to retrieve entities that match the specified filter expressions.

To retrieve entities where the `varchar_field1` matches the string `"Product A"`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Filter `varchar_field1` with value "Product A"
filter = 'varchar_field1 == "Product A"'

res = client.query(
    collection_name="my_varchar_collection",
    filter=filter,
    output_fields=["varchar_field1", "varchar_field2"]
)

print(res)

# Example output:
# data: [
#     "{'varchar_field1': 'Product A', 'varchar_field2': 'High quality product', 'pk': 1}"
# ]
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

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.query({
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

To retrieve entities where the `varchar_field2` is null:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Filter entities where `varchar_field2` is null
filter = 'varchar_field2 is null'

res = client.query(
    collection_name="my_varchar_collection",
    filter=filter,
    output_fields=["varchar_field1", "varchar_field2"]
)

print(res)

# Example output:
# data: [
#     "{'varchar_field1': 'Product B', 'varchar_field2': None, 'pk': 2}",
#     "{'varchar_field1': 'Unknown', 'varchar_field2': None, 'pk': 3}",
#     "{'varchar_field1': 'Product C', 'varchar_field2': None, 'pk': 4}",
#     "{'varchar_field1': 'Unknown', 'varchar_field2': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "varchar_field2 is null";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_varchar_collection")
        .filter(filter)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [
//    QueryResp.QueryResult(entity={varchar_field1=Product B, varchar_field2=null, pk=2}),
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=null, pk=3}),
//    QueryResp.QueryResult(entity={varchar_field1=Product C, varchar_field2=null, pk=4}),
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=null, pk=6})
// ]
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.query({
    collection_name: 'my_varchar_collection',
    filter: 'varchar_field2 is null',
    output_fields: ['varchar_field1', 'varchar_field2']
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_varchar_collection",
    "filter": "varchar_field2 is null",
    "outputFields": ["varchar_field1", "varchar_field2"]
}'
```

</TabItem>
</Tabs>

To retrieve entities where `varchar_field1` has the value `"Unknown"`, use the following expression below. As the default value of `varchar_field1` is `"Unknown"`, the expected result should include entities with `varchar_field1` explicitly set to `"Unknown"` or with `varchar_field1` set to null.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Filter entities with `varchar_field1` with value `Unknown`
filter = 'varchar_field1 == "Unknown"'

res = client.query(
    collection_name="my_varchar_collection",
    filter=filter,
    output_fields=["varchar_field1", "varchar_field2"]
)

print(res)

# Example output:
# data: [
#     "{'varchar_field1': 'Unknown', 'varchar_field2': None, 'pk': 3}",
#     "{'varchar_field1': 'Unknown', 'varchar_field2': 'Exclusive deal', 'pk': 5}",
#     "{'varchar_field1': 'Unknown', 'varchar_field2': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "varchar_field1 == \"Unknown\"";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_varchar_collection")
        .filter(filter)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .build());

System.out.println(resp.getQueryResults());

// Output
// 
// [
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=null, pk=3}),
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=Exclusive deal, pk=5}),
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=null, pk=6})
// ]
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
await client.query({
    collection_name: 'my_varchar_collection',
    filter: 'varchar_field1 == "Unknown"',
    output_fields: ['varchar_field1', 'varchar_field2']
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_varchar_collection",
    "filter": "varchar_field1 == \"Unknown\"",
    "outputFields": ["varchar_field1", "varchar_field2"]
}'
```

</TabItem>
</Tabs>

## Vector search with filter expressions{#vector-search-with-filter-expressions}

In addition to basic scalar field filtering, you can combine vector similarity searches with scalar field filters. For example, the following code shows how to add a scalar field filter to a vector search:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Search with string filtering

# Filter `varchar_field2` with value "Best seller"
filter = 'varchar_field2 == "Best seller"'

res = client.search(
    collection_name="my_varchar_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["varchar_field1", "varchar_field2"],
    filter=filter
)

print(res)

# Example output:
# data: [
#     "[{'id': 7, 'distance': -0.04468163847923279, 'entity': {'varchar_field1': '', 'varchar_field2': 'Best seller'}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "varchar_field2 == \"Best seller\"";
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
// [[SearchResp.SearchResult(entity={varchar_field1=, varchar_field2=Best seller}, score=-0.04468164, id=7)]]
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
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
    "filter": "varchar_field2 == \"Best seller\""
}'

## {"code":0,"cost":0,"data":[{"distance":-0.2364331,"id":1,"varchar_field1":"Product A","varchar_field2":"High quality product"}]}
```

</TabItem>
</Tabs>