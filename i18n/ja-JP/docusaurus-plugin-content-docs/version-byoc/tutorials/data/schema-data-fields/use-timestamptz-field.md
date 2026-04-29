---
title: "TIMESTAMPTZ フィールド | BYOC"
slug: /use-timestamptz-field
sidebar_key: use-timestamptz-field
sidebar_label: "TIMSTAMPTZ"
beta: FALSE
notebook: FALSE
description: "e コマースシステム、コラボレーションツール、分散ログ記録など、リージョン間で時間を追跡するアプリケーションでは、タイムゾーン付きのタイムスタンプを正確に処理する必要があります。Zilliz Cloud の `TIMESTAMPTZ` データ型は、関連するタイムゾーンとともにタイムスタンプを保存することで、この機能を提供します。| BYOC"
type: origin
token: RxUiwJ77WiFKZGkC8rEcLeopnTf
sidebar_position: 12
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - スキーマ
  - タイムスタンプフィールド
  - タイムゾーン

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TIMESTAMPTZ フィールド

eコマースシステム、コラボレーションツール、分散型ロギングなど、複数の地域にわたって時刻を追跡するアプリケーションでは、タイムゾーン付きのタイムスタンプを正確に扱う必要があります。Zilliz Cloud の `TIMESTAMPTZ` データ型は、タイムゾーン情報を含むタイムスタンプを格納することで、この要件に対応します。

## TIMESTAMPTZ フィールドとは？\{#what-is-a-timestamptz-field}

`TIMESTAMPTZ` フィールドは、Zilliz Cloud におけるスキーマ定義済みのデータ型（`データType.TIMESTAMPTZ`）であり、タイムゾーンを考慮した入力を処理し、すべての時刻を内部的に UTC の絶対時刻として格納します。

- **許容される入力形式**: `TIMESTAMPTZ` フィールドは [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 互換のタイムスタンプ文字列を受け入れます。例:

    - `"2024-12-31 22:00:00"`

    - `"2024-12-31T22:00:00"`

    - `"2024-12-31T22:00:00+08:00"`

    - `"2024-12-31T22:00:00Z"`

- **タイムスタンプのパースルール**: タイムスタンプの解釈方法は、入力文字列に明示的にタイムゾーンが指定されているかどうかにより異なります。

    - 入力にタイムゾーンオフセット（例: **+08:00** や **Z**）が含まれている場合、その値は絶対時刻として扱われます。

    - 入力にタイムゾーンオフセットが含まれていない場合、コレクションに設定されたタイムゾーンに基づいて解釈されます。たとえば、コレクションのタイムゾーンが **Asia/Shanghai** の場合:

        - `"2024-12-31 22:00:00"` は **2024-12-31T22:00:00+08:00** として解釈されます。

        - `"2024-12-31T22:00:00"` は **2024-12-31T22:00:00Z** として解釈され、これは **2025-01-01T06:00:00+08:00** に相当します。

- **内部ストレージ**: すべての `TIMESTAMPTZ` 値は正規化され、[協定世界時](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)（UTC）で格納されます。

- **比較とフィルタリング**: `TIMESTAMPTZ` フィールドに対するすべての比較・フィルタリング・並べ替え操作は、UTC 正規化後の値に対して実行されるため、異なるタイムゾーン間でも一貫した動作が保証されます。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p><code>TIMESTAMPTZ</code> フィールドには <code>nullable=True</code> を設定して、欠損値を許容できます。</p></li>
<li><p><a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601</a> 形式で <code>default_value</code> 属性を使用してデフォルトのタイムスタンプ値を指定できます。</p></li>
</ul>
<p>詳細については、<a href="./nullable-fields">NULL許容 & デフォルト値</a>を参照してください。</p>

</Admonition>

## 基本的な操作\{#basic-operations}

`TIMESTAMPTZ` フィールドの基本的なワークフローは、Zilliz Cloud の他のスカラーフィールドと同様です：フィールドを定義 → データを挿入 → クエリ／フィルタリング。

### ステップ 1: TIMESTAMPTZ フィールドを定義する\{#step-1-define-a-timestamptz-field}

`TIMESTAMPTZ` フィールドを使用するには、コレクション作成時にスキーマ内で明示的に定義する必要があります。以下の例では、`データType.TIMESTAMPTZ` 型の `tsz` フィールドを持つコレクションを作成する方法を示しています。

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

<TabItem value='java'>

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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create \
     --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
     --header 'Content-Type: application/json' \
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

### Step 2: Insert data\{#step-2-insert-data}

タイムゾーンオフセット付きの ISO 8601 文字列を含むエンティティを挿入します。

以下の例では、サンプルデータの 8,193 行をコレクションに挿入します。各行には以下が含まれます：

- ユニークな ID

- タイムゾーン情報を含むタイムスタンプ（上海時間）

- 単純な 4 次元ベクトル

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

<TabItem value='java'>

```javascript
const dataSize = 10;

const formatDateWithTimezone = (year, month, day, hour, minute, second, timezoneOffset = '+08:00') => {
const monthStr = String(month).padStart(2, '0');
const dayStr = String(day).padStart(2, '0');
const hourStr = String(hour).padStart(2, '0');
const minuteStr = String(minute).padStart(2, '0');
const secondStr = String(second).padStart(2, '0');
return \`${year}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:${secondStr}${timezoneOffset}\`;
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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \      --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert \      --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \      --header 'Content-Type: application/json' \      --data '{        "collectionName": "timestamptz_test123",        "data": [          { "id": 1, "tsz": "2026-01-14T19:50:00Z", "vec": [0.1, 0.2, 0.3, 0.4] },          { "id": 2, "tsz": "2026-01-14T12:00:00+08:00", "vec": [0.5, 0.6, 0.7, 0.8] },          { "id": 3, "vec": [0.9, 0.0, 0.1, 0.2] }        ]      }'
```

</TabItem>
</Tabs>

### ステップ 3: フィルタリング操作\{#step-3-filtering-operations}

`TIMESTAMPTZ` はスカラー比較、間隔演算、および時間コンポーネントの抽出をサポートしています。

`TIMESTAMPTZ` フィールドに対してフィルタリング操作を実行する前に、以下の点を確認してください。

- 各ベクターフィールドにインデックスを作成済みであること。

- コレクションがメモリにロード済みであること。

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

<TabItem value='java'>

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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \      --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/load \      --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \      --header 'Content-Type: application/json' \      --data '{ "collectionName": "timestamptz_test123" }'
```

</TabItem>
</Tabs>

</details>

#### タイムスタンプフィルタリングによるクエリ\{#query-with-timestamp-filtering}

`==`、`!=`、`<`、`>`、`<=`、`>=` のような算術演算子を使用します。Zilliz Cloud で利用可能な算術演算子の完全なリストについては、[算術演算子](./basic-filtering-operators#arithmetic-operators) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>連鎖範囲式（例: <code>lower_bound &lt; tsz &lt; upper_bound</code>）はサポートされていません。</p>
<p>代わりに論理積を使用してください: <code>tsz &gt; lower_bound AND tsz &lt; upper_bound</code>。</p>

</Admonition>

以下の例では、タイムスタンプ（`tsz`）が **2025-01-03T00:00:00+08:00** と等しくないエンティティをフィルタリングします:

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

<TabItem value='java'>

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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
     --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/query \
     --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
     --header 'Content-Type: application/json' \
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

- `tsz` はスキーマで定義された `TIMESTAMPTZ` フィールド名です。

- `ISO '2025-01-03T00:00:00+08:00'` はタイムゾーンオフセットを含む [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 形式のタイムスタンプリテラルです。

- `!=` はフィールド値とそのリテラルを比較します。その他のサポートされている演算子には、`==`、`<`、`<=`、`>`、`>=` があります。

#### Interval operations\{#interval-operations}

[ISO 8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations) の **INTERVAL** 値を使用して、`TIMESTAMPTZ` フィールドに対して算術演算を実行できます。これにより、データをフィルタリングする際に、日数、時間、分などの期間をタイムスタンプに加算または減算できます。

たとえば、次のクエリは、タイムスタンプ（`tsz`）にゼロ日を加算した値が **2025-01-03T00:00:00+08:00** と**等しくない**エンティティをフィルタリングします：

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

<TabItem value='java'>

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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \      --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/query \      --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \      --header 'Content-Type: application/json' \      --data '{        "collectionName": "timestamptz_test123",        "filter": "tsz + INTERVAL '\''P0D'\'' != ISO '\''2025-01-03T00:00:00+08:00'\''",        "outputFields": ["id", "tsz"],        "limit": 10      }'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p><code>INTERVAL</code> 値は <a href="https://www.w3.org/TR/xmlschema-2/#duration">ISO 8601 duration 構文</a> に従います。例:</p>
<ul>
<li><p><code>P1D</code> → 1 日</p></li>
<li><p><code>PT3H</code> → 3 時間</p></li>
<li><p><code>P2DT6H</code> → 2 日と 6 時間</p></li>
</ul>
<p>フィルター式内で直接 <code>INTERVAL</code> 演算を使用できます。例:</p>
<ul>
<li><p><code>tsz + INTERVAL 'P3D'</code> → 3 日を加算</p></li>
<li><p><code>tsz - INTERVAL 'PT2H'</code> → 2 時間を減算</p></li>
</ul>

</Admonition>

#### タイムスタンプによるフィルタリングを伴う検索\{#search-with-timestamp-filtering}

`TIMESTAMPTZ` フィルタリングとベクトル類似性検索を組み合わせて、時間と類似性の両方で結果を絞り込むことができます。

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

<TabItem value='java'>

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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \      --url YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search \      --header 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \      --header 'Content-Type: application/json' \      --data '{        "collectionName": "timestamptz_test123",        "data": [[0.1, 0.2, 0.3, 0.4]],        "limit": 5,        "filter": "tsz > ISO '\''2025-01-05T00:00:00+08:00'\''",        "outputFields": ["id", "tsz"]      }'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>コレクションに 2 つ以上のベクトルフィールドがある場合、タイムスタンプフィルタリングを用いたハイブリッド検索操作を実行できます。詳細については、<a href="./hybrid-search">Multi-Vector Hybrid Search</a> を参照してください。</p>

</Admonition>

## 高度な使い方\{#advanced-usage}

高度な使い方として、異なるレベル（例：データベース、コレクション、またはクエリ）でタイムゾーンを管理したり、インデックスを使用して `TIMESTAMPTZ` フィールドに対するクエリの高速化を行ったりできます。

### 異なるレベルでのタイムゾーンの管理\{#manage-time-zones-at-different-levels}

**コレクション**レベルまたは**クエリ/検索**レベルで `TIMESTAMPTZ` フィールドのタイムゾーンを制御できます。

<table>
   <tr>
     <th><p>レベル</p></th>
     <th><p>パラメータ</p></th>
     <th><p>スコープ</p></th>
     <th><p>優先度</p></th>
   </tr>
   <tr>
     <td><p>Collection</p></td>
     <td><p><code>timezone</code></p></td>
     <td><p>そのコレクションに対してデータベースのデフォルトタイムゾーン設定を上書きします</p></td>
     <td><p>中</p></td>
   </tr>
   <tr>
     <td><p>クエリ/検索/ハイブリッド検索</p></td>
     <td><p><code>timezone</code></p></td>
     <td><p>特定の 1 つの操作に対する一時的な上書き</p></td>
     <td><p>最高</p></td>
   </tr>
</table>

手順とコードサンプルの詳細については、以下の専用ページを参照してください：

- [Modify Collection](./modify-collections#example-7-set-collection-time-zone)

- [Query](./get-and-scalar-query#temporarily-set-a-timezone-for-a-query)

- [Basic Vector Search](./single-vector-search#temporarily-set-a-timezone-for-a-search)

- [Multi-Vector Hybrid Search](./hybrid-search)

### クエリの高速化\{#accelerate-queries}

デフォルトでは、インデックスのない `TIMESTAMPTZ` フィールドに対するクエリはすべての行のフルスキャンを実行するため、大規模なデータセットでは遅くなる可能性があります。タイムスタンプクエリを高速化するには、`TIMESTAMPTZ` フィールドに AUTOINDEX インデックスを作成してください。

詳細については、[Index Scalar Fields](./index-scalar-fields) を参照してください。