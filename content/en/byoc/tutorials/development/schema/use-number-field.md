---
title: "Boolean & Number | BYOC"
slug: /use-number-field
sidebar_label: "Boolean & Number"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A boolean or number field is a scalar field that stores boolean or numeric values. These values can be one of two possible values or whole numbers (integers) and decimal numbers (floating-point numbers). They are typically used to represent quantities, measurements, or any data that needs to be logically or mathematically processed. | BYOC"
type: origin
token: EwArwXCOPip15hkSvvpciAMJnSe
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Boolean & Number

A boolean or number field is a scalar field that stores boolean or numeric values. These values can be one of two possible values or whole numbers (**integers**) and decimal numbers (**floating-point numbers**). They are typically used to represent quantities, measurements, or any data that needs to be logically or mathematically processed.

The table below describes the data types of number fields available in Zilliz Cloud clusters.

| Field Type | Description |
| --- | --- |
| `BOOL` | Boolean type for storing `true` or `false`, suitable for describing binary states. |
| `INT8` | 8-bit integer, suitable for storing small-range integer data. |
| `INT16` | 16-bit integer, for medium-range integer data. |
| `INT32` | 32-bit integer, ideal for general integer data storage like product quantities or user IDs. |
| `INT64` | 64-bit integer, suitable for storing large-range data like timestamps or identifiers. |
| `FLOAT` | 32-bit floating-point number, for data requiring general precision, such as ratings or temperature. |
| `DOUBLE` | 64-bit double-precision floating-point number, for high-precision data like financial information or scientific calculations. |

To declare a boolean field, simply set `datatype` to `BOOL`. To declare a number field, simply set that to one of the available numeric data types. For example, `DataType.INT64` for an integer field or `DataType.FLOAT` for a floating-point field.

<Admonition type="info" title="Notes">

Zilliz Cloud supports null values and default values for boolean and number fields. To enable these features, set `nullable` to `True` and `default_value` to a numeric value. For details, refer to [Nullable & Default](./nullable-fields).

</Admonition>

## Add boolean and number fields\{#add-boolean-and-number-fields}

To store boolean or numeric data, define corresponding types of fields in your collection schema. Below is an example of a collection schema with two number fields:

- `age`: stores integer data, allows null values, and has a default value of `18`.

- `broken`: stores boolean data, allows null values, but does not have a default value.

- `price`: stores float data, allows null values, but does not have a default value.

<Admonition type="info" title="Notes">

If you set `enable_dynamic_fields=True` when defining the schema, Zilliz Cloud allows you to insert scalar fields that were not defined in advance. However, this may increase the complexity of queries and management, potentially impacting performance. For more information, refer to [Dynamic Field](./enable-dynamic-field).

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

# Add an INT64 field `age` that supports null values with default value 18
schema.add_field(field_name="age", datatype=DataType.INT64, nullable=True, default_value=18)
schema.add_field(field_name="broken", datatype=DataType.BOOL, nullable=True)
# Add a FLOAT field `price` that supports null values without default value
schema.add_field(field_name="price", datatype=DataType.FLOAT, nullable=True)
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

CreateCollectionReq.CollectionSchema schema = MilvusClientV2.CreateSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        .isNullable(true)
        .defaultValue(18)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("broken")
        .dataType(DataType.BOOL)
        .isNullable(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Float)
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

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
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

schema := entity.NewSchema().
    WithField(entity.NewField().
        WithName("pk").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true)).
    WithField(entity.NewField().
        WithName("embedding").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(3)).
    WithField(entity.NewField().
        WithName("price").
        WithDataType(entity.FieldTypeFloat).
        WithNullable(true)).
    WithField(entity.NewField().
        WithName("age").
        WithDataType(entity.FieldTypeInt64).
        WithNullable(true).
        WithDefaultValueLong(18)).
    WithField(entity.NewField().
        WithName("broken").
        WithDataType(entity.FieldTypeBool).
        WithNullable(true))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(
    &ConnectConfig::new()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN"),
)
.await?;

let mut schema = CollectionSchema::new().enable_dynamic_field(true);
schema = schema
    .add_field(
        FieldSchema::new()
            .name("pk")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    .add_field(
        FieldSchema::new()
            .name("embedding")
            .data_type(DataType::FloatVector)
            .dimension(3),
    )
    .add_field(
        FieldSchema::new()
            .name("price")
            .data_type(DataType::Float)
            .nullable(true),
    )
    .add_field(
        FieldSchema::new()
            .name("age")
            .data_type(DataType::Int64)
            .nullable(true),
    )
    .add_field(
        FieldSchema::new()
            .name("broken")
            .data_type(DataType::Bool)
            .nullable(true),
    );
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"pk", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(3));
schema->AddField(milvus::FieldSchema("price", milvus::DataType::FLOAT).WithNullable(true));
schema->AddField(milvus::FieldSchema("age", milvus::DataType::INT64).WithNullable(true).WithDefaultValue(18));
schema->AddField(milvus::FieldSchema("broken", milvus::DataType::BOOL).WithNullable(true));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
const schema = [
  {
    name: "age",
    data_type: DataType.Int64,
    nullable: true,
    default_value: 18,
  },
  {
    name: "broken",
    data_type: DataType.Bool,
    nullable: true,
  },
  {
    name: "price",
    data_type: DataType.Float,
    nullable: true,
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
export ageField='{
    "fieldName": "age",
    "dataType": "Int64",
    "nullable": true,
    "defaultValue": 18
}'

export boolField='{
    "fieldName": "broken",
    "dataType": "Bool",
    "nullable": true
}'

export floatField='{
    "fieldName": "price",
    "dataType": "Float",
    "nullable": true
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
        $ageField,
        $boolField,
        $floatField,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

## Set index params\{#set-index-params}

Indexing helps improve search and query performance. In Zilliz Cloud clusters, indexing is mandatory for vector fields but optional for scalar fields.

The following example creates indexes on the vector field `embedding` and the scalar field `age`, both using the `AUTOINDEX` index type. With this type, Milvus automatically selects the most suitable index based on the data type.For details, refer to [AUTOINDEX Explained](./autoindex-explained).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params

index_params = client.prepare_index_params()

# Index `age` with AUTOINDEX
index_params.add_index(
    field_name="age",
    index_type="AUTOINDEX",
    index_name="age_index"
)

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
        .fieldName("age")
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
indexOption1 := milvusclient.NewCreateIndexOption("my_collection", "embedding",
    index.NewAutoIndex(index.MetricType(index.COSINE)))
indexOption2 := milvusclient.NewCreateIndexOption("my_collection", "age",
    index.NewAutoIndex())
```

</TabItem>

<TabItem value='rust'>

```rust
let index_params = vec![
    IndexParam::new()
        .field_name("age")
        .index_name("age_index")
        .index_type(IndexType::AutoIndex),
    IndexParam::new()
        .field_name("embedding")
        .index_type(IndexType::AutoIndex)
        .metric_type(MetricType::Cosine),
];
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("age", "age_index", milvus::IndexType::AUTOINDEX),
    milvus::IndexDesc("embedding", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)
};
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

## Create collection\{#create-collection}

Once the schema and indexes are defined, create a collection that includes number fields.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create Collection
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
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption1, indexOption2))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("my_collection")
            .schema(schema)
            .index_params(index_params)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName("my_collection")
                                        .WithIndexes(std::move(indexes))
                                        .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
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
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## Insert data\{#insert-data}

After creating the collection, insert entities that match the schema.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample data
data = [
    {"age": 25, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"age": 30, "pk": 2, "embedding": [0.4, 0.5, 0.6]}, # `price` field is missing, which should be null
    {"age": None, "price": None, "pk": 3, "embedding": [0.2, 0.3, 0.1]},  # `age` should default to 18, `price` is null
    {"age": 45, "price": None, "pk": 4, "embedding": [0.9, 0.1, 0.4]},  # `price` is null
    {"age": None, "price": 59.99, "pk": 5, "embedding": [0.8, 0.5, 0.3]},  # `age` should default to 18
    {"age": 60, "price": None, "pk": 6, "embedding": [0.1, 0.6, 0.9]}  # `price` is null
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
rows.add(gson.fromJson("{\"age\": 25, \"price\": 99.99, \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 30, \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": null, \"price\": null, \"pk\": 3, \"embedding\": [0.2, 0.3, 0.1]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 45, \"price\": null, \"pk\": 4, \"embedding\": [0.9, 0.1, 0.4]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": null, \"price\": 59.99, \"pk\": 5, \"embedding\": [0.8, 0.5, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 60, \"price\": null, \"pk\": 6, \"embedding\": [0.1, 0.6, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
priceValues := []float32{99.99, 149.50, 199.99, 0, 59.99, 0}
priceValid := []bool{true, true, true, false, true, false}
priceCol, _ := column.NewNullableColumnFloat("price", priceValues, priceValid)

ageValues := []int64{25, 30, 0, 45, 0, 60}
ageValid := []bool{true, true, false, true, false, true}
ageCol, _ := column.NewNullableColumnInt64("age", ageValues, ageValid)

brokenValues := []bool{false, true, false, true, false, false}
brokenValid := []bool{true, true, true, true, true, true}
brokenCol, _ := column.NewNullableColumnBool("broken", brokenValues, brokenValid)

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("pk", []int64{1, 2, 3, 4, 5, 6}).
    WithFloatVectorColumn("embedding", 3, [][]float32{
        {0.1, 0.2, 0.3},
        {0.4, 0.5, 0.6},
        {0.2, 0.3, 0.1},
        {0.9, 0.1, 0.4},
        {0.8, 0.5, 0.3},
        {0.1, 0.6, 0.9},
    }).
    WithColumns(priceCol, ageCol, brokenCol),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
let price_col = FieldData::float(
    "price",
    vec![99.99, 149.50, 199.99, 0.0, 59.99, 0.0],
).nullable(vec![true, true, true, false, true, false]);
let age_col = FieldData::int64(
    "age",
    vec![25, 30, 0, 45, 0, 60],
).nullable(vec![true, true, false, true, false, true]);
let broken_col = FieldData::bool(
    "broken",
    vec![false, true, false, true, false, false],
).nullable(vec![true, true, true, true, true, true]);

client
    .insert(
        InsertRequest::builder()
            .collection_name("my_collection")
            .columns(vec![
                FieldData::int64("pk", vec![1, 2, 3, 4, 5, 6]),
                FieldData::float_vector("embedding", vec![
                    vec![0.1, 0.2, 0.3],
                    vec![0.4, 0.5, 0.6],
                    vec![0.2, 0.3, 0.1],
                    vec![0.9, 0.1, 0.4],
                    vec![0.8, 0.5, 0.3],
                    vec![0.1, 0.6, 0.9],
                ]),
                price_col,
                age_col,
                broken_col,
            ])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows data = {
    {{"age", int64_t(25)}, {"price", float(99.99)}, {"pk", int64_t(1)}, {"embedding", std::vector<float>{0.1, 0.2, 0.3}}},
    {{"age", int64_t(30)}, {"price", float(149.50)}, {"pk", int64_t(2)}, {"embedding", std::vector<float>{0.4, 0.5, 0.6}}},
    {{"age", int64_t(35)}, {"price", float(199.99)}, {"pk", int64_t(3)}, {"embedding", std::vector<float>{0.2, 0.3, 0.1}}},
    {{"age", int64_t(45)}, {"pk", int64_t(4)}, {"embedding", std::vector<float>{0.9, 0.1, 0.4}}},
    {{"price", float(59.99)}, {"pk", int64_t(5)}, {"embedding", std::vector<float>{0.8, 0.5, 0.3}}},
    {{"age", int64_t(60)}, {"pk", int64_t(6)}, {"embedding", std::vector<float>{0.1, 0.6, 0.9}}}
};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("my_collection")
                                .WithRowsData(std::move(data)),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  { age: 25, price: 99.99, pk: 1, embedding: [0.1, 0.2, 0.3] },
  { age: 30, price: 149.5, pk: 2, embedding: [0.4, 0.5, 0.6] },
  { age: 35, price: 199.99, pk: 3, embedding: [0.2, 0.3, 0.1] },
  { age: 45, price: null, pk: 4, embedding: [0.9, 0.1, 0.4] },
  { age: null, price: 59.99, pk: 5, embedding: [0.8, 0.5, 0.3] },
  { age: 60, price: null, pk: 6, embedding: [0.1, 0.6, 0.9] },
];

await client.insert({
  collection_name: "my_collection",
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
--header "Request-Timeout: 10" \
-d '{
    "data": [
        {"age": 25, "broken": false, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
        {"age": 30, "broken": true, "price": 149.50, "pk": 2, "embedding": [0.4, 0.5, 0.6]},
        {"age": 35, "broken": false, "price": 199.99, "pk": 3, "embedding": [0.2, 0.3, 0.1]},
        {"age": 45, "broken": true, "price": null, "pk": 4, "embedding": [0.9, 0.1, 0.4]},
        {"age": null, "broken": false, "price": 59.99, "pk": 5, "embedding": [0.8, 0.5, 0.3]},
        {"age": 60, "broken": false, "price": null, "pk": 6, "embedding": [0.1, 0.6, 0.9]}
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## Query with filter expressions\{#query-with-filter-expressions}

After inserting entities, use the `query` method to retrieve entities that match the specified filter expressions.

To retrieve entities where the `age` is greater than 30:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'age > 30'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'age': 45, 'price': None, 'pk': 4}",
#     "{'age': 60, 'price': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "age > 30";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// Output
//
// [
//    QueryResp.QueryResult(entity={price=null, pk=4, age=45}), 
//    QueryResp.QueryResult(entity={price=null, pk=6, age=60})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > 30"
queryResult, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
```

</TabItem>

<TabItem value='rust'>

```rust
let results = client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("age > 30")
            .output_fields(vec!["age", "price", "pk"])
            .build()?,
    )
    .await?;
for row in results.rows()? {
    println!("{:?}", row);
}
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter("age > 30")
                       .AddOutputField("age")
                       .AddOutputField("price")
                       .AddOutputField("pk");

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& row : response.Results()) {
    std::cout << "\t" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_collection',
    filter: 'age > 30',
    output_fields: ['age', 'price', 'pk']
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "filter": "age > 30",
    "outputFields": ["age","price", "pk"]
}'

## {"code":0,"cost":0,"data":[{"age":30,"pk":2,"price":149.5},{"age":35,"pk":3,"price":199.99}]}
```

</TabItem>
</Tabs>

To retrieve entities where the `price` is null:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'price is null'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'age': 30, 'price': None, 'pk': 2}",
#     "{'age': 18, 'price': None, 'pk': 3}",
#     "{'age': 45, 'price': None, 'pk': 4}",
#     "{'age': 60, 'price': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "price is null";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// Output
// [
//    QueryResp.QueryResult(entity={price=null, pk=2, age=30}), 
//    QueryResp.QueryResult(entity={price=null, pk=3, age=18}), 
//    QueryResp.QueryResult(entity={price=null, pk=4, age=45}), 
//    QueryResp.QueryResult(entity={price=null, pk=6, age=60})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter := "price is null"
queryResult, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
```

</TabItem>

<TabItem value='rust'>

```rust
let results = client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("price is null")
            .output_fields(vec!["age", "price", "pk"])
            .build()?,
    )
    .await?;
for row in results.rows()? {
    println!("{:?}", row);
}
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter("price is null")
                       .AddOutputField("age")
                       .AddOutputField("price")
                       .AddOutputField("pk");

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& row : response.Results()) {
    std::cout << "\t" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'price is null';

const res = await client.query({
    collection_name: "my_collection",
    filter: filter,
    output_fields: ["age", "price", "pk"]
});

console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
  "collectionName": "my_collection",
  "filter": "price is null",
  "outputFields": ["age", "price", "pk"]
}'
```

</TabItem>
</Tabs>

To retrieve entities where `age` has the value `18`, use the following expression below. As the default value of `age` is `18`, the expected result should include entities with `age` explicitly set to `18` or with `age` set to null.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'age == 18'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'age': 18, 'price': None, 'pk': 3}",
#     "{'age': 18, 'price': 59.99, 'pk': 5}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "age == 18";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// Output
// [
//    QueryResp.QueryResult(entity={price=null, pk=3, age=18}), 
//    QueryResp.QueryResult(entity={price=59.99, pk=5, age=18})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter = "age == 18"
queryResult, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
```

</TabItem>

<TabItem value='rust'>

```rust
let results = client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("age == 18")
            .output_fields(vec!["age", "price", "pk"])
            .build()?,
    )
    .await?;
for row in results.rows()? {
    println!("{:?}", row);
}
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter("age == 18")
                       .AddOutputField("age")
                       .AddOutputField("price")
                       .AddOutputField("pk");

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& row : response.Results()) {
    std::cout << "\t" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
const filter = 'age == 18';

const res = await client.query({
    collection_name:"my_collection",
    filter:filter,
    output_fields=["age", "price", "pk"]
});

console.log(res);

// Example output:
// data: [
//     "{'age': 18, 'price': None, 'pk': 3}",
//     "{'age': 18, 'price': 59.99, 'pk': 5}"
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
  "collectionName": "my_collection",
  "filter": "age == 18",
  "outputFields": ["age", "price", "pk"]
}'
```

</TabItem>
</Tabs>

## Vector search with filter expressions\{#vector-search-with-filter-expressions}

In addition to basic number field filtering, you can combine vector similarity searches with number field filters. For example, the following code shows how to add a number field filter to a vector search:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "25 <= age <= 35"

res = client.search(
    collection_name="my_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["age","price"],
    filter=filter
)

print(res)

# Example output:
# data: [
#     "[{'id': 2, 'distance': -0.2016308456659317, 'entity': {'age': 30, 'price': None}}, {'id': 1, 'distance': -0.23643313348293304, 'entity': {'age': 25, 'price': 99.98999786376953}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "25 <= age <= 35";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("age", "price"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [
//   [
//     SearchResp.SearchResult(entity={price=null, age=30}, score=-0.20163085, id=2),
//     SearchResp.SearchResult(entity={price=99.99, age=25}, score=-0.23643313, id=1)
//   ]
// ]
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3, -0.6, 0.1}
filter = "25 <= age <= 35"

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 10)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithFilter(filter).
    WithAnnParam(annParam).
    WithOutputFields("age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("age: ", resultSet.GetColumn("age"))
    fmt.Println("price: ", resultSet.GetColumn("price"))
}
```

</TabItem>

<TabItem value='rust'>

```rust
let results = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("embedding")
            .vectors(SearchVectors::Float(vec![vec![0.3, -0.6, 0.1]]))
            .limit(5)
            .filter("25 <= age <= 35")
            .output_fields(vec!["age", "price"])
            .build()?,
    )
    .await?;
println!("{:?}", results.results());
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3, -0.6, 0.1};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("embedding")
                   .WithLimit(5)
                   .WithFilter("25 <= age <= 35")
                   .AddOutputField("age")
                   .AddOutputField("price")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
auto search_results = response.Results();
for (auto& result : search_results.Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
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
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
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

In this example, we first define a query vector and add a filter condition `25 <= age <= 35` during the search. This ensures that the search results are not only similar to the query vector but also meet the specified age range. For more information, refer to [Filtering Explained](./filtering-overview).