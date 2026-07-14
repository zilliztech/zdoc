---
title: "TIMESTAMPTZ フィールド | BYOC"
slug: /use-timestamptz-field
sidebar_label: "TIMSTAMPTZ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "e コマースシステム、コラボレーションツール、分散ログのように、リージョンをまたいで時刻を追跡するアプリケーションでは、タイムゾーン付きタイムスタンプを正確に扱う必要があります。Zilliz Cloud の `TIMESTAMPTZ` データ型は、関連付けられたタイムゾーンとともにタイムスタンプを保存することで、この機能を提供します。 | BYOC"
type: origin
token: RxUiwJ77WiFKZGkC8rEcLeopnTf
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TIMESTAMPTZ フィールド

e コマースシステム、コラボレーションツール、分散ログのように、リージョンをまたいで時刻を追跡するアプリケーションでは、タイムゾーン付きタイムスタンプを正確に扱う必要があります。Zilliz Cloud の `TIMESTAMPTZ` データ型は、関連付けられたタイムゾーンとともにタイムスタンプを保存することで、この機能を提供します。

## TIMESTAMPTZ フィールドとは何ですか？\{#what-is-a-timestamptz-field}

`TIMESTAMPTZ` フィールドは、Zilliz Cloud のスキーマで定義されるデータ型（`DataType.TIMESTAMPTZ`）であり、タイムゾーンを考慮した入力を処理し、すべての時点を内部的には UTC の絶対時刻として保存します。

- **受け入れ可能な入力形式**: `TIMESTAMPTZ` フィールドは、以下を含む [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 互換のタイムスタンプ文字列を受け入れます。

    - `"2024-12-31 22:00:00"`

    - `"2024-12-31T22:00:00"`

    - `"2024-12-31T22:00:00+08:00"`

    - `"2024-12-31T22:00:00Z"`

- **タイムスタンプの解析ルール**: タイムスタンプがどのように解釈されるかは、入力文字列にタイムゾーンが明示されているかどうかによって異なります。

    - 入力にタイムゾーンオフセット（たとえば **+08:00** または **Z**）が含まれている場合、それは絶対的な時点として扱われます。

    - 入力にタイムゾーンオフセットが含まれていない場合は、collection に設定された timezone を使用して解釈されます。たとえば、collection timezone が **Asia/Shanghai** の場合:

        - `"2024-12-31 22:00:00"` は **2024-12-31T22:00:00+08:00** として解釈されます

        - `"2024-12-31T22:00:00"` は **2024-12-31T22:00:00Z** として解釈され、これは **2025-01-01T06:00:00+08:00** に相当します

- **内部保存**: すべての `TIMESTAMPTZ` 値は正規化され、[協定世界時](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)（UTC）で保存されます。

- **比較とフィルタリング**: TIMESTAMPTZ フィールドに対するすべての比較、フィルタリング、および並び替え操作は UTC に正規化された値に対して実行されるため、異なるタイムゾーン間でも一貫した動作が保証されます。

<Admonition type="info" icon="📘" title="注意">

- 欠損値を許可するために、`TIMESTAMPTZ` フィールドに `nullable=True` を設定できます。

- [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 形式で、`default_value` 属性を使用してデフォルトのタイムスタンプ値を指定できます。

詳細は [Nullable & Default](./nullable-fields) を参照してください。

</Admonition>

## 基本操作\{#basic-operations}

`TIMESTAMPTZ` フィールドを使用する基本的なワークフローは、Zilliz Cloud の他の scalar フィールドと同様です: フィールドを定義 → データを挿入 → クエリ/フィルタリング。

### ステップ 1: TIMESTAMPTZ フィールドを定義する\{#step-1-define-a-timestamptz-field}

`TIMESTAMPTZ` フィールドを使用するには、collection を作成する際に collection スキーマ内で明示的に定義します。次の例では、`DataType.TIMESTAMPTZ` 型の `tsz` フィールドを持つ collection を作成する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.common.DataType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

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

String collectionName = "timestamptz_test123";
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName(collectionName)
        .collectionSchema(schema)
        .consistencyLevel(ConsistencyLevel.SESSION)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require('@zilliz/milvus2-sdk-node');

const serverAddress = 'YOUR_CLUSTER_ENDPOINT';
const collectionName = 'timestamptz_test123';

const client = new MilvusClient({
  address: serverAddress,
});

await client.createCollection({
    collection_name: collectionName,
    fields: [
      {
        name: 'id',
        data_type: DataType.Int64,
        is_primary_key: true,
      },
      {
        name: 'tsz',
        data_type: DataType.TimestampTZ,
        nullable: true,
      },
      {
        name: 'vec',
        data_type: DataType.FloatVector,
        dim: 4,
      },
    ]
  });
```

</TabItem>

<TabItem value='go'>

```go
// go
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
           "indexConfig": { "index_type": "AUTOINDEX" }
         }
       ],
       "consistencyLevel": "Session"
     }'
```

</TabItem>
</Tabs>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true});
schema->AddField(milvus::FieldSchema("tsz", milvus::DataType::TIMESTAMPTZ));
schema->AddField(milvus::FieldSchema("vec", milvus::DataType::FLOAT_VECTOR).WithDimension(4));

const std::string collection_name = "timestamptz_test123";
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName(collection_name)
                                        .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

### ステップ 2: データを挿入する\{#step-2-insert-data}

タイムゾーンオフセット付きの ISO 8601 文字列を含む entity を挿入します。

以下の例では、collection に 8,193 行のサンプルデータを挿入します。各行には以下が含まれます。

- 一意の ID

- タイムゾーンを考慮したタイムスタンプ（上海時間）

- シンプルな 4 次元 vector

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
        "vec": [float(i) / 10 for i in range(4)],
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
import io.milvus.v2.service.vector.request.InsertReq;

public static List<Float> generateFloatVector(int dimension) {
    Random ran = new Random();
    List<Float> vector = new ArrayList<>();
    for (int i = 0; i < dimension; ++i) {
        vector.add(ran.nextFloat());
    }
    return vector;
}

int rowCount = 10;
ZoneId zone = ZoneId.of("Asia/Shanghai");
DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
for (long i = 0L; i < rowCount; ++i) {
    JsonObject row = new JsonObject();
    row.addProperty("id", i);
    row.add("vec", gson.toJsonTree(CommonUtils.generateFloatVector(4)));

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

<TabItem value='javascript'>

```javascript
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
const baseDate = new Date(2025, 0, 1 + i, 0, 0, 0);

const year = baseDate.getFullYear();
const month = baseDate.getMonth() + 1;
const day = baseDate.getDate();

const isoString = formatDateWithTimezone(year, month, day, 0, 0, 0, '+08:00');

data.push({
  id: i + 1,
  tsz: isoString,
  vec: Array.from({ length: 4 }, (_, j) => i / 10),
});
}

await client.insert({
collection_name: collectionName,
data: data,
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \      
    --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert \      
    --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \      
    --header 'Content-Type: application/json' \      
    --header "Request-Timeout: 10" \
    --data '{        "collectionName": "timestamptz_test123",        "data": [          { "id": 1, "tsz": "2026-01-14T19:50:00Z", "vec": [0.1, 0.2, 0.3, 0.4] },          { "id": 2, "tsz": "2026-01-14T12:00:00+08:00", "vec": [0.5, 0.6, 0.7, 0.8] },          { "id": 3, "vec": [0.9, 0.0, 0.1, 0.2] }        ]      }'
```

</TabItem>
</Tabs>

```c++
std::string
pad(int num, int width) {
    std::ostringstream oss;
    oss << std::setw(width) << std::setfill('0') << num;
    return oss.str();
}

std::string
formatDateWithTimezone(int year, int month, int day, int hour, int minute, int second,
                       std::string timezoneOffset = "+08:00") {
    std::string ts = std::to_string(year) + "-" + pad(month, 2) + "-" + pad(day, 2) + "T" + pad(hour, 2) + ":" +
                     pad(minute, 2) + ":" + pad(second, 2) + timezoneOffset;
    return ts;
}

milvus::EntityRows rows;
for (auto i = 0; i < 10; i++) {
    milvus::EntityRow row;
    row["id"] = i;
    row["vec"] = std::vector<float>{i/10, (i+1)/10, (i+2)/10, (i+3)/10};
    std::string ts = formatDateWithTimezone(2025, 01, i + 1, 0, 0, 0);
    row["tsz"] = ts;
    rows.emplace_back(std::move(row));
}

auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName(collection_name)
                                .WithRowsData(std::move(data)).
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

### ステップ 3: フィルタリング操作\{#step-3-filtering-operations}

`TIMESTAMPTZ` は scalar 比較、interval 演算、および時間コンポーネントの抽出をサポートします。

`TIMESTAMPTZ` フィールドに対してフィルタリング操作を実行する前に、以下を確認してください。

- 各 vector フィールドに index を作成していること。

- collection がメモリにロードされていること。

<details>

<summary>コード例を表示</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

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
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
await client.createIndex({
  collection_name: collection_name,
  field_name: "vec",
  index_type: "AUTOINDEX",
  index_name: "vec_index",
  metric_type: "COSINE"
});
  
await client.loadCollection({
    collection_name: collection_name,
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \      
    --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/load \      
    --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \      
    --header 'Content-Type: application/json' \      
    --header "Request-Timeout: 10" \
    --data '{ "collectionName": "timestamptz_test123" }'
```

</TabItem>
</Tabs>

```c++
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

</details>

#### タイムスタンプフィルタリングを使用したクエリ\{#query-with-timestamp-filtering}

`==`、`!=`、`<`、`>`、`<=`、`>=` などの算術演算子を使用します。Zilliz Cloud で利用可能な算術演算子の完全な一覧については、[Arithmetic Operators](./basic-filtering-operators#arithmetic-operators) を参照してください。

<Admonition type="info" icon="📘" title="注意">

連鎖した範囲式（たとえば `lower_bound < tsz < upper_bound`）はサポートされていません。

代わりに論理積を使用してください: `tsz > lower_bound AND tsz < upper_bound`。

</Admonition>

以下の例では、タイムスタンプ（`tsz`）が **2025-01-03T00:00:00+08:00** と等しくない entity をフィルタリングします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
# Query result:  data: ["{'id': 1, 'tsz': '2024-12-31T16:00:00Z'}", "{'id': 2, 'tsz': '2025-01-01T16:00:00Z'}", "{'id': 4, 'tsz': '2025-01-03T16:00:00Z'}", "{'id': 5, 'tsz': '2025-01-04T16:00:00Z'}", "{'id': 6, 'tsz': '2025-01-05T16:00:00Z'}", "{'id': 7, 'tsz': '2025-01-06T16:00:00Z'}", "{'id': 8, 'tsz': '2025-01-07T16:00:00Z'}", "{'id': 9, 'tsz': '2025-01-08T16:00:00Z'}", "{'id': 10, 'tsz': '2025-01-09T16:00:00Z'}", "{'id': 11, 'tsz': '2025-01-10T16:00:00Z'}"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

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

<TabItem value='javascript'>

```javascript
const expr = "tsz != ISO '2025-01-03T00:00:00+08:00'"
const results = await client.query({
  collection_name,
  filter: expr,
  output_fields: ["id", "tsz"],
  limit: 10
});

console.log(results);
```

</TabItem>

<TabItem value='go'>

```go
// go
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

```c++
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
status = query_results.OutputRows(output_rows);
for (const auto& row : output_rows) {
    std::cout << "\t" << row << std::endl;
}
```

上記の例では、

- `tsz` はスキーマで定義された `TIMESTAMPTZ` フィールド名です。

- `ISO '2025-01-03T00:00:00+08:00'` は、タイムゾーンオフセットを含む [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 形式のタイムスタンプリテラルです。

- `!=` はフィールド値をそのリテラルと比較します。その他にサポートされている演算子には `==`、`<`、`<=`、`>`、`>=` があります。

#### Interval 操作\{#interval-operations}

[ISO 8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations) の **INTERVAL** 値を使用して、`TIMESTAMPTZ` フィールドに対して算術演算を行えます。これにより、データをフィルタリングするときに、日、時間、分などの duration をタイムスタンプに加算または減算できます。

たとえば、次のクエリは、タイムスタンプ（`tsz`）に 0 日を加えた値が **2025-01-03T00:00:00+08:00** と**等しくない** entity をフィルタリングします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
# Query result:  data: ["{'id': 1, 'tsz': '2024-12-31T16:00:00Z'}", "{'id': 2, 'tsz': '2025-01-01T16:00:00Z'}", "{'id': 4, 'tsz': '2025-01-03T16:00:00Z'}", "{'id': 5, 'tsz': '2025-01-04T16:00:00Z'}", "{'id': 6, 'tsz': '2025-01-05T16:00:00Z'}", "{'id': 7, 'tsz': '2025-01-06T16:00:00Z'}", "{'id': 8, 'tsz': '2025-01-07T16:00:00Z'}", "{'id': 9, 'tsz': '2025-01-08T16:00:00Z'}", "{'id': 10, 'tsz': '2025-01-09T16:00:00Z'}", "{'id': 11, 'tsz': '2025-01-10T16:00:00Z'}"]
```

</TabItem>

<TabItem value='java'>

```java
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

<TabItem value='javascript'>

```javascript
const expr = "tsz + INTERVAL 'P0D' != ISO '2025-01-03T00:00:00+08:00'";
const results = await client.query({
  collection_name,
  filter: expr,
  output_fields: ["id", "tsz"],
  limit: 10
});

console.log(results);
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \      
    --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/query \      
    --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \      
    --header 'Content-Type: application/json' \      
    --header "Request-Timeout: 10" \
    --data '{        "collectionName": "timestamptz_test123",        "filter": "tsz + INTERVAL '\''P0D'\'' != ISO '\''2025-01-03T00:00:00+08:00'\''",        "outputFields": ["id", "tsz"],        "limit": 10      }'
```

</TabItem>
</Tabs>

```c++
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
status = query_results.OutputRows(output_rows);
for (const auto& row : output_rows) {
    std::cout << "\t" << row << std::endl;
}
```

<Admonition type="info" icon="📘" title="注意">

`INTERVAL` 値は [ISO 8601 duration syntax](https://www.w3.org/TR/xmlschema-2/#duration) に従います。たとえば:

- `P1D` → 1 日

- `PT3H` → 3 時間

- `P2DT6H` → 2 日と 6 時間

`INTERVAL` 演算は、次のようにフィルタ式内で直接使用できます。

- `tsz + INTERVAL 'P3D'` → 3 日追加

- `tsz - INTERVAL 'PT2H'` → 2 時間減算

</Admonition>

#### タイムスタンプフィルタリングを使用した検索\{#search-with-timestamp-filtering}

`TIMESTAMPTZ` フィルタリングを vector 類似検索と組み合わせることで、時間と類似度の両方で結果を絞り込むことができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
# Search result:  data: [[{'id': 10, 'distance': 0.9759000539779663, 'entity': {'tsz': '2025-01-09T16:00:00Z', 'id': 10}}, {'id': 9, 'distance': 0.9759000539779663, 'entity': {'tsz': '2025-01-08T16:00:00Z', 'id': 9}}, {'id': 8, 'distance': 0.9759000539779663, 'entity': {'tsz': '2025-01-07T16:00:00Z', 'id': 8}}, {'id': 7, 'distance': 0.9759000539779663, 'entity': {'tsz': '2025-01-06T16:00:00Z', 'id': 7}}, {'id': 6, 'distance': 0.9759000539779663, 'entity': {'tsz': '2025-01-05T16:00:00Z', 'id': 6}}]]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

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

<TabItem value='javascript'>

```javascript
const expr = "tsz > ISO '2025-01-05T00:00:00+08:00'";
const results = await client.search({
  collection_name,
  data=[[0.1, 0.2, 0.3, 0.4]], // Query vector (must match collection's vector dim)
  filter: expr,
  output_fields: ["id", "tsz"],
  limit: 5
});

console.log(results);
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \      
    --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search \      
    --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \      
    --header 'Content-Type: application/json' \      
    --header "Request-Timeout: 10" \
    --data '{        "collectionName": "timestamptz_test123",        "data": [[0.1, 0.2, 0.3, 0.4]],        "limit": 5,        "filter": "tsz > ISO '\''2025-01-05T00:00:00+08:00'\''",        "outputFields": ["id", "tsz"]      }'
```

</TabItem>
</Tabs>

```c++
std::string filter = "tsz > ISO '2025-01-05T00:00:00+08:00'";
std::vector<float> query_vector = {0.1, 0.2, 0.3, 0.4};
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

<Admonition type="info" icon="📘" title="注意">

collection に 2 つ以上の vector フィールドがある場合、タイムスタンプフィルタリングと組み合わせた hybrid search 操作を実行できます。詳細は [Multi-Vector Hybrid Search](./hybrid-search) を参照してください。

</Admonition>

## 高度な使用方法\{#advanced-usage}

高度な使用方法として、異なるレベル（たとえば database、collection、query）で timezone を管理したり、index を使用して `TIMESTAMPTZ` フィールドのクエリを高速化したりできます。

### 異なるレベルでタイムゾーンを管理する\{#manage-time-zones-at-different-levels}

`TIMESTAMPTZ` フィールドのタイムゾーンは、**collection** レベルまたは **query/search** レベルで制御できます。

| Level | Parameter | Scope | Priority |
| --- | --- | --- | --- |
| Collection | `timezone` | その collection に対して database のデフォルトタイムゾーン設定を上書きします | Medium |
| Query/search/hybrid search | `timezone` | 特定の 1 回の操作に対する一時的な上書き | Highest |

ステップごとの手順とコードサンプルについては、以下の専用ページを参照してください。

- [Collection の変更](./modify-collections#example-7-set-collection-time-zone)

- [クエリ](./get-and-scalar-query#temporarily-set-a-timezone-for-a-query)

- [基本 vector 検索](./single-vector-search#temporarily-set-a-timezone-for-a-search)

- [Multi-Vector Hybrid Search](./hybrid-search)

### クエリを高速化する\{#accelerate-queries}

デフォルトでは、index のない `TIMESTAMPTZ` フィールドに対するクエリはすべての行をフルスキャンするため、大規模データセットでは低速になる可能性があります。タイムスタンプクエリを高速化するには、`TIMESTAMPTZ` フィールドに AUTOINDEX index を作成してください。

詳細は [STL_SORT](./slt-sort-index-type) を参照してください。
