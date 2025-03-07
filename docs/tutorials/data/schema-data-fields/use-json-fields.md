---
title: "JSON Field | Cloud"
slug: /use-json-fields
sidebar_label: "JSON Field"
beta: FALSE
notebook: FALSE
description: "A JSON field is a scalar field that stores additional information along with vector embeddings, in key-value pairs. Here's an example of how data is stored in JSON format | Cloud"
type: origin
token: BkDMwo71MiZMazk7gbtc7fqknbh
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - json field
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON Field

A JSON field is a scalar field that stores additional information along with vector embeddings, in key-value pairs. Here's an example of how data is stored in JSON format:

```python
{
  "category": "electronics",
  "price": 99.99,
  "brand": "BrandA"
}
```

## Limits{#limits}

- **Indexing**: JSON fields do not support indexing.

- **Default Values**: JSON fields do not support default values. However, you can set the `nullable` attribute to `True` to allow null values. For details, refer to [Nullable & Default](./nullable-and-default).

- **Key Value Comparisons**:

    - If a JSON field's key value is an integer or float, it can only be compared with another integer or float key.

    - If the key value is a string (`VARCHAR`), it can only be compared with other string keys.

- **Naming**: When naming JSON keys, it is recommended to use only letters, numbers, and underscores. Using other characters may cause issues when filtering or searching.

- **String Handling**: Milvus stores string values in JSON fields as entered, without semantic conversion. For example:

    - `'a"b'`, `"a'b"`, `'a\'b'`, and `"a\"b"` are stored exactly as they are.

    - `'a'b'` and `"a"b"` are considered invalid.

- **Nested Dictionaries**: Any nested dictionaries within JSON field values are treated as plain strings.

- **Field Size Limitation**: JSON fields are limited to 65,536 bytes in size.

## Add JSON field{#add-json-field}

To store key-value pairs in a JSON field, define a JSON field in your collection schema. Below is an example of a collection schema with a JSON field `metadata` that allows null values:

<Admonition type="info" icon="📘" title="Notes">

<p>If you set <code>enable_dynamic_fields=True</code> when defining the schema, Zilliz Cloud allows you to insert scalar fields that were not defined in advance. However, this may increase the complexity of queries and management, potentially impacting performance. For more information, refer to <a href="./enable-dynamic-field">Dynamic Field</a>.</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

# Add a JSON field that supports null values
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)
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
        .fieldName("metadata")
        .dataType(DataType.JSON)
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

<TabItem value='go'>

```go
// go
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
    name: "embedding",
    data_type: DataType.FloatVector,
    dim: 3,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export jsonField='{
    "fieldName": "metadata",
    "dataType": "JSON"
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
        $jsonField,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

## Set index params{#set-index-params}

Indexing helps improve search and query performance. In Zilliz Cloud clusters, indexing is mandatory for vector fields but optional for scalar fields. However, Milvus does not support indexing for JSON fields.

The following example creates an index on the vector field `embedding`, using the `AUTOINDEX` index type. With this type, Milvus automatically selects the most suitable index based on the data type.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params

index_params = client.prepare_index_params()

# Index `embedding` with AUTOINDEX and specify similarity metric type
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
const indexParams = {
    index_name: 'embedding_index',
    field_name: 'embedding',
    metricType: MetricType.CONSINE,
    index_type: IndexType.AUTOINDEX,
);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
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
client.create_collection(
    collection_name="my_json_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_json_collection")
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
client.create_collection({
    collection_name: "my_json_collection",
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
    \"collectionName\": \"my_json_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
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
  {
      "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "metadata": None, # Entire JSON object is null
      "pk": 2,
      "embedding": [0.56, 0.78, 0.90]
  },
  {  # JSON field `metadata` is completely missing
      "pk": 3,
      "embedding": [0.91, 0.18, 0.23]
  },
  {
      "metadata": {"category": None, "price": 99.99, "brand": "BrandA"}, # Individual key value is null
      "pk": 4,
      "embedding": [0.56, 0.38, 0.21]
  }
]

client.insert(
    collection_name="my_json_collection",
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
rows.add(gson.fromJson("{\"metadata\": {\"category\": \"electronics\", \"price\": 99.99, \"brand\": \"BrandA\"}, \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"metadata\": None, \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"metadata\": {\"category\": \"furniture\", \"price\": 399.99, \"brand\": \"BrandC\"}, \"pk\": 3, \"embedding\": [0.7, 0.8, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_json_collection")
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
      "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "metadata": {"category": "home_appliances", "price": 249.99, "brand": "BrandB"},
      "pk": 2,
      "embedding": [0.56, 0.78, 0.90]
  },
  {
      "metadata": {"category": "furniture", "price": 399.99, "brand": "BrandC"},
      "pk": 3,
      "embedding": [0.91, 0.18, 0.23]
  }
]

client.insert({
    collection_name: "my_json_collection",
    data: data
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
        {
            "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
            "pk": 1,
            "embedding": [0.12, 0.34, 0.56]
        },
        {
            "metadata": {"category": "home_appliances", "price": 249.99, "brand": "BrandB"},
            "pk": 2,
            "embedding": [0.56, 0.78, 0.90]
        },
        {
            "metadata": {"category": "furniture", "price": 399.99, "brand": "BrandC"},
            "pk": 3,
            "embedding": [0.91, 0.18, 0.23]
        }       
    ],
    "collectionName": "my_json_collection"
}'
```

</TabItem>
</Tabs>

## Query with filter expressions{#query-with-filter-expressions}

After inserting entities, use the `query` method to retrieve entities that match the specified filter expressions.

<Admonition type="info" icon="📘" title="Notes">

<p>For JSON fields that allow null values, the field will be treated as null if the entire JSON object is missing or set to <code>None</code>. For more information, refer to <a href="./basic-filtering-operators#json-fields-with-null-values">JSON Fields with Null Values</a>.</p>

</Admonition>

To retrieve entities where `metadata` is not null:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query to filter out records with null metadata

filter = 'metadata is not null'

res = client.query(
    collection_name="my_json_collection",
    filter=filter,
    output_fields=["metadata", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "metadata[\"category\"] == \"electronics\" and metadata[\"price\"] < 150";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_json_collection")
        .filter(filter)
        .outputFields(Collections.singletonList("metadata"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={metadata={"category":"electronics","price":99.99,"brand":"BrandA"}, pk=1})]
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_scalar_collection',
    filter: 'metadata["category"] == "electronics" and metadata["price"] < 150',
    output_fields: ['metadata']
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
    "collectionName": "my_json_collection",
    "filter": "metadata[\"category\"] == \"electronics\" and metadata[\"price\"] < 150",
    "outputFields": ["metadata"]
}'
{"code":0,"cost":0,"data":[{"metadata":"{\"category\": \"electronics\", \"price\": 99.99, \"brand\": \"BrandA\"}","pk":1}]}
```

</TabItem>
</Tabs>

To retrieve entities where the `category` key in the `metadata` JSON field has a value of `"electronics"`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata["category"] == "electronics"'

res = client.query(
    collection_name="my_json_collection",
    filter=filter,
    output_fields=["metadata", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'pk': 1, 'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
// java
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
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## Vector search with filter expressions{#vector-search-with-filter-expressions}

In addition to basic scalar field filtering, you can combine vector similarity searches with scalar field filters. For example, the following code shows how to add a scalar field filter to a vector search:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata["brand"] == "BrandA"'

res = client.search(
    collection_name="my_json_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["metadata"],
    filter=filter
)

print(res)

# Example output:
# data: [
#     "[{'id': 4, 'distance': -0.08115037530660629, 'entity': {'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}}}, {'id': 1, 'distance': -0.2479381263256073, 'entity': {'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "metadata[\"brand\"] == \"BrandA\"";
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_json_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Collections.singletonList("metadata"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={metadata={"category":"electronics","price":99.99,"brand":"BrandA"}}, score=-0.2364331, id=1)]]
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_json_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['metadata'],
    filter: 'metadata["category"] == "electronics" and metadata["price"] < 150',
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
    "collectionName": "my_json_collection",
    "data": [
        [0.3, -0.6, 0.1]
    ],
    "annsField": "embedding",
    "limit": 5,
    "searchParams":{
        "params":{"nprobe":10}
    },
    "outputFields": ["metadata"],
    "filter": "metadata[\"brand\"] == \"BrandA\""
}'

## {"code":0,"cost":0,"data":[{"distance":-0.24793813,"id":1,"metadata":"{\"category\": \"electronics\", \"price\": 99.99, \"brand\": \"BrandA\"}"}]}
```

</TabItem>
</Tabs>

Additionally, Zilliz Cloud supports advanced JSON filtering operators such as `JSON_CONTAINS`, `JSON_CONTAINS_ALL`, and `JSON_CONTAINS_ANY`, which can further enhance query capabilities. For more details, refer to [JSON Operators](./json-filtering-operators).

