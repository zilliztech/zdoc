---
title: "デフォルト値 | BYOC"
slug: /default-fields
sidebar_label: "デフォルト値"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud allows you to set default values for スカラー fields (excluding the primary field). When a field has a default value configured, Zilliz Cloud automatically applies this value if no data is provided during insertion. | BYOC"
type: origin
token: SsGkwyGJDirNDwk170rcHbUjnVe
sidebar_position: 16
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# デフォルト値

Zilliz Cloud allows you to set default values for スカラー fields (excluding the primary field). When a field has a default value configured, Zilliz Cloud automatically applies this value if no data is provided during insertion.

デフォルト値を使用すると、既存のデフォルト値設定を保持したまま、他のデータベースシステムから Zilliz Cloud へのデータ移行を簡素化できます。また、挿入時点では値が未確定である可能性があるフィールドにもデフォルト値を利用できます。

## Limits\{#limits}

- Only スカラー fields support default values. The primary field and ベクトル fields cannot have default values.

- `JSON` フィールドと `ARRAY` フィールドはデフォルト値をサポートしていません。

- Default values can only be configured during コレクション creation and cannot be modified afterward.

## Set default values\{#set-default-values}

When creating a コレクション, use the `default_value` parameter in `add_field()` to define the default value for a field.

The following example creates a コレクション with two スカラー fields that have default values: `age` defaults to `18` and `status` defaults to `"active"`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri='YOUR_CLUSTER_ENDPOINT')

# Drop the collection if it already exists
if client.has_collection("my_collection"):
    client.drop_collection("my_collection")

# Define collection schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_field=True,
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)
# highlight-start
schema.add_field(field_name="age", datatype=DataType.INT64, default_value=18)
schema.add_field(field_name="status", datatype=DataType.VARCHAR, default_value="active", max_length=10)
# highlight-end

# Set index params
index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_type="AUTOINDEX", metric_type="L2")

# Create collection
client.create_collection(collection_name="my_collection", schema=schema, index_params=index_params)

# Load the collection
client.load_collection("my_collection")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;
import io.milvus.v2.service.collection.request.HasCollectionReq;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import java.util.ArrayList;
import java.util.List;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

String collectionName = "my_collection";

// Drop the collection if it already exists
if (client.hasCollection(HasCollectionReq.builder().collectionName(collectionName).build())) {
    client.dropCollection(DropCollectionReq.builder().collectionName(collectionName).build());
}

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(true)
        .build();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(false)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());
// highlight-start
schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        .defaultValue(18L)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("status")
        .dataType(DataType.VarChar)
        .defaultValue("active")
        .maxLength(10)
        .build());
// highlight-end

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName(collectionName)
        .collectionSchema(schema)
        .indexParams(indexParams)
        .build());

// Load the collection
client.loadCollection(LoadCollectionReq.builder()
        .collectionName(collectionName)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    log.Fatal(err)
}
defer client.Close(ctx)

collectionName := "my_collection"

// Drop the collection if it already exists
has, err := client.HasCollection(ctx, milvusclient.NewHasCollectionOption(collectionName))
if err != nil {
    log.Fatal(err)
}
if has {
    err = client.DropCollection(ctx, milvusclient.NewDropCollectionOption(collectionName))
    if err != nil {
        log.Fatal(err)
    }
}

schema := entity.NewSchema().WithDynamicFieldEnabled(true).
    WithField(entity.NewField().
        WithName("id").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true).
        WithIsAutoID(false)).
    WithField(entity.NewField().
        WithName("vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(5)).
    // highlight-start
    WithField(entity.NewField().
        WithName("age").
        WithDataType(entity.FieldTypeInt64).
        WithDefaultValueLong(18)).
    WithField(entity.NewField().
        WithName("status").
        WithDataType(entity.FieldTypeVarChar).
        WithDefaultValueString("active").
        WithMaxLength(10))
    // highlight-end

indexOption := milvusclient.NewCreateIndexOption(
    collectionName,
    "vector",
    index.NewAutoIndex(entity.L2),
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption(collectionName, schema).
    WithIndexOptions(indexOption))
if err != nil {
    log.Fatal(err)
}

loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption(collectionName))
if err != nil {
    log.Fatal(err)
}
if err := loadTask.Await(ctx); err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

const COLLECTION_NAME: &str = "my_collection";

// Drop the collection if it already exists
if client
    .has_collection(
        HasCollectionRequest::builder()
            .collection_name(COLLECTION_NAME)
            .build()?,
    )
    .await?
    .exists()
{
    client
        .drop_collection(
            DropCollectionRequest::builder()
                .collection_name(COLLECTION_NAME)
                .build()?,
        )
        .await?;
}

// Define the collection schema
let schema = CollectionSchema::new()
    .enable_dynamic_field(true)
    .add_field(
        FieldSchema::new()
            .name("id")
            .data_type(DataType::Int64)
            .primary_key(true)
            .auto_id(false),
    )
    .add_field(
        FieldSchema::new()
            .name("vector")
            .data_type(DataType::FloatVector)
            .dimension(5),
    )
    // highlight-start
    .add_field(
        FieldSchema::new()
            .name("age")
            .data_type(DataType::Int64)
            .default_value(DefaultValue::Int64(18)),
    )
    .add_field(
        FieldSchema::new()
            .name("status")
            .data_type(DataType::VarChar)
            .default_value(DefaultValue::String("active".into()))
            .max_length(10),
    );
    // highlight-end

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name(COLLECTION_NAME)
            .schema(schema)
            .index_params(vec![IndexParam::new()
                .field_name("vector")
                .index_type(IndexType::AutoIndex)
                .metric_type(MetricType::L2)])
            .build()?,
    )
    .await?;

client
    .load_collection(
        LoadCollectionRequest::builder()
            .collection_name(COLLECTION_NAME)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const std::string collection_name = "my_collection";

// Drop the collection if it already exists
milvus::HasCollectionResponse has_resp;
status = client->HasCollection(milvus::HasCollectionRequest().WithCollectionName(collection_name), has_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
if (has_resp.Has()) {
    status = client->DropCollection(milvus::DropCollectionRequest().WithCollectionName(collection_name));
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
// highlight-start
schema->AddField(milvus::FieldSchema("age", milvus::DataType::INT64).WithDefaultValue(18));
schema->AddField(milvus::FieldSchema("status", milvus::DataType::VARCHAR).WithDefaultValue("active").WithMaxLength(10));
// highlight-end

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName(collection_name)
                                        .WithCollectionSchema(schema)
                                        .AddIndex(milvus::IndexDesc("vector", "vector_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::L2)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->LoadCollection(milvus::LoadCollectionRequest().WithCollectionName(collection_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
});

const collectionName = 'my_collection';

// Drop the collection if it already exists
await client.dropCollection({ collection_name: collectionName }).catch(() => {});

await client.createCollection({
  collection_name: collectionName,
  enable_dynamic_field: true,
  fields: [
    {
      name: 'id',
      data_type: DataType.Int64,
      is_primary_key: true,
      autoID: false,
    },
    {
      name: 'vector',
      data_type: DataType.FloatVector,
      dim: 5,
    },
    // highlight-start
    {
      name: 'age',
      data_type: DataType.Int64,
      default_value: 18,
    },
    {
      name: 'status',
      data_type: DataType.VarChar,
      default_value: 'active',
      max_length: 10,
    },
    // highlight-end
  ],
});

// Create an index on the vector field
await client.createIndex({
  collection_name: collectionName,
  field_name: 'vector',
  index_type: 'AUTOINDEX',
  metric_type: 'L2',
  index_name: 'vector_index',
});

// Load the collection
await client.loadCollection({ collection_name: collectionName });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Drop the collection if it already exists
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{"collectionName": "my_collection"}'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "schema": {
      "enableDynamicField": true,
      "fields": [
        {
          "fieldName": "id",
          "dataType": "Int64",
          "isPrimary": true
        },
        {
          "fieldName": "vector",
          "dataType": "FloatVector",
          "elementTypeParams": {
            "dim": "5"
          }
        },
        {
          "fieldName": "age",
          "dataType": "Int64",
          "defaultValue": 18
        },
        {
          "fieldName": "status",
          "dataType": "VarChar",
          "defaultValue": "active",
          "elementTypeParams": {
            "max_length": "10"
          }
        }
      ]
    },
    "indexParams": [
      {
        "fieldName": "vector",
        "indexName": "vector_index",
        "indexType": "AUTOINDEX",
        "metricType": "L2"
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

## Insert entities\{#insert-entities}

データを挿入する際、デフォルト値を持つフィールドを省略した場合、または明示的に NULL に設定した場合、Zilliz Cloud は設定済みのデフォルト値を自動的に使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    # All fields provided explicitly
    {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30, "status": "premium"},
    # age and status omitted → both use default values (18 and "active")
    {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6]},
    # status set to None → uses default value "active"
    {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7], "age": 25, "status": None},
    # age set to None → uses default value 18
    {"id": 4, "vector": [0.4, 0.5, 0.6, 0.7, 0.8], "age": None, "status": "inactive"}
]

client.insert(collection_name="my_collection", data=data)

# Flush so the inserted rows are immediately queryable
client.flush(collection_name="my_collection")
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import io.milvus.v2.service.utility.request.FlushReq;
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

String collectionName = "my_collection";

Gson gson = new Gson();
List<JsonObject> data = new ArrayList<>();

// All fields provided explicitly
JsonObject row1 = new JsonObject();
row1.addProperty("id", 1L);
row1.add("vector", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}));
row1.addProperty("age", 30L);
row1.addProperty("status", "premium");
data.add(row1);

// age and status omitted: both use default values (18 and "active")
JsonObject row2 = new JsonObject();
row2.addProperty("id", 2L);
row2.add("vector", gson.toJsonTree(new float[]{0.2f, 0.3f, 0.4f, 0.5f, 0.6f}));
data.add(row2);

// status set to null: uses default value "active"
JsonObject row3 = new JsonObject();
row3.addProperty("id", 3L);
row3.add("vector", gson.toJsonTree(new float[]{0.3f, 0.4f, 0.5f, 0.6f, 0.7f}));
row3.addProperty("age", 25L);
row3.add("status", JsonNull.INSTANCE);
data.add(row3);

// age set to null: uses default value 18
JsonObject row4 = new JsonObject();
row4.addProperty("id", 4L);
row4.add("vector", gson.toJsonTree(new float[]{0.4f, 0.5f, 0.6f, 0.7f, 0.8f}));
row4.add("age", JsonNull.INSTANCE);
row4.addProperty("status", "inactive");
data.add(row4);

client.insert(InsertReq.builder()
        .collectionName(collectionName)
        .data(data)
        .build());

// Flush so the inserted rows are immediately queryable
client.flush(FlushReq.builder()
        .collectionNames(Collections.singletonList(collectionName))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "log"

    "github.com/milvus-io/milvus/client/v3/column"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

collectionName := "my_collection"

ageColumn, err := column.NewNullableColumnInt64(
    "age",
    []int64{30, 0, 25, 0},
    []bool{true, false, true, false},
    column.WithSparseNullableMode[int64](true),
)
if err != nil {
    log.Fatal(err)
}

statusColumn, err := column.NewNullableColumnVarChar(
    "status",
    []string{"premium", "", "", "inactive"},
    []bool{true, false, false, true},
    column.WithSparseNullableMode[string](true),
)
if err != nil {
    log.Fatal(err)
}

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption(collectionName,
    column.NewColumnInt64("id", []int64{1, 2, 3, 4}),
    column.NewColumnFloatVector("vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
        {0.2, 0.3, 0.4, 0.5, 0.6},
        {0.3, 0.4, 0.5, 0.6, 0.7},
        {0.4, 0.5, 0.6, 0.7, 0.8},
    }),
    // age: row 2 and row 4 use the default value 18
    ageColumn,
    // status: row 2 and row 3 use the default value "active"
    statusColumn,
))
if err != nil {
    log.Fatal(err)
}

// Flush so the inserted rows are immediately queryable
flushTask, err := client.Flush(ctx, milvusclient.NewFlushOption(collectionName))
if err != nil {
    log.Fatal(err)
}
if err := flushTask.Await(ctx); err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

const COLLECTION_NAME: &str = "my_collection";

let rows = vec![
    json!({"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30, "status": "premium"}),
    json!({"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6]}),
    json!({"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7], "age": 25, "status": null}),
    json!({"id": 4, "vector": [0.4, 0.5, 0.6, 0.7, 0.8], "age": null, "status": "inactive"}),
];

client
    .insert(
        InsertRequest::builder()
            .collection_name(COLLECTION_NAME)
            .rows(rows)
            .build()?,
    )
    .await?;

client
    .flush(
        FlushRequest::builder()
            .collection_names([COLLECTION_NAME])
            .wait_flushed_ms(60_000)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>
#include <vector>

const std::string collection_name = "my_collection";

milvus::EntityRows rows;
rows.push_back({{"id", 1}, {"vector", std::vector<float>{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}}, {"age", 30}, {"status", "premium"}});
rows.push_back({{"id", 2}, {"vector", std::vector<float>{0.2f, 0.3f, 0.4f, 0.5f, 0.6f}}});
rows.push_back({{"id", 3}, {"vector", std::vector<float>{0.3f, 0.4f, 0.5f, 0.6f, 0.7f}}, {"age", 25}, {"status", nullptr}});
rows.push_back({{"id", 4}, {"vector", std::vector<float>{0.4f, 0.5f, 0.6f, 0.7f, 0.8f}}, {"age", nullptr}, {"status", "inactive"}});

milvus::InsertResponse resp_insert;
auto status = client->Insert(milvus::InsertRequest()
                                 .WithCollectionName(collection_name)
                                 .WithRowsData(std::move(rows)),
                             resp_insert);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->Flush(milvus::FlushRequest()
                           .WithCollectionNames({collection_name})
                           .WithWaitFlushedMs(60000));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

const collectionName = 'my_collection';

const data = [
  // All fields provided explicitly
  { id: 1, vector: [0.1, 0.2, 0.3, 0.4, 0.5], age: 30, status: 'premium' },
  // age and status omitted: both use default values (18 and "active")
  { id: 2, vector: [0.2, 0.3, 0.4, 0.5, 0.6] },
  // status set to null: uses default value "active"
  { id: 3, vector: [0.3, 0.4, 0.5, 0.6, 0.7], age: 25, status: null },
  // age set to null: uses default value 18
  { id: 4, vector: [0.4, 0.5, 0.6, 0.7, 0.8], age: null, status: 'inactive' },
];

await client.insert({
  collection_name: collectionName,
  fields_data: data,
});

// Flush so the inserted rows are immediately queryable
await client.flush({ collection_names: [collectionName] });
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
        "vector": [0.1, 0.2, 0.3, 0.4, 0.5],
        "age": 30,
        "status": "premium"
      },
      {
        "id": 2,
        "vector": [0.2, 0.3, 0.4, 0.5, 0.6]
      },
      {
        "id": 3,
        "vector": [0.3, 0.4, 0.5, 0.6, 0.7],
        "age": 25,
        "status": null
      },
      {
        "id": 4,
        "vector": [0.4, 0.5, 0.6, 0.7, 0.8],
        "age": null,
        "status": "inactive"
      }
    ]
  }'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/flush" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection"
  }'
```

</TabItem>
</Tabs>

## Search and query with default values\{#search-and-query-with-default-values}

Entities containing default values behave the same as any other entities during ベクトル searches and スカラー filtering. You can filter by default values in both `search` and `query` operations.

次の例では、`age` がデフォルト値 `18` と等しい entities を検索します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.4, 0.3, 0.5]],
    search_params={"params": {"nprobe": 16}},
    filter="age == 18",
    limit=10,
    output_fields=["id", "age", "status"]
)

print("Search results (age == 18):")
for hit in res[0]:
    print(f"  id: {hit['id']}, age: {hit['entity']['age']}, status: {hit['entity']['status']}")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

String collectionName = "my_collection";

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName(collectionName)
        .data(Collections.singletonList(new FloatVec(Arrays.asList(0.1f, 0.2f, 0.4f, 0.3f, 0.5f))))
        .annsField("vector")
        .searchParams(Collections.singletonMap("nprobe", 16))
        .filter("age == 18")
        .limit(10)
        .outputFields(Arrays.asList("id", "age", "status"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());

System.out.println("Search results (age == 18):");
for (SearchResp.SearchResult hit : searchResp.getSearchResults().get(0)) {
    System.out.printf("  id: %s, age: %s, status: %s%n",
            hit.getId(),
            hit.getEntity().get("age"),
            hit.getEntity().get("status"));
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

collectionName := "my_collection"

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 16)

searchResults, err := client.Search(ctx, milvusclient.NewSearchOption(
    collectionName,
    10,
    []entity.Vector{entity.FloatVector([]float32{0.1, 0.2, 0.4, 0.3, 0.5})},
).
    WithANNSField("vector").
    WithAnnParam(annParam).
    WithFilter("age == 18").
    WithOutputFields("id", "age", "status").
    WithConsistencyLevel(entity.ClStrong))
if err != nil {
    log.Fatal(err)
}

fmt.Println("Search results (age == 18):")
for _, resultSet := range searchResults {
    fmt.Println(resultSet.Fields)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

const COLLECTION_NAME: &str = "my_collection";

let response = client
    .search(
        SearchRequest::builder()
            .collection_name(COLLECTION_NAME)
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![vec![0.1, 0.2, 0.4, 0.3, 0.5]]))
            .filter("age == 18")
            .output_fields(["id", "age", "status"])
            .extra_params(HashMap::from([("nprobe".into(), "16".into())]))
            .limit(10)
            .build()?,
    )
    .await?;

println!("Search results (age == 18):");
for result in response.results() {
    for row in result.rows()? {
        let e = row.to_entity_row()?;
        println!("  id: {}, age: {}, status: {}", e["id"], e["age"], e["status"]);
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>
#include <vector>

const std::string collection_name = "my_collection";

std::string filter = "age == 18";
std::vector<float> query_vector = {0.1f, 0.2f, 0.4f, 0.3f, 0.5f};
auto request = milvus::SearchRequest()
                   .WithCollectionName(collection_name)
                   .WithFilter(filter)
                   .WithLimit(10)
                   .AddOutputField("id")
                   .AddOutputField("age")
                   .AddOutputField("status")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::cout << "Search results (age == 18):" << std::endl;
for (auto& result : response.Results().Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "  id: " << row["id"] << ", age: " << row["age"] << ", status: " << row["status"] << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

const collectionName = 'my_collection';

const searchResults = await client.search({
  collection_name: collectionName,
  data: [[0.1, 0.2, 0.4, 0.3, 0.5]],
  anns_field: 'vector',
  params: { nprobe: 16 },
  filter: 'age == 18',
  limit: 10,
  output_fields: ['id', 'age', 'status'],
  consistency_level: 'Strong',
});

console.log('Search results (age == 18):');
for (const hit of searchResults.results) {
  console.log(`  id: ${hit.id}, age: ${hit.age}, status: ${hit.status}`);
}
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
    "data": [[0.1, 0.2, 0.4, 0.3, 0.5]],
    "annsField": "vector",
    "searchParams": {
      "params": {
        "nprobe": 16
      }
    },
    "filter": "age == 18",
    "limit": 10,
    "outputFields": ["id", "age", "status"],
    "consistencyLevel": "Strong"
  }'
```

</TabItem>
</Tabs>

<details>

<summary>期待される出力</summary>

```plaintext
Output:
Search results (age == 18):
  id: 2, age: 18, status: active
  id: 4, age: 18, status: inactive
```

</details>

デフォルト値に直接一致する entities を query することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query entities where age equals the default value (18)
default_age_results = client.query(
    collection_name="my_collection",
    filter="age == 18",
    output_fields=["id", "age", "status"]
)

print("\nQuery results (age == 18):")
for r in default_age_results:
    print(f"  id: {r['id']}, age: {r['age']}, status: {r['status']}")

# Query entities where status equals the default value ("active")
default_status_results = client.query(
    collection_name="my_collection",
    filter='status == "active"',
    output_fields=["id", "age", "status"]
)

print("\nQuery results (status == 'active'):")
for r in default_status_results:
    print(f"  id: {r['id']}, age: {r['age']}, status: {r['status']}")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

String collectionName = "my_collection";

// Query entities where age equals the default value (18)
QueryResp defaultAgeResults = client.query(QueryReq.builder()
        .collectionName(collectionName)
        .filter("age == 18")
        .outputFields(Arrays.asList("id", "age", "status"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());

System.out.println("\nQuery results (age == 18):");
for (QueryResp.QueryResult row : defaultAgeResults.getQueryResults()) {
    System.out.printf("  id: %s, age: %s, status: %s%n",
            row.getEntity().get("id"),
            row.getEntity().get("age"),
            row.getEntity().get("status"));
}

// Query entities where status equals the default value ("active")
QueryResp defaultStatusResults = client.query(QueryReq.builder()
        .collectionName(collectionName)
        .filter("status == \"active\"")
        .outputFields(Arrays.asList("id", "age", "status"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());

System.out.println("\nQuery results (status == 'active'):");
for (QueryResp.QueryResult row : defaultStatusResults.getQueryResults()) {
    System.out.printf("  id: %s, age: %s, status: %s%n",
            row.getEntity().get("id"),
            row.getEntity().get("age"),
            row.getEntity().get("status"));
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

collectionName := "my_collection"

// Query entities where age equals the default value (18)
defaultAgeResults, err := client.Query(ctx, milvusclient.NewQueryOption(collectionName).
    WithFilter("age == 18").
    WithOutputFields("id", "age", "status").
    WithConsistencyLevel(entity.ClStrong))
if err != nil {
    log.Fatal(err)
}

fmt.Println("\nQuery results (age == 18):")
fmt.Println(defaultAgeResults.Fields)

// Query entities where status equals the default value ("active")
defaultStatusResults, err := client.Query(ctx, milvusclient.NewQueryOption(collectionName).
    WithFilter(`status == "active"`).
    WithOutputFields("id", "age", "status").
    WithConsistencyLevel(entity.ClStrong))
if err != nil {
    log.Fatal(err)
}

fmt.Println("\nQuery results (status == 'active'):")
fmt.Println(defaultStatusResults.Fields)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

const COLLECTION_NAME: &str = "my_collection";

let response = client
    .query(
        QueryRequest::builder()
            .collection_name(COLLECTION_NAME)
            .filter("age == 18")
            .output_fields(["id", "age", "status"])
            .build()?,
    )
    .await?;

println!("\nQuery results (age == 18):");
for row in response.results().rows()? {
    let e = row.to_entity_row()?;
    println!("  id: {}, age: {}, status: {}", e["id"], e["age"], e["status"]);
}

let response = client
    .query(
        QueryRequest::builder()
            .collection_name(COLLECTION_NAME)
            .filter("status == \"active\"")
            .output_fields(["id", "age", "status"])
            .build()?,
    )
    .await?;

println!("\nQuery results (status == 'active'):");
for row in response.results().rows()? {
    let e = row.to_entity_row()?;
    println!("  id: {}, age: {}, status: {}", e["id"], e["age"], e["status"]);
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>

const std::string collection_name = "my_collection";

// Query entities where age equals the default value (18)
std::string filter = "age == 18";
auto request = milvus::QueryRequest()
                       .WithCollectionName(collection_name)
                       .WithFilter(filter)
                       .AddOutputField("id")
                       .AddOutputField("age")
                       .AddOutputField("status");

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::cout << "\nQuery results (age == 18):" << std::endl;
milvus::EntityRows output_rows;
status = response.Results().OutputRows(output_rows);
for (const auto& row : output_rows) {
    std::cout << "  id: " << row["id"] << ", age: " << row["age"] << ", status: " << row["status"] << std::endl;
}

// Query entities where status equals the default value ("active")
std::string filter2 = "status == \"active\"";
auto request2 = milvus::QueryRequest()
                       .WithCollectionName(collection_name)
                       .WithFilter(filter2)
                       .AddOutputField("id")
                       .AddOutputField("age")
                       .AddOutputField("status");

milvus::QueryResponse response2;
status = client->Query(request2, response2);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::cout << "\nQuery results (status == 'active'):" << std::endl;
milvus::EntityRows output_rows2;
status = response2.Results().OutputRows(output_rows2);
for (const auto& row : output_rows2) {
    std::cout << "  id: " << row["id"] << ", age: " << row["age"] << ", status: " << row["status"] << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

const collectionName = 'my_collection';

// Query entities where age equals the default value (18)
const defaultAgeResults = await client.query({
  collection_name: collectionName,
  filter: 'age == 18',
  output_fields: ['id', 'age', 'status'],
  consistency_level: 'Strong',
});

console.log('\nQuery results (age == 18):');
for (const row of defaultAgeResults.data) {
  console.log(`  id: ${row.id}, age: ${row.age}, status: ${row.status}`);
}

// Query entities where status equals the default value ("active")
const defaultStatusResults = await client.query({
  collection_name: collectionName,
  filter: 'status == "active"',
  output_fields: ['id', 'age', 'status'],
  consistency_level: 'Strong',
});

console.log("\nQuery results (status == 'active'):");
for (const row of defaultStatusResults.data) {
  console.log(`  id: ${row.id}, age: ${row.age}, status: ${row.status}`);
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "filter": "age == 18",
    "outputFields": ["id", "age", "status"],
    "consistencyLevel": "Strong"
  }'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "filter": "status == \"active\"",
    "outputFields": ["id", "age", "status"],
    "consistencyLevel": "Strong"
  }'
```

</TabItem>
</Tabs>

<details>

<summary>期待される出力</summary>

```plaintext
Query results (age == 18):
  id: 2, age: 18, status: active
  id: 4, age: 18, status: inactive

Query results (status == 'active'):
  id: 2, age: 18, status: active
  id: 3, age: 25, status: active
```

</details>

## Applicable rules\{#applicable-rules}

フィールドに `nullable` と `default_value` の両方が設定されている場合、挿入時に NULL 入力またはフィールド値の欠落を Zilliz Cloud がどのように処理するかは、次のルールによって決まります。

| Nullable | Default Value | User Input | Result |
| --- | --- | --- | --- |
| ✅ | ✅ (non-NULL) | NULL or omitted | デフォルト値を使用 |
| ✅ | ❌ | NULL or omitted | NULL として保存 |
| ❌ | ✅ (non-NULL) | NULL or omitted | デフォルト値を使用 |
| ❌ | ❌ | NULL or omitted | エラーをスロー |
| ❌ | ✅ (NULL) | NULL or omitted | エラーをスロー |

**重要なポイント:**

- フィールドに non-NULL のデフォルト値がある場合、`nullable` が有効かどうかにかかわらず、その値が使用されます。

- `nullable=True` でデフォルト値が設定されていない場合、そのフィールドには NULL が保存されます。

- `nullable=False` でデフォルト値が設定されていない場合、挿入はエラーで失敗します。

- NULL のデフォルト値を non-nullable フィールドに設定することは無効であり、エラーの原因になります。

