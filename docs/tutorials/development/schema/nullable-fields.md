---
title: "Nullable Fields | Cloud"
slug: /nullable-fields
sidebar_label: "Nullable Fields"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud supports nullable fields, which allow a field value to be missing or explicitly set to NULL. Nullability is defined at the schema level and applies consistently across data ingestion, indexing, search, and query operations. | Cloud"
type: origin
token: DjROwgK6ziCf7Rkoji6ccyEUnsg
sidebar_position: 15
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - nullable
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nullable Fields

Zilliz Cloud supports nullable fields, which allow a field value to be missing or explicitly set to NULL. Nullability is defined at the schema level and applies consistently across data ingestion, indexing, search, and query operations.

Use nullable fields when:

- Data is ingested from external systems that allow missing values

- Some metadata is optional or only available for part of the dataset

- Vector embeddings are generated asynchronously and inserted later

## Limits\{#limits}

- Vector fields that allow NULL values do not support `IS NULL` or `IS NOT NULL` filter expressions. You cannot explicitly filter entities based on whether a vector field value is NULL.

- Array of Structs fields do not support NULL values. You cannot mark an Array of Structs field or any field nested inside it as nullable.

- The `nullable` attribute is defined when a field is created and cannot be modified afterward. You cannot enable or disable nullability for an existing field.

- Fields marked as nullable cannot be used as partition keys. Partition key fields must always contain valid, non-null values.

## What is a nullable field?\{#what-is-a-nullable-field}

In Zilliz Cloud, whether a field is allowed to store a NULL value is controlled by a schema-level field attribute named `nullable`.

When a field is defined with `nullable=True`, Zilliz Cloud allows the field value to be missing during data ingestion. In practice, Zilliz Cloud treats the following two inputs as equivalent and stores the field value as NULL:

- The field is omitted from the input entity

- The field is explicitly set to NULL (for example, `None` in Python)

If a field is not defined as nullable (the default behavior), every entity must provide a valid value for that field. Omitting the field or explicitly assigning a NULL value will cause the insert or import operation to fail.

The nullable attribute is supported for both **scalar and vector fields** in a collection schema. However, Array of Structs fields do not support the nullable attribute.

<Admonition type="info" icon="📘" title="Notes">

<p>Nullability determines whether a field value may be missing; it does not define what value is used when a field is missing.</p>
<ul>
<li><p>If a nullable field is configured without a default value, omitting the field results in a stored NULL value.</p></li>
<li><p>If a default value is configured, Zilliz Cloud may store the default value instead. For details, see <a href="./default-fields">Default Values</a>.</p></li>
</ul>

</Admonition>

## Define a nullable field in the collection schema\{#define-a-nullable-field-in-the-collection-schema}

To use nullable fields, you must enable the `nullable` attribute when defining the collection schema.

In this example, the collection schema defines a vector field named `embedding` with `nullable=True`. This allows entities in the collection to omit the vector value or explicitly set it to NULL during data ingestion.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Define schema fields
schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True) # Primary field
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
    # highlight-next-line
    nullable=True, # Enable the nullable attribute; defaults to False
)

client.create_collection(
    collection_name="my_collection",
    schema=schema,
)
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
        .token("YOUR_CLUSTER_TOKEN")
        .build());

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        // highlight-next-line
        .isNullable(true)
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .build());

```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

await client.createCollection({
  collection_name: 'my_collection',
  fields: [
    {
      name: 'id',
      data_type: DataType.Int64,
      is_primary_key: true
    },
    {
      name: 'embedding',
      data_type: DataType.FloatVector,
      dim: 4,
      // highlight-next-line
      nullable: true // Enable the nullable attribute; defaults to false
    }
  ]
});

```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(4).
    // highlight-next-line
    WithNullable(true),
)

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "schema": {
      "autoID": false,
      "fields": [
        {
          "fieldName": "id",
          "dataType": "Int64",
          "isPrimary": true
        },
        {
          "fieldName": "embedding",
          "dataType": "FloatVector",
          "elementTypeParams": {
            "dim": "4"
          },
          "nullable": true
        }
      ]
    }
  }'

```

</TabItem>
</Tabs>

In this schema:

- The `embedding` field is explicitly marked as nullable.

- Entities may omit the `embedding` field or assign it a NULL value during insertion.

- The decision to allow NULL values is fixed at collection creation time.

For clarity, the following examples focus on a nullable vector field (`embedding`). Defining nullable scalar fields is optional and not required to follow the rest of this guide.

<details>

<summary>**Optional: Define a nullable scalar field**</summary>

Scalar fields can also be defined as nullable using the same `nullable` attribute and follow the same rules during ingestion. For example:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="age",
    datatype=DataType.INT64,
    # highlight-next-line
    nullable=True,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        // highlight-next-line
        .isNullable(true)
        .build());

```

</TabItem>

<TabItem value='javascript'>

```javascript
const ageField = {
  name: 'age',
  data_type: DataType.Int64,
  // highlight-next-line
  nullable: true
};

```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().
    WithName("age").
    WithDataType(entity.FieldTypeInt64).
    // highlight-next-line
    WithNullable(true),
)

```

</TabItem>

<TabItem value='bash'>

```bash
{
  "fieldName": "age",
  "dataType": "Int64",
  "nullable": true
}

```

</TabItem>
</Tabs>

</details>

## Insert behavior with missing or NULL values\{#insert-behavior-with-missing-or-null-values}

Once a field is defined as nullable in the collection schema, Zilliz Cloud allows the field value to be missing or explicitly set to NULL during data ingestion.

The example below inserts three entities into the collection created in [Step 1](./nullable-fields#define-a-nullable-field-in-the-collection-schema), demonstrating these different cases.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {
        "id": 1,
        "embedding": [0.1, 0.2, 0.3, 0.4],
    },
    {
        "id": 2,
        "embedding": None,   # Explicitly set to NULL
    },
    {
        "id": 3,             # Field omitted → stored as NULL
    },
]

client.insert(
    collection_name="my_collection",
    data=data,
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;

import java.util.Arrays;
import java.util.List;

Gson gson = new Gson();

JsonObject row1 = new JsonObject();
row1.addProperty("id", 1);
row1.add("embedding", gson.toJsonTree(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f)));

JsonObject row2 = new JsonObject();
row2.addProperty("id", 2);
row2.add("embedding", JsonNull.INSTANCE); // Explicitly set to NULL

JsonObject row3 = new JsonObject();
row3.addProperty("id", 3); // Field omitted; stored as NULL

List<JsonObject> data = Arrays.asList(row1, row2, row3);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(data)
        .build());

```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  {
    id: 1,
    embedding: [0.1, 0.2, 0.3, 0.4]
  },
  {
    id: 2,
    embedding: null // Explicitly set to NULL
  },
  {
    id: 3 // Field omitted; stored as NULL
  }
];

await client.insert({
  collection_name: 'my_collection',
  data
});

```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

embeddingCol, err := column.NewNullableColumnFloatVector(
    "embedding",
    4,
    [][]float32{{0.1, 0.2, 0.3, 0.4}},
    []bool{true, false, false},
)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption(
    "my_collection",
    column.NewColumnInt64("id", []int64{1, 2, 3}),
    embeddingCol,
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "data": [
      {
        "id": 1,
        "embedding": [0.1, 0.2, 0.3, 0.4]
      },
      {
        "id": 2,
        "embedding": null
      },
      {
        "id": 3
      }
    ]
  }'

```

</TabItem>
</Tabs>

In this example:

- Entity **id = 1** provides a valid vector value.

- Entity **id = 2** explicitly assigns a NULL value to the embedding field.

- Entity **id = 3** omits the embedding field entirely; Zilliz Cloud stores it as NULL.

## Index behavior on nullable fields\{#index-behavior-on-nullable-fields}

After inserting data, you can build an index on a nullable field as usual. The key difference is how Zilliz Cloud handles NULL values during index construction:

- Only entities with non-null values are added to the index.

- Entities with NULL values are skipped and do not participate in index building.

For a nullable vector field, this means only entities with valid vectors become searchable by vector similarity.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index parameters
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

# Create index
client.create_index(
    collection_name="my_collection",
    index_params=index_params,
)

# Load collection for future search operations
client.load_collection(collection_name="my_collection")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.index.request.CreateIndexReq;

import java.util.Collections;

IndexParam indexParam = IndexParam.builder()
        .fieldName("embedding")
        .indexName("embedding_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();

client.createIndex(CreateIndexReq.builder()
        .collectionName("my_collection")
        .indexParams(Collections.singletonList(indexParam))
        .build());

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build());

```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
  collection_name: 'my_collection',
  field_name: 'embedding',
  index_type: 'AUTOINDEX',
  metric_type: 'COSINE'
});

await client.loadCollection({
  collection_name: 'my_collection'
});

```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

indexTask, err := client.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection",
    "embedding",
    index.NewAutoIndex(entity.COSINE),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = indexTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = loadTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "indexParams": [
      {
        "fieldName": "embedding",
        "indexName": "embedding_index",
        "indexType": "AUTOINDEX",
        "metricType": "COSINE"
      }
    ]
  }'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection"
  }'

```

</TabItem>
</Tabs>

At this point:

- Entities with valid `embedding` values are indexed and ready for search.

- Entities whose `embedding` is NULL remain in the collection, but they are not included in the vector index.

## Search behavior with nullable fields\{#search-behavior-with-nullable-fields}

When you perform search operations on a nullable field, Zilliz Cloud evaluates only entities with non-null values for the field used in the search. Entities whose vector field is NULL are skipped automatically.

For a nullable vector field such as `embedding` in this example:

- Only entities with valid vector values are evaluated and ranked.

- Entities with NULL vectors do not cause errors.

- If the number of valid vectors is smaller than the requested topK (`limit`), Zilliz Cloud may return fewer results than `limit`.

The following example performs a vector search on the nullable vector field `embedding`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="embedding",
    limit=3,
    output_fields=["embedding"],
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;
import java.util.Collections;

SearchResp res = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f))))
        .annsField("embedding")
        .limit(3)
        .outputFields(Collections.singletonList("embedding"))
        .build());

System.out.println(res);

```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
  collection_name: 'my_collection',
  data: [[0.1, 0.2, 0.3, 0.4]],
  anns_field: 'embedding',
  limit: 3,
  output_fields: ['embedding']
});

console.log(res);

```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

query := []float32{0.1, 0.2, 0.3, 0.4}
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.FloatVector(query)},
).WithANNSField("embedding").
    WithOutputFields("embedding"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(resultSets)

```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "data": [[0.1, 0.2, 0.3, 0.4]],
    "annsField": "embedding",
    "limit": 3,
    "outputFields": ["embedding"]
  }'

```

</TabItem>
</Tabs>

In this search:

- Only entities with non-null `embedding` values are considered candidates.

- Entities with NULL values for `embedding` are excluded from evaluation.

- The number of returned results depends on how many valid vectors exist in the collection.

## Query & filtering implications\{#query-and-filtering-implications}

The previous examples focus on vector fields. This section describes how NULL values behave in **scalar filter expressions**.

Scalar fields can be defined with `nullable=True` and follow the same ingestion rules as vector fields. However, **NULL scalar values always evaluate to false in filter expressions**.

For example, given a nullable scalar field `age`, the following filter selects entities whose `age` is greater than 18:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "age > 18"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "age > 18";

```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'age > 18';

```

</TabItem>

<TabItem value='go'>

```go
filter := "age > 18"

```

</TabItem>

<TabItem value='bash'>

```bash
"filter": "age > 18"

```

</TabItem>
</Tabs>

Entities where `age` is NULL are excluded from the results because a NULL value does not satisfy the filter condition.

Similarly, equality checks do not match NULL values. For example:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "status == \"active\""
```

</TabItem>

<TabItem value='java'>

```java
String filter = "status == \"active\"";

```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'status == "active"';

```

</TabItem>

<TabItem value='go'>

```go
filter := `status == "active"`

```

</TabItem>

<TabItem value='bash'>

```bash
"filter": "status == \"active\""

```

</TabItem>
</Tabs>

Entities where `status` is NULL are excluded from the results.

## Applicable rules\{#applicable-rules}

When both `nullable` and `default_value` are configured for a field, the following rules determine how Zilliz Cloud handles NULL input or missing field values during insertion.

<table>
   <tr>
     <th><p>Nullable</p></th>
     <th><p>Default Value</p></th>
     <th><p>User Input</p></th>
     <th><p>Result</p></th>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>✅ (non-NULL)</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Uses the default value</p></td>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Stored as NULL</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅ (non-NULL)</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Uses the default value</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Throws an error</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅ (NULL)</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Throws an error</p></td>
   </tr>
</table>

**Key takeaways:**

- When a field has a non-NULL default value, that value is used regardless of whether `nullable` is enabled.

- When `nullable=True` but no default value is set, the field stores NULL.

- When `nullable=False` and no default value is set, insertion fails with an error.

- Setting a NULL default value on a non-nullable field is invalid and causes an error.

