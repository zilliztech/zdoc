---
title: "JSON Field | BYOC"
slug: /use-json-fields
sidebar_label: "JSON Field"
beta: FALSE
notebook: FALSE
description: "A JSON field is a scalar field that stores additional information along with vector embeddings, in key-value pairs. Here's an example of how data is stored in JSON format | BYOC"
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
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON Field

A [JSON](https://en.wikipedia.org/wiki/JSON) field is a scalar field that stores additional information along with vector embeddings, in key-value pairs. Here's an example of how data is stored in JSON format:

```python
{
  "metadata": {
    "product_info": {
      "category": "electronics",
      "brand": "BrandA"
    },
    "price": 99.99,
    "in_stock": true,
    "tags": ["summer_sale", "clearance"]
  }
}
```

## Limits{#limits}

- **Field Size**: JSON fields are limited to 65,536 bytes in size.

- **Nested Dictionaries**: Any nested dictionaries within JSON field values are treated as plain strings for storage.

- **Default Values**: JSON fields do not support default values. However, you can set the `nullable` attribute to `True` to allow null values. For details, refer to [Nullable & Default](./nullable-and-default).

- **Type Matching**: If a JSON field’s key value is an integer or float, it can only be compared (via expression filters) with another numeric key of the same type.

- **Naming**: When naming JSON keys, it is recommended to use only letters, numbers, and underscores. Using other characters may cause issues when filtering or searching.

- **String Handling**: Milvus stores string values in JSON fields as entered, without semantic conversion. For example:

    - `'a"b'`, `"a'b"`, `'a\'b'`, and `"a\"b"` are stored exactly as they are.

    - `'a'b'` and `"a"b"` are considered invalid.

## Add JSON field{#add-json-field}

To add this JSON field `metadata` to your collection schema, use `DataType.JSON`. The example below defines a JSON field `metadata` that allows null values:

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
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("pk").
    WithDataType(entity.FieldTypeInt64).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(3),
).WithField(entity.NewField().
    WithName("metadata").
    WithDataType(entity.FieldTypeJSON),
)
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
    \"enableDynamicField\": true,
    \"fields\": [
        $jsonField,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Set <code>enable_dynamic_fields=True</code> if you need to insert additional, undefined fields in the future.</p></li>
<li><p>Use <code>nullable=True</code> to allow missing or null JSON objects.</p></li>
</ul>

</Admonition>

## Set index params{#set-index-params}

Indexing helps Milvus quickly filter or search across large volumes of data. In Milvus, indexing is:

- **Mandatory** for vector fields (to efficiently run similarity searches).

### Index a vector field{#index-a-vector-field}

The following example creates an index on the vector field `embedding`, using the `AUTOINDEX` index type. With this type, Milvus automatically selects the most suitable index based on the data type.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params

index_params = client.prepare_index_params()

# Index `embedding` with AUTOINDEX and specify similarity metric type
index_params.add_index(
    field_name="embedding",
    index_name="vector_index",
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
        .indexName("vector_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
vectorIndex := index.NewAutoIndex(entity.COSINE)
indexOpt := milvusclient.NewCreateIndexOption("my_collection", "embedding", vectorIndex)
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    index_name: 'embedding_index',
    field_name: 'embedding',
    index_name: 'vector_index',
    metricType: MetricType.CONSINE,
    index_type: IndexType.AUTOINDEX,
));
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "embedding",
            "indexName": "vector_index",
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
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
    WithIndexOptions(indexOpt1, indexOpt2, indexOpt))
if err != nil {
    fmt.Println(err.Error())
    // handler err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    index_params: indexParams
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
    \"collectionName\": \"my_collection\",
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
        "metadata": {
            "product_info": {"category": "electronics", "brand": "BrandA"},
            "price": 99.99,
            "in_stock": True,
            "tags": ["summer_sale"]
        },
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    },
    {
        "metadata": None,  # Entire JSON object is null
        "pk": 2,
        "embedding": [0.56, 0.78, 0.90]
    },
    {
        # JSON field is completely missing
        "pk": 3,
        "embedding": [0.91, 0.18, 0.23]
    },
    {
        # Some sub-keys are null
        "metadata": {
            "product_info": {"category": None, "brand": "BrandB"},
            "price": 59.99,
            "in_stock": None
        },
        "pk": 4,
        "embedding": [0.56, 0.38, 0.21]
    }
]

client.insert(
    collection_name="my_collection",
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
rows.add(gson.fromJson("{\"metadata\":{\"product_info\":{\"category\":\"electronics\",\"brand\":\"BrandA\"},\"price\":99.99,\"in_stock\":True,\"tags\":[\"summer_sale\"]},\"pk\":1,\"embedding\":[0.12,0.34,0.56]}", JsonObject.class));
rows.add(gson.fromJson("{\"metadata\":null,\"pk\":2,\"embedding\":[0.56,0.78,0.90]}", JsonObject.class));
rows.add(gson.fromJson("{\"pk\":3,\"embedding\":[0.91,0.18,0.23]}", JsonObject.class));
rows.add(gson.fromJson("{\"metadata\":{\"product_info\":{\"category\":null,\"brand\":\"BrandB\"},\"price\":59.99,\"in_stock\":null},\"pk\":4,\"embedding\":[0.56,0.38,0.21]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("pk", []int64{1, 2, 3, 4}).
    WithFloatVectorColumn("embedding", 3, [][]float32{
        {0.12, 0.34, 0.56},
        {0.56, 0.78, 0.90},
        {0.91, 0.18, 0.23},
        {0.56, 0.38, 0.21},
    }).WithColumns(
    column.NewColumnJSONBytes("metadata", [][]byte{
        []byte(`{
    "product_info": {"category": "electronics", "brand": "BrandA"},
    "price": 99.99,
    "in_stock": True,
    "tags": ["summer_sale"]
}`),
        []byte(`null`),
        []byte(`null`),
        []byte(`"metadata": {
    "product_info": {"category": None, "brand": "BrandB"},
    "price": 59.99,
    "in_stock": None
}`),
    }),
))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {
        "metadata": {
            "product_info": {"category": "electronics", "brand": "BrandA"},
            "price": 99.99,
            "in_stock": True,
            "tags": ["summer_sale"]
        },
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    },
    {
        "metadata": None,  # Entire JSON object is null
        "pk": 2,
        "embedding": [0.56, 0.78, 0.90]
    },
    {
        # JSON field is completely missing
        "pk": 3,
        "embedding": [0.91, 0.18, 0.23]
    },
    {
        # Some sub-keys are null
        "metadata": {
            "product_info": {"category": None, "brand": "BrandB"},
            "price": 59.99,
            "in_stock": None
        },
        "pk": 4,
        "embedding": [0.56, 0.38, 0.21]
    }
];

await client.insert({
    collection_name: "my_collection",
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
--data '{
    "data": [
        {
             "metadata":  {
                   "product_info": {"category": "electronics", "brand": "BrandA"},
                  "price":  99.99,
                   "in_stock":  true,
                  "tags": ["summer_sale"]
              }, 
             "varchar_field2": "High quality product", 
             "pk": 1, 
             "embedding": [0.1, 0.2, 0.3]
          },
          {
              "metadata": null,
              "pk": 2,
              "embedding": [0.56, 0.78, 0.90]
          },
         {
               "pk": 3,
               "embedding": [0.91, 0.18, 0.23]
         },
        {
              "metadata": {
                     "product_info": {"category": null, "brand": "BrandB"},
                     "price": 59.99,
                     "in_stock": null
               },
              "pk": 4,
              "embedding": [0.56, 0.38, 0.21]
         }
    ],
    "collectionName": "my_collection"
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
    collection_name="my_collection",
    filter=filter,
    output_fields=["metadata", "pk"]
)

# Expected result:
# Rows with pk=1 and pk=4 have valid, non-null metadata.
# Rows with pk=2 (metadata=None) and pk=3 (no metadata key) are excluded.

print(res)

# Output:
# data: [
#     "{'metadata': {'product_info': {'category': 'electronics', 'brand': 'BrandA'}, 'price': 99.99, 'in_stock': True, 'tags': ['summer_sale']}, 'pk': 1}",
#     "{'metadata': {'product_info': {'category': None, 'brand': 'BrandB'}, 'price': 59.99, 'in_stock': None}, 'pk': 4}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "metadata is not null";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("metadata", "pk"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [
//    QueryResp.QueryResult(entity={metadata={"product_info":{"category":"electronics","brand":"BrandA"},"price":99.99,"in_stock":true,"tags":["summer_sale"]}, pk=1}),
//    QueryResp.QueryResult(entity={metadata={"product_info":{"category":null,"brand":"BrandB"},"price":59.99,"in_stock":null}, pk=4})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter := "metadata is not null"
rs, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("metadata", "pk"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("pk", rs.GetColumn("pk").FieldData().GetScalars())
fmt.Println("metadata", rs.GetColumn("metadata").FieldData().GetScalars())
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.query({
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
    "collectionName": "my_collection",
    "filter": "metadata is not null",
    "outputFields": ["metadata", "pk"]
}'

#{"code":0,"cost":0,"data":[{"metadata":"{\"product_info\": {\"category\": \"electronics\", \"brand\": \"BrandA\"}, \"price\": 99.99, \"in_stock\": true, \"tags\": [\"summer_sale\"]}","pk":1},{"metadata":"","pk":2},{"metadata":"","pk":3},{"metadata":"{\"product_info\": {\"category\": null, \"brand\": \"BrandB\"}, \"price\": 59.99, \"in_stock\": null}","pk":4}]}
```

</TabItem>
</Tabs>

To retrieve entities where `metadata["product_info"]["category"]` is `"electronics"`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata["product_info"]["category"] == "electronics"'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["metadata", "pk"]
)

# Expected result:
# - Only pk=1 has "category": "electronics".
# - pk=4 has "category": None, so it doesn't match.
# - pk=2 and pk=3 have no valid metadata.

print(res)

# Output:
# data: [
#     "{'pk': 1, 'metadata': {'product_info': {'category': 'electronics', 'brand': 'BrandA'}, 'price': 99.99, 'in_stock': True, 'tags': ['summer_sale']}}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "metadata[\"product_info\"][\"category\"] == \"electronics\"";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("metadata", "pk"))
        .build());

System.out.println(resp.getQueryResults());

// Output
// [QueryResp.QueryResult(entity={metadata={"product_info":{"category":"electronics","brand":"BrandA"},"price":99.99,"in_stock":true,"tags":["summer_sale"]}, pk=1})]
```

</TabItem>

<TabItem value='go'>

```go
filter = `metadata["product_info"]["category"] == "electronics"`
rs, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("metadata", "pk"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("pk", rs.GetColumn("pk").FieldData().GetScalars())
fmt.Println("metadata", rs.GetColumn("metadata").FieldData().GetScalars())
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'metadata["category"] == "electronics"';
const res = await client.query({
    collection_name: "my_collection",
    filter: filter,
    output_fields: ["metadata", "pk"]
});

// Example output:
// {
//.  data: [
//      {'pk': 1, 'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}}
// ]
// }
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
  "collectionName": "my_collection",
  "filter": "metadata[\"product_info\"][\"category\"] == \"electronics\"",
  "outputFields": ["metadata", "pk"]
}'

#{"code":0,"cost":0,"data":[{"metadata":"{\"product_info\": {\"category\": \"electronics\", \"brand\": \"BrandA\"}, \"price\": 99.99, \"in_stock\": true, \"tags\": [\"summer_sale\"]}","pk":1}]}
```

</TabItem>
</Tabs>

## Vector search with filter expressions{#vector-search-with-filter-expressions}

In addition to basic scalar field filtering, you can combine vector similarity searches with scalar field filters. For example, the following code shows how to add a scalar field filter to a vector search:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata["product_info"]["brand"] == "BrandA"'

res = client.search(
    collection_name="my_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["metadata"],
    filter=filter
)

# Expected result:
# - Only pk=1 has "brand": "BrandA" in metadata["product_info"].
# - pk=4 has "brand": "BrandB".
# - pk=2 and pk=3 have no valid metadata.
# Hence, only pk=1 matches the filter.

print(res)

# Output:
# data: [
#     "[{'id': 1, 'distance': -0.2479381263256073, 'entity': {'metadata': {'product_info': {'category': 'electronics', 'brand': 'BrandA'}, 'price': 99.99, 'in_stock': True, 'tags': ['summer_sale']}}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "metadata[\"product_info\"][\"brand\"] == \"BrandA\"";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Collections.singletonList("metadata"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [
//   [
//     SearchResp.SearchResult(entity={metadata={"product_info":{"category":"electronics","brand":"BrandA"},"price":99.99,"in_stock":true,"tags":["summer_sale"]}}, score=-0.24793813, id=1)
//   ]
// ]

```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3, -0.6, -0.1}
filter = "metadata[\"product_info\"][\"brand\"] == \"BrandA\""

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 10)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithFilter(filter).
    WithOutputFields("metadata").
    WithAnnParam(annParam))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("metadata", resultSet.GetColumn("metadata").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
  "collectionName": "my_collection",
  "data": [
    [0.3, -0.6, 0.1]
  ],
  "annsField": "embedding",
  "limit": 5,
  "searchParams": {
    "params": {
      "nprobe": 10
    }
  },
  "outputFields": ["metadata"],
  "filter": "metadata[\"product_info\"][\"brand\"] == \"BrandA\""
}'

##{"code":0,"cost":0,"data":[{"metadata":"{\"product_info\": {\"category\": \"electronics\", \"brand\": \"BrandA\"}, \"price\": 99.99, \"in_stock\": true, \"tags\": [\"summer_sale\"]}","pk":1}]}
```

</TabItem>
</Tabs>

Additionally, Zilliz Cloud supports advanced JSON filtering operators such as `JSON_CONTAINS`, `JSON_CONTAINS_ALL`, and `JSON_CONTAINS_ANY`, which can further enhance query capabilities. For more details, refer to [JSON Operators](./json-filtering-operators).

