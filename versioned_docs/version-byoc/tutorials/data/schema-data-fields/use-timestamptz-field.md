---
title: "TIMESTAMPTZ Field | BYOC"
slug: /use-timestamptz-field
sidebar_key: use-timestamptz-field
sidebar_label: "TIMSTAMPTZ"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Applications that track time across regions, such as e-commerce systems, collaboration tools, or distributed logging, need precise handling of timestamps with time zones. The `TIMESTAMPTZ` data type in Zilliz Cloud provides this capability by storing timestamps with their associated time zone. | BYOC"
type: origin
token: RxUiwJ77WiFKZGkC8rEcLeopnTf
sidebar_position: 12
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - timestamp field
  - time zone

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

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>You can set <code>nullable=True</code> for <code>TIMESTAMPTZ</code> fields to allow missing values.</p></li>
<li><p>You can specify a default timestamp value using the <code>default_value</code> attribute in <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601</a> format.</p></li>
</ul>
<p>See <a href="./nullable-fields">Nullable & Default</a> for details.</p>

</Admonition>

## Basic operations\{#basic-operations}

The basic workflow of using a `TIMESTAMPTZ` field mirrors other scalar fields in Zilliz Cloud: define the field → insert data → query/filter.

### Step 1: Define a TIMESTAMPTZ field\{#step-1-define-a-timestamptz-field}

To use a `TIMESTAMPTZ` field, explicitly define it in your collection schema when creating the collection. The following example demonstrates how to create a collection with a `tsz` field of type `DataType.TIMESTAMPTZ`.

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

### Step 2: Insert data\{#step-2-insert-data}

Insert entities containing ISO 8601 strings with time zone offsets.

The example below inserts 8,193 rows of sample data into the collection. Each row includes:

- a unique ID

- a timezone-aware timestamp (Shanghai time)

- a simple 4-dimensional vector

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

### Step 3: Filtering operations\{#step-3-filtering-operations}

`TIMESTAMPTZ` supports scalar comparisons, interval arithmetic, and extraction of time components.

Before you can perform filtering operations on `TIMESTAMPTZ` fields, make sure:

- You have created an index on each vector field.

- The collection is loaded into memory.

<details>

<summary>Show example code</summary>

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

</details>

#### Query with timestamp filtering\{#query-with-timestamp-filtering}

Use arithmetic operators like `==`, `!=`, `<`, `>`, `<=`, `>=`. For a full list of arithmetic operators available in Zilliz Cloud, refer to [Arithmetic Operators](./basic-filtering-operators#arithmetic-operators).

<Admonition type="info" icon="📘" title="Notes">

<p>Chained range expressions (for example, <code>lower_bound &lt; tsz &lt; upper_bound</code>) are not supported.</p>
<p>Use logical conjunction instead: <code>tsz &gt; lower_bound AND tsz &lt; upper_bound</code>.</p>

</Admonition>

The example below filters entities with timestamps (`tsz`) that are not equal to **2025-01-03T00:00:00+08:00**:

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

In the example above,

- `tsz` is the `TIMESTAMPTZ` field name defined in the schema.

- `ISO '2025-01-03T00:00:00+08:00'` is a timestamp literal in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format, including its time-zone offset.

- `!=` compares the field value against that literal. Other supported operators include `==`, `<`, `<=`, `>`, and `>=`.

#### Interval operations\{#interval-operations}

You can perform arithmetic on `TIMESTAMPTZ` fields using **INTERVAL** values in the [ISO 8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations). This allows you to add or subtract durations, such as days, hours, or minutes, from a timestamp when filtering data.

For example, the following query filters entities where the timestamp (`tsz`) plus zero days is **not equal** to **2025-01-03T00:00:00+08:00**:

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

<Admonition type="info" icon="📘" title="Notes">

<p><code>INTERVAL</code> values follow the <a href="https://www.w3.org/TR/xmlschema-2/#duration">ISO 8601 duration syntax</a>. For example:</p>
<ul>
<li><p><code>P1D</code> → 1 day</p></li>
<li><p><code>PT3H</code> → 3 hours</p></li>
<li><p><code>P2DT6H</code> → 2 days and 6 hours</p></li>
</ul>
<p>You can use <code>INTERVAL</code> arithmetic directly in filter expressions, such as:</p>
<ul>
<li><p><code>tsz + INTERVAL 'P3D'</code> → Adds 3 days</p></li>
<li><p><code>tsz - INTERVAL 'PT2H'</code> → Subtracts 2 hours</p></li>
</ul>

</Admonition>

#### Search with timestamp filtering\{#search-with-timestamp-filtering}

You can combine `TIMESTAMPTZ` filtering with vector similarity search to narrow results by both time and similarity.

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

<Admonition type="info" icon="📘" title="Notes">

<p>If your collection has two or more vector fields, you can perform hybrid search operations with timestamp filtering. For details, refer to <a href="./hybrid-search">Multi-Vector Hybrid Search</a>.</p>

</Admonition>

## Advanced usage\{#advanced-usage}

For advanced usage, you can manage time zones at different levels (e.g. database, collection, or query) or accelerate queries on `TIMESTAMPTZ` fields using indexes.

### Manage time zones at different levels\{#manage-time-zones-at-different-levels}

You can control the time zone for `TIMESTAMPTZ` fields at the **collection** or **query/search** level.

<table>
   <tr>
     <th><p>Level</p></th>
     <th><p>Parameter</p></th>
     <th><p>Scope</p></th>
     <th><p>Priority</p></th>
   </tr>
   <tr>
     <td><p>Collection</p></td>
     <td><p><code>timezone</code></p></td>
     <td><p>Overrides the database default time zone setting for that collection</p></td>
     <td><p>Medium</p></td>
   </tr>
   <tr>
     <td><p>Query/search/hybrid search</p></td>
     <td><p><code>timezone</code></p></td>
     <td><p>Temporary overrides for one specific operation</p></td>
     <td><p>Highest</p></td>
   </tr>
</table>

For step-by-step instructions and code samples, refer to the dedicated pages:

- [Modify Collection](./modify-collections#example-7-set-collection-time-zone)

- [Query](./get-and-scalar-query#temporarily-set-a-timezone-for-a-query)

- [Basic Vector Search](./single-vector-search#temporarily-set-a-timezone-for-a-search)

- [Multi-Vector Hybrid Search](./hybrid-search)

### Accelerate queries\{#accelerate-queries}

By default, queries on `TIMESTAMPTZ` fields without an index will perform a full scan of all rows, which can be slow on large datasets. To accelerate timestamp queries, create an AUTOINDEX index on your `TIMESTAMPTZ` field.

For details, refer to [Index Scalar Fields](./index-scalar-fields).