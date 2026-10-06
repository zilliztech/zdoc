---
title: "TIMESTAMPTZ Field | BYOC"
slug: /use-timestamptz-field
sidebar_label: "TIMSTAMPTZ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Applications that track time across regions, such as e-commerce systems, collaboration tools, or distributed logging, need precise handling of timestamps with time zones. The `TIMESTAMPTZ` data type in Zilliz Cloud provides this capability by storing timestamps with their associated time zone. | BYOC"
type: origin
token: RxUiwJ77WiFKZGkC8rEcLeopnTf
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TIMESTAMPTZ Field

Applications that track time across regions, such as e-commerce systems, collaboration tools, or distributed logging, need precise handling of timestamps with time zones. The `TIMESTAMPTZ` data type in Zilliz Cloud provides this capability by storing timestamps with their associated time zone.

## What is a TIMESTAMPTZ field?\{#what-is-a-timestamptz-field}

A `TIMESTAMPTZ` field is a schema-defined data type (`DataType.TIMESTAMPTZ`) in Zilliz Cloud that processes time zone-aware input and stores all time points internally as UTC absolute time:

- **Accepted input format**: `TIMESTAMPTZ` fields accept [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)–compatible timestamp strings, including:

    - `"2024-12-31 22:00:00"`

    - `"2024-12-31T22:00:00"`

    - `"2024-12-31T22:00:00+08:00"`

    - `"2024-12-31T22:00:00Z"`

- **Timestamp parsing rules**: How a timestamp is interpreted depends on whether the input string explicitly specifies a time zone:

    - If the input includes a time-zone offset (for example, **+08:00** or **Z**), it is treated as an absolute point in time.

    - If the input does not include a time-zone offset, it is interpreted using the collection’s configured timezone. For example, if the collection timezone is **Asia/Shanghai**:

        - `"2024-12-31 22:00:00"` is interpreted as **2024-12-31T22:00:00+08:00**

        - `"2024-12-31T22:00:00"` is interpreted as **2024-12-31T22:00:00Z**, which corresponds to **2025-01-01T06:00:00+08:00**

- **Internal storage**: All `TIMESTAMPTZ` values are normalized and stored in [Coordinated Universal Time](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) (UTC).

- **Comparison and filtering**: All comparison, filtering, and ordering operations on TIMESTAMPTZ fields are performed on the UTC-normalized value, ensuring consistent behavior across different time zones.

<Admonition type="info" title="Notes">

- You can set `nullable=True` for `TIMESTAMPTZ` fields to allow missing values.

- You can specify a default timestamp value using the `default_value` attribute in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.

See [Nullable & Default](./nullable-fields) for details.

</Admonition>

## Basic operations\{#basic-operations}

The basic workflow of using a `TIMESTAMPTZ` field mirrors other scalar fields in Zilliz Cloud: define the field → insert data → query/filter.

### Step 1: Define a TIMESTAMPTZ field\{#step-1-define-a-timestamptz-field}

To use a `TIMESTAMPTZ` field, explicitly define it in your collection schema when creating the collection. The following example demonstrates how to create a collection with a `tsz` field of type `DataType.TIMESTAMPTZ`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import time
from pymilvus import MilvusClient, DataType
import datetime
import pytz

server_address = "YOUR_CLUSTER_ENDPOINT"
collection_name = "timestamptz_test123"

client = MilvusClient(uri=server_address)

if client.has_collection(collection_name):
    client.drop_collection(collection_name)

schema = client.create_schema()
# Add a primary key field
schema.add_field("id", DataType.INT64, is_primary=True)
# Add a TIMESTAMPTZ field that allows null values
# highlight-next-line
schema.add_field("tsz", DataType.TIMESTAMPTZ, nullable=True)
# Add a vector field
schema.add_field("vec", DataType.FLOAT_VECTOR, dim=4)

client.create_collection(collection_name, schema=schema, consistency_level="Session")
print(f"Collection '{collection_name}' with a TimestampTz field created successfully.")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.common.DataType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;
import io.milvus.v2.service.collection.request.HasCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";
String collectionName = "timestamptz_test123";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop the collection if it already exists
if (client.hasCollection(HasCollectionReq.builder().collectionName(collectionName).build())) {
    client.dropCollection(DropCollectionReq.builder().collectionName(collectionName).build());
}

// 3. Define the collection schema
CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("tsz")
        .dataType(DataType.Timestamptz)
        .isNullable(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("vec")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());

// 4. Create the collection
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName(collectionName)
        .collectionSchema(schema)
        .consistencyLevel(ConsistencyLevel.SESSION)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}
defer cli.Close(ctx)

const collectionName = "timestamptz_test123"

// Drop the collection if it already exists
has, err := cli.HasCollection(ctx, milvusclient.NewHasCollectionOption(collectionName))
if err != nil {
    log.Fatal(err)
}
if has {
    err = cli.DropCollection(ctx, milvusclient.NewDropCollectionOption(collectionName))
    if err != nil {
        log.Fatal(err)
    }
}

schema := entity.NewSchema().
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
    WithField(entity.NewField().WithName("tsz").WithDataType(entity.FieldTypeTimestamptz).WithNullable(true)).
    WithField(entity.NewField().WithName("vec").WithDataType(entity.FieldTypeFloatVector).WithDim(4))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption(collectionName, schema).WithConsistencyLevel(entity.ClSession))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

const COLLECTION_NAME: &str = "timestamptz_test123";

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

// Define the collection schema with a TIMESTAMPTZ field
let schema = CollectionSchema::new()
    .add_field(
        FieldSchema::new()
            .name("id")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    .add_field(
        FieldSchema::new()
            .name("tsz")
            .data_type(DataType::Timestamptz)
            .nullable(true),
    )
    .add_field(
        FieldSchema::new()
            .name("vec")
            .data_type(DataType::FloatVector)
            .dimension(4),
    );

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name(COLLECTION_NAME)
            .schema(schema)
            .consistency_level(ConsistencyLevel::Session)
            .build()?,
    )
    .await?;
println!("Collection '{COLLECTION_NAME}' with a TimestampTz field created successfully.");
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>
#include <vector>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const std::string collection_name = "timestamptz_test123";

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
schema->AddField({"id", milvus::DataType::INT64, "", true});
schema->AddField(milvus::FieldSchema("tsz", milvus::DataType::TIMESTAMPTZ).WithNullable(true));
schema->AddField(milvus::FieldSchema("vec", milvus::DataType::FLOAT_VECTOR).WithDimension(4));

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName(collection_name)
                                        .WithCollectionSchema(schema)
                                        .WithConsistencyLevel(milvus::ConsistencyLevel::SESSION));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const serverAddress = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const collectionName = "timestamptz_test123";

const client = new MilvusClient({ address: serverAddress, token });

// Drop the collection if it already exists
await client.dropCollection({ collection_name: collectionName }).catch(() => {});

// Create a collection with a TIMESTAMPTZ field
await client.createCollection({
    collection_name: collectionName,
    fields: [
      {
        name: "id",
        data_type: DataType.Int64,
        is_primary_key: true,
      },
      {
        name: "tsz",
        data_type: DataType.Timestamptz,
        nullable: true,
      },
      {
        name: "vec",
        data_type: DataType.FloatVector,
        dim: 4,
      },
    ]
  });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create \
     --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
     --header 'Content-Type: application/json' \
     --header "Request-Timeout: 10" \
     --data '{
       "collectionName": "timestamptz_test123",
       "schema": {
         "autoId": false,
         "fields": [
           { "fieldName": "id", "dataType": "Int64", "isPrimary": true },
           { "fieldName": "tsz", "dataType": "Timestamptz", "nullable": true },
           { "fieldName": "vec", "dataType": "FloatVector", "elementTypeParams": { "dim": "4" } }
         ]
       },
       "indexParams": [
         {
           "fieldName": "vec",
           "indexName": "vector_index",
           "metricType": "L2",
           "indexType": "AUTOINDEX"
         }
       ],
       "consistencyLevel": "Session"
     }'
```

</TabItem>
</Tabs>

### Step 2: Insert data\{#step-2-insert-data}

Insert entities containing ISO 8601 strings with time zone offsets.

The example below inserts 8,193 rows of sample data into the collection. Each row includes:

- a unique ID

- a timezone-aware timestamp (Shanghai time)

- a simple 4-dimensional vector

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data_size = 10

# Get the Asia/Shanghai time zone using the pytz library
# You can use any valid IANA time zone identifier such as:
#   "Asia/Tokyo", "America/New_York", "Europe/London", "UTC", etc.
# To view all available values:
#   import pytz; print(pytz.all_timezones)
# Reference:
#   IANA database – https://www.iana.org/time-zones
#   Wikipedia – https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
shanghai_tz = pytz.timezone("Asia/Shanghai")

data = [
    {
        "id": i + 1,
        "tsz": shanghai_tz.localize(
            datetime.datetime(2025, 1, 1, 0, 0, 0) + datetime.timedelta(days=i)
        ).isoformat(),
        "vec": [float(i) / 10 for _ in range(4)],
    }
    for i in range(data_size)
]

client.insert(collection_name, data)
print("Data inserted successfully.")
```

</TabItem>

<TabItem value='java'>

```java
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;

String collectionName = "timestamptz_test123";

int rowCount = 10;
ZoneId zone = ZoneId.of("Asia/Shanghai");
DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
for (long i = 0L; i < rowCount; ++i) {
    JsonObject row = new JsonObject();
    row.addProperty("id", i + 1);

    float v = (float) i / 10;
    row.add("vec", gson.toJsonTree(Arrays.asList(v, v, v, v)));

    LocalDateTime tt = LocalDateTime.of(2025, 1, 1, 0, 0, 0).plusDays(i);
    ZonedDateTime zt = tt.atZone(zone);
    row.addProperty("tsz", zt.format(formatter));
    rows.add(row);
}

client.insert(InsertReq.builder()
        .collectionName(collectionName)
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/column"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

const collectionName = "timestamptz_test123"

const dataSize = 10

ids := make([]int64, dataSize)
tszs := make([]string, dataSize)
vecs := make([][]float32, dataSize)
for i := 0; i < dataSize; i++ {
    ids[i] = int64(i + 1)
    tszs[i] = fmt.Sprintf("2025-01-%02dT00:00:00+08:00", i+1)
    v := float32(i) / 10
    vecs[i] = []float32{v, v, v, v}
}

_, err = cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption(collectionName,
    column.NewColumnInt64("id", ids),
    column.NewColumnTimestamptzIsoString("tsz", tszs),
    column.NewColumnFloatVector("vec", 4, vecs),
))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

const COLLECTION_NAME: &str = "timestamptz_test123";

// Build 10 rows with a timezone-aware timestamp (Asia/Shanghai) and a 4-dim vector
let rows: Vec<_> = (0..10)
    .map(|i| {
        json!({
            "id": i + 1,
            "tsz": format!("2025-01-{:02}T00:00:00+08:00", i + 1),
            "vec": vec![i as f64 / 10.0; 4],
        })
    })
    .collect();

client
    .insert(
        InsertRequest::builder()
            .collection_name(COLLECTION_NAME)
            .rows(rows)
            .build()?,
    )
    .await?;
println!("Data inserted successfully.");
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

const std::string collection_name = "timestamptz_test123";

auto pad = [](int num, int width) {
    std::ostringstream oss;
    oss << std::setw(width) << std::setfill('0') << num;
    return oss.str();
};

auto formatDateWithTimezone = [&](int year, int month, int day, int hour, int minute, int second,
                                  std::string timezoneOffset = "+08:00") {
    std::string ts = std::to_string(year) + "-" + pad(month, 2) + "-" + pad(day, 2) + "T" + pad(hour, 2) + ":" +
                     pad(minute, 2) + ":" + pad(second, 2) + timezoneOffset;
    return ts;
};

milvus::EntityRows rows;
for (auto i = 0; i < 10; i++) {
    milvus::EntityRow row;
    row["id"] = i + 1;
    float v = static_cast<float>(i) / 10.0f;
    row["vec"] = std::vector<float>{v, v, v, v};
    row["tsz"] = formatDateWithTimezone(2025, 01, i + 1, 0, 0, 0);
    rows.emplace_back(std::move(row));
}

milvus::InsertResponse resp_insert;
auto status = client->Insert(milvus::InsertRequest()
                                 .WithCollectionName(collection_name)
                                 .WithRowsData(std::move(rows)),
                             resp_insert);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const collectionName = "timestamptz_test123";
const dataSize = 10;

const formatDateWithTimezone = (year, month, day, hour, minute, second, timezoneOffset = '+08:00') => {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const hourStr = String(hour).padStart(2, '0');
  const minuteStr = String(minute).padStart(2, '0');
  const secondStr = String(second).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:${secondStr}${timezoneOffset}`;
};

const data = [];
for (let i = 0; i < dataSize; i++) {
  const year = 2025;
  const month = 1;
  const day = 1 + i;
  const isoString = formatDateWithTimezone(year, month, day, 0, 0, 0, '+08:00');

  const v = i / 10;
  data.push({
    id: i + 1,
    tsz: isoString,
    vec: [v, v, v, v],
  });
}

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

await client.insert({
  collection_name: collectionName,
  data: data,
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert \
     --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
     --header 'Content-Type: application/json' \
     --header "Request-Timeout: 10" \
     --data '{
       "collectionName": "timestamptz_test123",
       "data": [
         { "id": 1, "tsz": "2025-01-01T00:00:00+08:00", "vec": [0.0, 0.0, 0.0, 0.0] },
         { "id": 2, "tsz": "2025-01-02T00:00:00+08:00", "vec": [0.1, 0.1, 0.1, 0.1] },
         { "id": 3, "tsz": "2025-01-03T00:00:00+08:00", "vec": [0.2, 0.2, 0.2, 0.2] },
         { "id": 4, "tsz": "2025-01-04T00:00:00+08:00", "vec": [0.3, 0.3, 0.3, 0.3] },
         { "id": 5, "tsz": "2025-01-05T00:00:00+08:00", "vec": [0.4, 0.4, 0.4, 0.4] },
         { "id": 6, "tsz": "2025-01-06T00:00:00+08:00", "vec": [0.5, 0.5, 0.5, 0.5] },
         { "id": 7, "tsz": "2025-01-07T00:00:00+08:00", "vec": [0.6, 0.6, 0.6, 0.6] },
         { "id": 8, "tsz": "2025-01-08T00:00:00+08:00", "vec": [0.7, 0.7, 0.7, 0.7] },
         { "id": 9, "tsz": "2025-01-09T00:00:00+08:00", "vec": [0.8, 0.8, 0.8, 0.8] },
         { "id": 10, "tsz": "2025-01-10T00:00:00+08:00", "vec": [0.9, 0.9, 0.9, 0.9] }
       ]
     }'
```

</TabItem>
</Tabs>

### Step 3: Filtering operations\{#step-3-filtering-operations}

`TIMESTAMPTZ` supports scalar comparisons, interval arithmetic, and extraction of time components.

Before you can perform filtering operations on `TIMESTAMPTZ` fields, make sure:

- You have created an index on each vector field.

- The collection is loaded into memory.

<details>

<summary>Show example code</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create index on vector field
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vec",
    index_type="AUTOINDEX",
    index_name="vec_index",
    metric_type="COSINE"
)
client.create_index(collection_name, index_params)
print("Index created successfully.")

# Load the collection
client.load_collection(collection_name)
print(f"Collection '{collection_name}' loaded successfully.")
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.index.request.CreateIndexReq;

String collectionName = "timestamptz_test123";

// 1. Create an index on the vector field
List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("vec")
        .indexName("vec_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());

client.createIndex(CreateIndexReq.builder()
        .collectionName(collectionName)
        .indexParams(indexes)
        .build());

// 2. Load the collection
client.loadCollection(LoadCollectionReq.builder()
        .collectionName(collectionName)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

const collectionName = "timestamptz_test123"

// 1. Create an index on the vector field
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(collectionName, "vec", index.NewAutoIndex(entity.COSINE)).WithIndexName("vec_index"))
if err != nil {
    log.Fatal(err)
}

// 2. Load the collection
_, err = cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption(collectionName))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

const COLLECTION_NAME: &str = "timestamptz_test123";

// 1. Create an index on the vector field
client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name(COLLECTION_NAME)
            .index_params(vec![
                IndexParam::new()
                    .field_name("vec")
                    .index_name("vec_index")
                    .index_type(IndexType::AutoIndex)
                    .metric_type(MetricType::Cosine),
            ])
            .build()?,
    )
    .await?;

// 2. Load the collection
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
const std::string collection_name = "timestamptz_test123";

milvus::IndexDesc index_vector("vec", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);
auto status = client->CreateIndex(milvus::CreateIndexRequest()
                                    .WithCollectionName(collection_name)
                                    .AddIndex(std::move(index_vector)));
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
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const collectionName = "timestamptz_test123";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

// 1. Create an index on the vector field
await client.createIndex({
  collection_name: collectionName,
  field_name: "vec",
  index_type: "AUTOINDEX",
  index_name: "vec_index",
  metric_type: "COSINE"
});

// 2. Load the collection
await client.loadCollection({
    collection_name: collectionName,
});
```

</TabItem>

<TabItem value='bash'>

```bash
# The index on the vector field was already created when the collection was created.
# Load the collection before filtering.
curl --request POST \
     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/load \
     --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
     --header 'Content-Type: application/json' \
     --header "Request-Timeout: 10" \
     --data '{ "collectionName": "timestamptz_test123" }'
```

</TabItem>
</Tabs>

</details>

#### Query with timestamp filtering\{#query-with-timestamp-filtering}

Use arithmetic operators like `==`, `!=`, `<`, `>`, `<=`, `>=`. For a full list of arithmetic operators available in Zilliz Cloud, refer to [Arithmetic Operators](./basic-filtering-operators#arithmetic-operators).

<Admonition type="info" title="Notes">

Chained range expressions (for example, `lower_bound < tsz < upper_bound`) are not supported.

Use logical conjunction instead: `tsz > lower_bound AND tsz < upper_bound`.

</Admonition>

The example below filters entities with timestamps (`tsz`) that are not equal to **2025-01-03T00:00:00+08:00**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query for entities where tsz is not equal to '2025-01-03T00:00:00+08:00'
# highlight-next-line
expr = "tsz != ISO '2025-01-03T00:00:00+08:00'"

results = client.query(
    collection_name=collection_name,
    filter=expr,
    output_fields=["id", "tsz"],
    limit=10
)

print("Query result: ", results)

# Expected output:
# Query result:  data: ["{'id': 1, 'tsz': '2024-12-31T16:00:00Z'}", "{'id': 2, 'tsz': '2025-01-01T16:00:00Z'}", "{'id': 4, 'tsz': '2025-01-03T16:00:00Z'}", "{'id': 5, 'tsz': '2025-01-04T16:00:00Z'}", "{'id': 6, 'tsz': '2025-01-05T16:00:00Z'}", "{'id': 7, 'tsz': '2025-01-06T16:00:00Z'}", "{'id': 8, 'tsz': '2025-01-07T16:00:00Z'}", "{'id': 9, 'tsz': '2025-01-08T16:00:00Z'}", "{'id': 10, 'tsz': '2025-01-09T16:00:00Z'}"]
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.List;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String collectionName = "timestamptz_test123";

String filter = "tsz != ISO '2025-01-03T00:00:00+08:00'";
QueryResp queryRet = client.query(QueryReq.builder()
        .collectionName(collectionName)
        .filter(filter)
        .outputFields(Arrays.asList("id", "tsz"))
        .limit(10)
        .build());

List<QueryResp.QueryResult> records = queryRet.getQueryResults();
for (QueryResp.QueryResult record : records) {
    System.out.println(record.getEntity());
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"
    "log"

    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

const collectionName = "timestamptz_test123"

filter := "tsz != ISO '2025-01-03T00:00:00+08:00'"

res, err := cli.Query(ctx, milvusclient.NewQueryOption(collectionName).
    WithFilter(filter).
    WithOutputFields("id", "tsz").
    WithLimit(10))
if err != nil {
    log.Fatal(err)
}

fmt.Println("Query result: ")
for i := 0; i < res.Len(); i++ {
    id, _ := res.GetColumn("id").Get(i)
    tsz, _ := res.GetColumn("tsz").Get(i)
    fmt.Println(id, tsz)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

const COLLECTION_NAME: &str = "timestamptz_test123";

let filter = "tsz != ISO '2025-01-03T00:00:00+08:00'";
let response = client
    .query(
        QueryRequest::builder()
            .collection_name(COLLECTION_NAME)
            .filter(filter)
            .output_fields(["id", "tsz"])
            .limit(10)
            .build()?,
    )
    .await?;

println!("Query result: ");
for row in response.results().rows()? {
    println!("{:?}", row.to_entity_row()?);
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>

const std::string collection_name = "timestamptz_test123";

std::string filter = "tsz != ISO '2025-01-03T00:00:00+08:00'";
auto request = milvus::QueryRequest()
                       .WithCollectionName(collection_name)
                       .WithFilter(filter)
                       .AddOutputField("id")
                       .AddOutputField("tsz")
                       .WithLimit(10);

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::EntityRows output_rows;
status = response.Results().OutputRows(output_rows);
for (const auto& row : output_rows) {
    std::cout << "\t" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const collectionName = "timestamptz_test123";

const expr = "tsz != ISO '2025-01-03T00:00:00+08:00'"
const results = await client.query({
  collection_name: collectionName,
  filter: expr,
  output_fields: ["id", "tsz"],
  limit: 10
});

console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/query \
     --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
     --header 'Content-Type: application/json' \
     --header "Request-Timeout: 10" \
     --data '{
       "collectionName": "timestamptz_test123",
       "filter": "tsz != ISO '\''2025-01-03T00:00:00+08:00'\''",
       "outputFields": ["id", "tsz"],
       "limit": 10
     }'
```

</TabItem>
</Tabs>

In the example above,

- `tsz` is the `TIMESTAMPTZ` field name defined in the schema.

- `ISO '2025-01-03T00:00:00+08:00'` is a timestamp literal in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format, including its time-zone offset.

- `!=` compares the field value against that literal. Other supported operators include `==`, `<`, `<=`, `>`, and `>=`.

#### Interval operations\{#interval-operations}

You can perform arithmetic on `TIMESTAMPTZ` fields using **INTERVAL** values in the [ISO 8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations). This allows you to add or subtract durations, such as days, hours, or minutes, from a timestamp when filtering data.

For example, the following query filters entities where the timestamp (`tsz`) plus zero days is **not equal** to **2025-01-03T00:00:00+08:00**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-next-line
expr = "tsz + INTERVAL 'P0D' != ISO '2025-01-03T00:00:00+08:00'"

results = client.query(
    collection_name,
    filter=expr,
    output_fields=["id", "tsz"],
    limit=10
)

print("Query result: ", results)

# Expected output:
# Query result:  data: ["{'id': 1, 'tsz': '2024-12-31T16:00:00Z'}", "{'id': 2, 'tsz': '2025-01-01T16:00:00Z'}", "{'id': 4, 'tsz': '2025-01-03T16:00:00Z'}", "{'id': 5, 'tsz': '2025-01-04T16:00:00Z'}", "{'id': 6, 'tsz': '2025-01-05T16:00:00Z'}", "{'id': 7, 'tsz': '2025-01-06T16:00:00Z'}", "{'id': 8, 'tsz': '2025-01-07T16:00:00Z'}", "{'id': 9, 'tsz': '2025-01-08T16:00:00Z'}", "{'id': 10, 'tsz': '2025-01-09T16:00:00Z'}"]
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.List;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String collectionName = "timestamptz_test123";

String filter = "tsz + INTERVAL 'P0D' != ISO '2025-01-03T00:00:00+08:00'";
QueryResp queryRet = client.query(QueryReq.builder()
        .collectionName(collectionName)
        .filter(filter)
        .outputFields(Arrays.asList("id", "tsz"))
        .limit(10)
        .build());

List<QueryResp.QueryResult> records = queryRet.getQueryResults();
for (QueryResp.QueryResult record : records) {
    System.out.println(record.getEntity());
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"
    "log"

    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

const collectionName = "timestamptz_test123"

filter := "tsz + INTERVAL 'P0D' != ISO '2025-01-03T00:00:00+08:00'"

res, err := cli.Query(ctx, milvusclient.NewQueryOption(collectionName).
    WithFilter(filter).
    WithOutputFields("id", "tsz").
    WithLimit(10))
if err != nil {
    log.Fatal(err)
}

fmt.Println("Query result: ")
for i := 0; i < res.Len(); i++ {
    id, _ := res.GetColumn("id").Get(i)
    tsz, _ := res.GetColumn("tsz").Get(i)
    fmt.Println(id, tsz)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

const COLLECTION_NAME: &str = "timestamptz_test123";

let filter = "tsz + INTERVAL 'P0D' != ISO '2025-01-03T00:00:00+08:00'";
let response = client
    .query(
        QueryRequest::builder()
            .collection_name(COLLECTION_NAME)
            .filter(filter)
            .output_fields(["id", "tsz"])
            .limit(10)
            .build()?,
    )
    .await?;

println!("Query result: ");
for row in response.results().rows()? {
    println!("{:?}", row.to_entity_row()?);
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>

const std::string collection_name = "timestamptz_test123";

std::string filter = "tsz + INTERVAL 'P0D' != ISO '2025-01-03T00:00:00+08:00'";
auto request = milvus::QueryRequest()
                       .WithCollectionName(collection_name)
                       .WithFilter(filter)
                       .AddOutputField("id")
                       .AddOutputField("tsz")
                       .WithLimit(10);

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::EntityRows output_rows;
status = response.Results().OutputRows(output_rows);
for (const auto& row : output_rows) {
    std::cout << "\t" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const collectionName = "timestamptz_test123";

const expr = "tsz + INTERVAL 'P0D' != ISO '2025-01-03T00:00:00+08:00'";
const results = await client.query({
  collection_name: collectionName,
  filter: expr,
  output_fields: ["id", "tsz"],
  limit: 10
});

console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/query \
     --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
     --header 'Content-Type: application/json' \
     --header "Request-Timeout: 10" \
     --data '{
       "collectionName": "timestamptz_test123",
       "filter": "tsz + INTERVAL '\''P0D'\'' != ISO '\''2025-01-03T00:00:00+08:00'\''",
       "outputFields": ["id", "tsz"],
       "limit": 10
     }'
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

`INTERVAL` values follow the [ISO 8601 duration syntax](https://www.w3.org/TR/xmlschema-2/#duration). For example:

- `P1D` → 1 day

- `PT3H` → 3 hours

- `P2DT6H` → 2 days and 6 hours

You can use `INTERVAL` arithmetic directly in filter expressions, such as:

- `tsz + INTERVAL 'P3D'` → Adds 3 days

- `tsz - INTERVAL 'PT2H'` → Subtracts 2 hours

</Admonition>

#### Search with timestamp filtering\{#search-with-timestamp-filtering}

You can combine `TIMESTAMPTZ` filtering with vector similarity search to narrow results by both time and similarity.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define a time-based filter expression
filter = "tsz > ISO '2025-01-05T00:00:00+08:00'"

res = client.search(
    collection_name=collection_name,             # Collection name
    data=[[0.1, 0.2, 0.3, 0.4]],                  # Query vector (must match collection's vector dim)
    limit=5,                                      # Max. number of results to return
    # highlight-next-line
    filter=filter,                                # Filter expression using TIMESTAMPTZ
    output_fields=["id", "tsz"],  # Fields to include in the search results
)

print("Search result: ", res)

# Expected output:
# Search result:  data: [[{'id': 6, 'distance': 0.9128709435462952, 'entity': {'tsz': '2025-01-05T16:00:00Z', 'id': 6}}, {'id': 7, 'distance': 0.9128709435462952, 'entity': {'tsz': '2025-01-06T16:00:00Z', 'id': 7}}, {'id': 8, 'distance': 0.9128709435462952, 'entity': {'tsz': '2025-01-07T16:00:00Z', 'id': 8}}, {'id': 10, 'distance': 0.9128709435462952, 'entity': {'tsz': '2025-01-09T16:00:00Z', 'id': 10}}, {'id': 9, 'distance': 0.9128708839416504, 'entity': {'tsz': '2025-01-08T16:00:00Z', 'id': 9}}]]
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

String collectionName = "timestamptz_test123";

String filter = "tsz > ISO '2025-01-05T00:00:00+08:00'";
SearchResp searchR = client.search(SearchReq.builder()
        .collectionName(collectionName)
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f})))
        .limit(5)
        .filter(filter)
        .outputFields(Arrays.asList("id", "tsz"))
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchR.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.printf("ID: %d, Score: %f, %s\n", (long) result.getId(), result.getScore(), result.getEntity().toString());
    }
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

const collectionName = "timestamptz_test123"

filter := "tsz > ISO '2025-01-05T00:00:00+08:00'"

results, err := cli.Search(ctx, milvusclient.NewSearchOption(collectionName, 5,
    []entity.Vector{entity.FloatVector{0.1, 0.2, 0.3, 0.4}}).
    WithFilter(filter).
    WithOutputFields("id", "tsz"))
if err != nil {
    log.Fatal(err)
}

for _, rs := range results {
    for i := 0; i < rs.Len(); i++ {
        id, _ := rs.GetColumn("id").Get(i)
        tsz, _ := rs.GetColumn("tsz").Get(i)
        fmt.Println("Search result: ", rs.Scores[i], id, tsz)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

const COLLECTION_NAME: &str = "timestamptz_test123";

let filter = "tsz > ISO '2025-01-05T00:00:00+08:00'";
let response = client
    .search(
        SearchRequest::builder()
            .collection_name(COLLECTION_NAME)
            .vector_field("vec")
            .vectors(SearchVectors::Float(vec![vec![0.1, 0.2, 0.3, 0.4]]))
            .filter(filter)
            .output_fields(["id", "tsz"])
            .limit(5)
            .build()?,
    )
    .await?;

println!("Search result: ");
for result in response.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>
#include <vector>

const std::string collection_name = "timestamptz_test123";

std::string filter = "tsz > ISO '2025-01-05T00:00:00+08:00'";
std::vector<float> query_vector = {0.1f, 0.2f, 0.3f, 0.4f};
auto request = milvus::SearchRequest()
                   .WithCollectionName(collection_name)
                   .WithFilter(filter)
                   .WithLimit(5)
                   .AddOutputField("id")
                   .AddOutputField("tsz")
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
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const collectionName = "timestamptz_test123";

const expr = "tsz > ISO '2025-01-05T00:00:00+08:00'";
const results = await client.search({
  collection_name: collectionName,
  data: [[0.1, 0.2, 0.3, 0.4]], // Query vector (must match collection's vector dim)
  filter: expr,
  output_fields: ["id", "tsz"],
  limit: 5
});

console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search \
     --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
     --header 'Content-Type: application/json' \
     --header "Request-Timeout: 10" \
     --data '{
       "collectionName": "timestamptz_test123",
       "data": [[0.1, 0.2, 0.3, 0.4]],
       "limit": 5,
       "filter": "tsz > ISO '\''2025-01-05T00:00:00+08:00'\''",
       "outputFields": ["id", "tsz"]
     }'
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

If your collection has two or more vector fields, you can perform hybrid search operations with timestamp filtering. For details, refer to [Multi-Vector Hybrid Search](./hybrid-search).

</Admonition>

## Advanced usage\{#advanced-usage}

For advanced usage, you can manage time zones at different levels (e.g. database, collection, or query) or accelerate queries on `TIMESTAMPTZ` fields using indexes.

### Manage time zones at different levels\{#manage-time-zones-at-different-levels}

You can control the time zone for `TIMESTAMPTZ` fields at the **collection** or **query/search** level.

| Level | Parameter | Scope | Priority |
| --- | --- | --- | --- |
| Collection | `timezone` | Overrides the database default time zone setting for that collection | Medium |
| Query/search/hybrid search | `timezone` | Temporary overrides for one specific operation | Highest |

For step-by-step instructions and code samples, refer to the dedicated pages:

- [Modify Collection](./modify-collections#example-7-set-collection-time-zone)

- [Query](./get-and-scalar-query#temporarily-set-a-timezone-for-a-query)

- [Basic Vector Search](./single-vector-search#temporarily-set-a-timezone-for-a-search)

- [Multi-Vector Hybrid Search](./hybrid-search)

### Accelerate queries\{#accelerate-queries}

By default, queries on `TIMESTAMPTZ` fields without an index will perform a full scan of all rows, which can be slow on large datasets. To accelerate timestamp queries, create an AUTOINDEX index on your `TIMESTAMPTZ` field.

For details, refer to [STL_SORT](./slt-sort-index-type).