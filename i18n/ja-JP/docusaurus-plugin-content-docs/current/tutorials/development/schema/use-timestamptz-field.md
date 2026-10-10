---
title: "TIMESTAMPTZ フィールド | Cloud"
slug: /use-timestamptz-field
sidebar_label: "TIMESTAMPTZ フィールド"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "リージョン間で時間を追跡するアプリケーション（eコマースシステム、コラボレーションツール、分散ログなど）では、タイムゾーン付きのタイムスタンプを正確に扱う必要があります。Zilliz Cloud の `TIMESTAMPTZ` データ型は、タイムスタンプを関連するタイムゾーンとともに保存することでこの機能を提供します。 | Cloud"
type: origin
token: RxUiwJ77WiFKZGkC8rEcLeopnTf
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TIMESTAMPTZ フィールド

リージョン間で時間を追跡するアプリケーション（eコマースシステム、コラボレーションツール、分散ログなど）では、タイムゾーン付きのタイムスタンプを正確に扱う必要があります。Zilliz Cloud の `TIMESTAMPTZ` データ型は、タイムスタンプを関連するタイムゾーンとともに保存することでこの機能を提供します。

## TIMESTAMPTZ フィールドとは何か？\{#what-is-a-timestamptz-field}

`TIMESTAMPTZ` フィールドは、Zilliz Cloud におけるスキーマ定義のデータ型（`DataType.TIMESTAMPTZ`）であり、タイムゾーンを考慮した入力処理を行い、すべての時点を内部的に UTC の絶対時刻として保存します:

- **受け付けられる入力形式**: `TIMESTAMPTZ` フィールドは、次を含む [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 互換のタイムスタンプ文字列を受け付けます:

    - `"2024-12-31 22:00:00"`

    - `"2024-12-31T22:00:00"`

    - `"2024-12-31T22:00:00+08:00"`

    - `"2024-12-31T22:00:00Z"`

- **タイムスタンプの解析ルール**: タイムスタンプの解釈方法は、入力文字列でタイムゾーンが明示的に指定されているかどうかによって異なります:

    - 入力にタイムゾーンオフセット（たとえば **+08:00** または **Z**）が含まれている場合、その入力は絶対的な時点として扱われます。

    - 入力にタイムゾーンオフセットが含まれていない場合、コレクションに設定されたタイムゾーンを使用して解釈されます。たとえば、コレクションのタイムゾーンが **Asia/Shanghai**:

        - `"2024-12-31 22:00:00"` は **2024-12-31T22:00:00+08:00** として解釈されます

        - `"2024-12-31T22:00:00"` は **2024-12-31T22:00:00Z** として解釈され、これは **2025-01-01T06:00:00+08:00** に相当します

- **内部ストレージ**: すべての `TIMESTAMPTZ` 値は正規化され、[協定世界時](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)（UTC）として保存されます。

- **比較とフィルタリング**: TIMESTAMPTZ フィールドに対するすべての比較、フィルタリング、並べ替え操作は、UTC に正規化された値に対して実行されるため、異なるタイムゾーン間でも一貫した動作が保証されます。

<Admonition type="info" title="Notes">

- `TIMESTAMPTZ` フィールドに `nullable=True` を設定すると、欠損値を許可できます。

- [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 形式で `default_value` 属性を使用して、デフォルトのタイムスタンプ値を指定できます。

詳細については、[Nullable & Default](./nullable-fields) を参照してください。

</Admonition>

## 基本的な操作\{#basic-operations}

`TIMESTAMPTZ` フィールドを使用する基本的な流れは、Zilliz Cloud の他のスカラーフィールドと同じです。フィールドを定義する → データを挿入する → query/filter. という流れになります。

### ステップ 1: TIMESTAMPTZ フィールドを定義する\{#step-1-define-a-timestamptz-field}

`TIMESTAMPTZ` フィールドを使用するには、コレクションを作成する際にコレクションスキーマで明示的に定義します。次の例では、`DataType.TIMESTAMPTZ` 型の `tsz` フィールドを持つコレクションを作成する方法を示します。

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

### ステップ 2: データを挿入する\{#step-2-insert-data}

タイムゾーンオフセットを含む ISO 8601 文字列を持つエンティティを挿入します。

次の例では、8,193 行のサンプルデータをコレクションに挿入します。各行には次のものが含まれます:

- 一意の ID

- タイムゾーンを考慮したタイムスタンプ（上海時間）

- シンプルな 4 次元ベクトル

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

### ステップ 3: フィルタリング操作\{#step-3-filtering-operations}

`TIMESTAMPTZ` は、スカラー比較、インターバル演算、時間コンポーネントの抽出をサポートしています。

`TIMESTAMPTZ` フィールドでフィルタリング操作を実行する前に、次の点を確認してください:

- 各ベクトルフィールドにインデックスを作成していること。

- コレクションがメモリにロードされていること。

<details>

<summary>サンプルコードを表示する</summary>

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

#### タイムスタンプフィルタリングを使用したクエリ\{#query-with-timestamp-filtering}

`==`、`!=`、`<`、`>`、`<=`、`>=` などの算術演算子を使用します。Zilliz Cloud で使用可能な算術演算子の完全な一覧については、[Arithmetic Operators](./basic-filtering-operators#arithmetic-operators) を参照してください。

<Admonition type="info" title="Notes">

連鎖した範囲式（たとえば `lower_bound < tsz < upper_bound`）はサポートされていません。

代わりに論理積を使用してください: `tsz > lower_bound AND tsz < upper_bound`。

</Admonition>

次の例では、タイムスタンプ（`tsz`）が **2025-01-03T00:00:00+08:00** と等しくないエンティティをフィルタリングします:

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

上記の例では、

- `tsz` は、スキーマで定義された `TIMESTAMPTZ` フィールドの名前です。

- `ISO '2025-01-03T00:00:00+08:00'` は、タイムゾーンオフセットを含む [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 形式のタイムスタンプリテラルです。

- `!=` は、フィールド値をそのリテラルと比較します。その他にサポートされている演算子には、`==`、`<`、`<=`、`>`、`>=` があります。

#### インターバル演算\{#interval-operations}

[ISO 8601 の期間形式](https://en.wikipedia.org/wiki/ISO_8601#Durations)の **INTERVAL** 値を使用して、`TIMESTAMPTZ` フィールドに対して算術演算を実行できます。これにより、データをフィルタリングする際に、タイムスタンプに対して日、時間、分などの期間を加算または減算できます。

たとえば、次のクエリは、タイムスタンプ（`tsz`）に 0 日を加算した値が **2025-01-03T00:00:00+08:00** と **等しくない** エンティティをフィルタリングします:

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

`INTERVAL` 値は [ISO 8601 の期間構文](https://www.w3.org/TR/xmlschema-2/#duration)に従います。例:

- `P1D` → 1 日

- `PT3H` → 3 時間

- `P2DT6H` → 2 日と 6 時間

`INTERVAL` 演算は、次のようにフィルター式で直接使用できます:

- `tsz + INTERVAL 'P3D'` → 3 日を加算します

- `tsz - INTERVAL 'PT2H'` → 2 時間を減算します

</Admonition>

#### タイムスタンプフィルタリングを使用した検索\{#search-with-timestamp-filtering}

`TIMESTAMPTZ` フィルタリングとベクトル類似検索を組み合わせて、時間と類似度の両方で結果を絞り込むことができます。

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

コレクションに 2 つ以上のベクトルフィールドがある場合、タイムスタンプフィルタリングを使用したハイブリッド検索操作を実行できます。詳細については、[Multi-ベクトル Hybrid Search](./hybrid-search) を参照してください。

</Admonition>

## 高度な使用法\{#advanced-usage}

高度な使用法として、さまざまなレベル（データベース、コレクション、クエリなど）でタイムゾーンを管理したり、インデックスを使用して `TIMESTAMPTZ` フィールドのクエリを高速化したりできます。

### さまざまなレベルでタイムゾーンを管理する\{#manage-time-zones-at-different-levels}

`TIMESTAMPTZ` フィールドのタイムゾーンは、**コレクション** レベルまたは **query/search** レベルで制御できます。

| レベル | パラメーター | スコープ | 優先度 |
| --- | --- | --- | --- |
| コレクション | `timezone` | そのコレクションのデータベースのデフォルトタイムゾーン設定を上書きします。 | 中 |
| Query/search/hybrid search | `timezone` | 特定の 1 回の操作に対する一時的な上書き | 最高 |

手順とコードサンプルについては、専用のページを参照してください:

- [Modify コレクション](./modify-collections#example-7-set-collection-time-zone)

- [Query](./get-and-scalar-query#temporarily-set-a-timezone-for-a-query)

- [Basic ベクトル Search](./single-vector-search#temporarily-set-a-timezone-for-a-search)

- [Multi-ベクトル Hybrid Search](./hybrid-search)

### クエリを高速化する\{#accelerate-queries}

デフォルトでは、インデックスのない `TIMESTAMPTZ` フィールドに対するクエリはすべての行をフルスキャンするため、大規模なデータセットでは遅くなる可能性があります。タイムスタンプのクエリを高速化するには、`TIMESTAMPTZ` フィールドに AUTOINDEX インデックスを作成します。

詳細については、[STL_SORT](./slt-sort-index-type) を参照してください。
