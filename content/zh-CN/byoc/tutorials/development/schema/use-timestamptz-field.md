---
title: "TIMESTAMPTZ 类型 | BYOC"
slug: /use-timestamptz-field
sidebar_label: "TIMESTAMPTZ 类型"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "应用需要在跨区域处理中追踪时间（例如电商系统、协作工具或分布式日志系统），通常必须精确处理带有时区信息的时间戳。`TIMESTAMPTZ` 数据类型在 Zilliz Cloud 中通过存储带有时区的时间戳来提供这一能力。 | BYOC"
type: origin
token: E722wYOs1i8YbVkrFrcci3Rynfb
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TIMESTAMPTZ 类型

应用需要在跨区域处理中追踪时间（例如电商系统、协作工具或分布式日志系统），通常必须精确处理带有时区信息的时间戳。`TIMESTAMPTZ` 数据类型在 Zilliz Cloud 中通过存储带有时区的时间戳来提供这一能力。

## 什么是 TIMESTAMPTZ 字段？\{#what-is-a-timestamptz-field}

`TIMESTAMPTZ` 字段是一种在 Zilliz Cloud 中以 `DataType.TIMESTAMPTZ` 定义的数据类型，它能够处理带时区的输入，并将所有时间点以 UTC 绝对时间的形式存储：

- **接受的输入格式**：`TIMESTAMPTZ` 字段支持符合 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 规范的时间戳字符串，包括：

    - `"2024-12-31 22:00:00"`

    - `"2024-12-31T22:00:00"`

    - `"2024-12-31T22:00:00+08:00"`

    - `"2024-12-31T22:00:00Z"`

- **时间戳解析规则**：时间戳的解析方式取决于输入字符串是否显式指定了时区信息：

    - 如果输入中包含时区偏移量（例如 +08:00 或 Z），则该时间戳会被视为一个绝对时间点。

    - 如果输入中未包含时区偏移量，则会使用 collection 配置的 timezone 进行解析。例如，当 collection 的时区设置为 Asia/Shanghai 时：

        - `"2024-12-31 22:00:00"` 会被解析为 **2024-12-31T22:00:00+08:00**

        - `"2024-12-31T22:00:00"` 会被解析为 **2024-12-31T22:00:00Z**，对应的本地时间为 **2025-01-01T06:00:00+08:00**

- **内部存储**：所有 `TIMESTAMPTZ` 值都会被标准化并以协调世界时（UTC）存储。

- **比较与过滤**：所有针对 TIMESTAMPTZ 字段的比较、过滤和排序操作，均基于标准化后的 UTC 值执行，从而确保在不同时区下具有一致且可预测的行为。

<Admonition type="info" title="说明">

- 你可以为 `TIMESTAMPTZ` 字段设置 `nullable=True` 以允许缺失值。

- 你可以通过 `default_value` 属性以 ISO 8601 格式指定默认时间戳。

有关更多信息，请参考 [Nullable 和默认值](./nullable-fields)。

</Admonition>

## 基本操作\{#basic-operations}

TIMESTAMPTZ 字段的基本使用流程与其他标量字段一致：定义字段 → 插入数据 → 查询/过滤检索。

### 步骤 1：定义 TIMESTAMPTZ 字段\{#step-1-define-a-timestamptz-field}

要使用 `TIMESTAMPTZ` 字段，你需要在创建 Collection 时，在 schema 中显式定义该字段。以下示例展示了如何创建一个包含类型为 `DataType.TIMESTAMPTZ` 的 `tsz` 字段的 Collection。

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

### 步骤 2：插入数据\{#step-2-insert-data}

插入包含带时区偏移量的 ISO 8601 字符串的实体。

下面的示例向 Collection 中插入 8,193 行示例数据。每一行包含：

- 一个唯一的 ID

- 一个带时区信息的时间戳（上海时间）

- 一个简单的 4 维向量

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

### 步骤 3：过滤操作\{#filtering-operations}

`TIMESTAMPTZ` 支持标量比较、时间区间运算，以及时间组件的提取。

在对 `TIMESTAMPTZ` 字段执行过滤操作之前，请确保：

- 已为每个向量字段创建索引。

- Collection 已加载到内存中。

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

### 基于时间戳过滤的查询\{#query-with-timestamp-filtering}

使用算术运算符（如 ==、!=、\<、>、&lt;=、>=）。

有关 Zilliz Cloud 中可用的完整算术运算符列表，请参考 [基本操作符](./basic-filtering-operators)。

<Admonition type="info" title="说明">

不支持链式范围表达式（例如 `lower_bound < tsz < upper_bound`）。

请改用逻辑与条件，例如：`tsz > lower_bound AND tsz < upper_bound`。

</Admonition>

下面的示例会过滤出时间戳字段 `tsz` 不等于 **2025-01-03T00:00:00+08:00** 的实体：

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

在上面的示例中：

- `tsz` 是在 schema 中定义的 `TIMESTAMPTZ` 字段名。

- `ISO '2025-01-03T00:00:00+08:00'` 是遵循 ISO 8601 格式的时间戳字面量，包含其时区偏移量。

- `!=` 用于将字段值与该字面量进行比较。其他支持的运算符包括 ==、\<、&lt;=、> 和 >=。

### 时间区间（Interval）运算\{#interval-operations}

你可以使用 [ISO 8601 持续时间](https://en.wikipedia.org/wiki/ISO_8601#Durations)格式的 **INTERVAL** 值对 TIMESTAMPTZ 字段进行时间运算。这使你能够在过滤数据时，对时间戳进行加减运算，例如增加或减少天、小时或分钟。

例如，下面的查询会筛选出时间戳字段（`tsz`）加上 0 天后不等于 **2025-01-03T00:00:00+08:00** 的实体：

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

<Admonition type="info" title="说明">

INTERVAL 值遵循 [ISO 8601 的持续时间](https://www.w3.org/TR/xmlschema-2/#duration)语法。例如：

- `P1D` → 1 天

- `PT3H` → 3 小时

- `P2DT6H` → 2 天 6 小时

你可以在过滤表达式中直接使用 INTERVAL 运算，例如：

- `tsz + INTERVAL 'P3D'` → 加 3 天

- `tsz - INTERVAL 'PT2H'` → 减 2 小时

</Admonition>

### 基于时间戳过滤的向量搜索\{#search-with-timestamp-filtering}

你可以将 `TIMESTAMPTZ` 过滤与向量相似度搜索结合使用，从而同时根据时间与相似度缩小搜索结果范围。

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

<Admonition type="info" title="说明">

如果你的 Collection 包含两个或以上的向量字段，你可以在执行混合搜索时结合时间戳过滤。详情请参考[多向量混合搜索](./hybrid-search)。

</Admonition>

## 高级用法\{#advanced-usage}

在高级场景中，你可以在不同层级（例如数据库、Collection 或查询）管理时区，或通过索引加速对 `TIMESTAMPTZ` 字段的查询。

### 在不同层级管理时区\{#manage-time-zones-at-different-levels}

你可以在Collection 级或查询/搜索级为 TIMESTAMPTZ 字段控制时区。

| 层级 | 参数 | 范围 | 优先级 |
| --- | --- | --- | --- |
| Collection | `timezone` | 覆盖 Database 级默认时区，仅作用于该 Collection | 中等 |
| Query/search/hybrid search | `timezone` | 针对某次操作的临时覆盖 | 最高 |

要查看分步骤说明与示例代码，请参阅以下页面：

- [修改 Collection](./modify-collections#example-7-set-collection-time-zone)

- [Query](./get-and-scalar-query#temporarily-set-a-timezone-for-a-query)

- [基本 Vector Search](./single-vector-search#temporarily-set-a-timezone-for-a-search)

- [多向量混合搜索](./hybrid-search#temporarily-set-a-timezone-for-a-hybrid-search)

### 加速查询\{#accelerate-queries}

默认情况下，如果 TIMESTAMPTZ 字段未建立索引，查询将对所有行执行全表扫描，这在大型数据集中会非常缓慢。

要加速时间戳相关的查询，请在 TIMESTAMPTZ 字段上创建 AUTOINDEX 索引。