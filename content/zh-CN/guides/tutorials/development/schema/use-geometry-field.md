---
title: "Geometry 类型 | Cloud"
slug: /use-geometry-field
sidebar_label: "Geometry 类型"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在构建地理信息系统 (GIS)、地图工具或基于位置的服务 (LBS) 等应用时，通常需要存储和查询几何数据。 | Cloud"
type: origin
token: IMamwu8Qyiaad2kbkJjc7p9Snag
sidebar_position: 12
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Geometry 类型

在构建地理信息系统 (GIS)、地图工具或基于位置的服务 (LBS) 等应用时，通常需要存储和查询几何数据。

Milvus 中的 `GEOMETRY` 数据类型为此提供了解决方案，使您能够以原生方式存储和查询灵活的几何数据。

当您需要将向量相似度与空间约束结合使用时，请使用 `GEOMETRY` 字段，例如：

- **位置服务 (LBS)**：在同一街区内查找相似的兴趣点（POI）

- **多模态搜索**：检索距离指定点 1 公里范围内的相似照片

- **地图与物流**：查找区域内的资产或路径相交的路线

<Admonition type="info" icon="📘" title="说明">

要使用 GEOMETRY 类型，请将您的 SDK 升级至最新版本。

</Admonition>

## 什么是 GEOMETRY 字段\{#what-is-a-geometry-field}

**GEOMETRY** 字段是 Zilliz Cloud 中一种由 Schema 定义的数据类型（`DataType.GEOMETRY`），用于存储几何数据。

在使用几何字段时，您将通过 [Well-Known Text (WKT)](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) 格式与数据交互。WKT 是一种可读性强的文本格式，可用于插入与查询几何数据。Zilliz Cloud 在内部会将 WKT 转换为 [Well-Known Binary (WKB)](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry#Well-known_binary) 格式，以实现高效的存储与处理，但您无需直接操作 WKB。

`GEOMETRY` 数据类型支持以下几何对象：

- **POINT**：`POINT (x y)`，例如 `POINT (13.403683 52.520711)`，其中 `x` 表示经度，`y` 表示纬度。

- **LINESTRING**：`LINESTRING (x1 y1, x2 y2, …)`，例如 `LINESTRING (13.40 52.52, 13.41 52.51)`。

- **POLYGON**：`POLYGON ((x1 y1, x2 y2, x3 y3, x1 y1))`，例如 `POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))`。

- **MULTIPOINT**：`MULTIPOINT ((x1 y1), (x2 y2), …)`，例如 `MULTIPOINT ((10 40), (40 30), (20 20), (30 10))`。

- **MULTILINESTRING**：`MULTILINESTRING ((x1 y1, …), (xk yk, …))`，例如 `MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))`。

- **MULTIPOLYGON**：`MULTIPOLYGON (((outer ring ...)), ((outer ring ...)))`，例如 `MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))`。

- **GEOMETRYCOLLECTION**：`GEOMETRYCOLLECTION(POINT(x y), LINESTRING(x1 y1, x2 y2), …)`，例如 `GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40), POLYGON ((40 40, 20 45, 45 30, 40 40)))`。

## 基础操作\{#basic-operations}

使用 GEOMETRY 字段的基本流程包括：在 Collection 的 Schema 中定义字段、插入几何数据，以及通过特定的过滤表达式查询数据。

### 步骤 1：定义 GEOMETRY 字段\{#step-1-define-a-geometry-field}

要使用 `GEOMETRY` 字段，需在创建 Collection 时在 Schema 中显式定义该字段。以下示例展示了如何创建一个包含类型为 `DataType.GEOMETRY` 的几何字段的 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType
import numpy as np

dim = 8
collection_name = "geo_collection"
milvus_client = MilvusClient("YOUR_CLUSTER_ENDPOINT")

# Create schema with a GEOMETRY field
schema = milvus_client.create_schema(enable_dynamic_field=True)
schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("embeddings", DataType.FLOAT_VECTOR, dim=dim)
# highlight-next-line
schema.add_field("geo", DataType.GEOMETRY, nullable=True)
schema.add_field("name", DataType.VARCHAR, max_length=128)

milvus_client.create_collection(collection_name, schema=schema, consistency_level="Strong")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;

private static final String COLLECTION_NAME = "geo_collection";
private static final Integer DIM = 128;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());
        
CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(true)
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("embeddings")
        .dataType(DataType.FloatVector)
        .dimension(DIM)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("geo")
        .dataType(DataType.Geometry)
        .isNullable(true)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("name")
        .dataType(DataType.VarChar)
        .maxLength(128)
        .build());
        
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .collectionSchema(collectionSchema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient('YOUR_CLUSTER_ENDPOINT');
const schema = [
  { name: 'id', data_type: DataType.Int64, is_primary_key: true },
  { name: 'embeddings', data_type: DataType.FloatVector, dim: 8 },
  // highlight-next-line
  { name: 'geo', data_type: DataType.Geometry, is_nullable: true },
  { name: 'name', data_type: DataType.VarChar, max_length: 128 },
];

await milvusClient.createCollection({
  collection_name: 'geo_collection',
  fields: schema,
  consistency_level: 'Strong',
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
# Configuration
export CLUSTER_ENDPOINT="http://10.100.32.69:19530"
export TOKEN="YOUR_CLUSTER_TOKEN"
COLLECTION_NAME="geo_collection"

echo "=== 1. Create a collection with a GEOMETRY field ==="
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"schema\": {
      \"enableDynamicField\": true,
      \"fields\": [
        {
          \"fieldName\": \"id\",
          \"dataType\": \"Int64\",
          \"isPrimary\": true
        },
        {
          \"fieldName\": \"embeddings\",
          \"dataType\": \"FloatVector\",
          \"elementTypeParams\": {
            \"dim\": \"8\"
          }
        },
        {
          \"fieldName\": \"geo\",
          \"dataType\": \"Geometry\",
          \"nullable\": true
        },
        {
          \"fieldName\": \"name\",
          \"dataType\": \"VarChar\",
          \"elementTypeParams\": {
            \"max_length\": \"128\"
          }
        }
      ]
    }
  }"

```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="说明">

在此示例中，Collection 的 Schema 中定义的 GEOMETRY 字段允许空值（`nullable=True`）。有关详细信息，请参考 [Nullable 和默认值](./nullable-fields)。

</Admonition>

### 步骤 2：插入数据\{#step-2-insert-data}

以 [WKT](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) 格式插入包含几何数据的实体。以下示例展示了插入多个地理点（geo points）的方法：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
rng = np.random.default_rng(seed=19530)
geo_points = [
    'POINT(13.399710 52.518010)',
    'POINT(13.403934 52.522877)',
    'POINT(13.405088 52.521124)',
    'POINT(13.408223 52.516876)',
    'POINT(13.400092 52.521507)',
    'POINT(13.408529 52.519274)',
]

rows = [
    {"id": 1, "name": "Shop A", "embeddings": rng.random((1, dim))[0], "geo": geo_points[0]},
    {"id": 2, "name": "Shop B", "embeddings": rng.random((1, dim))[0], "geo": geo_points[1]},
    {"id": 3, "name": "Shop C", "embeddings": rng.random((1, dim))[0], "geo": geo_points[2]},
    {"id": 4, "name": "Shop D", "embeddings": rng.random((1, dim))[0], "geo": geo_points[3]},
    {"id": 5, "name": "Shop E", "embeddings": rng.random((1, dim))[0], "geo": geo_points[4]},
    {"id": 6, "name": "Shop F", "embeddings": rng.random((1, dim))[0], "geo": geo_points[5]},
]

insert_result = milvus_client.insert(collection_name, rows)
print(insert_result)

# Expected output:
# {'insert_count': 6, 'ids': [1, 2, 3, 4, 5, 6]}
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;

List<String> geoPoints = Arrays.asList(
        "POINT(13.399710 52.518010)",
        "POINT(13.403934 52.522877)",
        "POINT(13.405088 52.521124)",
        "POINT(13.408223 52.516876)",
        "POINT(13.400092 52.521507)",
        "POINT(13.408529 52.519274)"
);
List<String> names = Arrays.asList("Shop A", "Shop B", "Shop C", "Shop D", "Shop E", "Shop F");
Random ran = new Random();
Gson gson = new Gson();
List<JsonObject> rows = new ArrayList<>();
for (int i = 0; i < geoPoints.size(); i++) {
    JsonObject row = new JsonObject();
    row.addProperty("id", i);
    row.addProperty("geo", geoPoints.get(i));
    row.addProperty("name", names.get(i));
    List<Float> vector = new ArrayList<>();
    for (int d = 0; d < DIM; ++d) {
        vector.add(ran.nextFloat());
    }
    row.add("embeddings", gson.toJsonTree(vector));
    rows.add(row);
}

client.insert(InsertReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const geo_points = [
    'POINT(13.399710 52.518010)',
    'POINT(13.403934 52.522877)',
    'POINT(13.405088 52.521124)',
    'POINT(13.408223 52.516876)',
    'POINT(13.400092 52.521507)',
    'POINT(13.408529 52.519274)',
];

const rows = [
    {"id": 1, "name": "Shop A", "embeddings": [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8], "geo": geo_points[0]},
    {"id": 2, "name": "Shop B", "embeddings": [0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9], "geo": geo_points[1]},
    {"id": 3, "name": "Shop C", "embeddings": [0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0], "geo": geo_points[2]},
    {"id": 4, "name": "Shop D", "embeddings": [0.4,0.5,0.6,0.7,0.8,0.9,1.0,0.1], "geo": geo_points[3]},
    {"id": 5, "name": "Shop E", "embeddings": [0.5,0.6,0.7,0.8,0.9,1.0,0.1,0.2], "geo": geo_points[4]},
    {"id": 6, "name": "Shop F", "embeddings": [0.6,0.7,0.8,0.9,1.0,0.1,0.2,0.3], "geo": geo_points[5]},
];

const insert_result = await milvusClient.insert({
  collection_name: 'geo_collection',
  data: rows,
});
console.log(insert_result);
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
echo -e "\n\n=== 2. Insert geometric data ==="
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [
      {
        \"id\": 1,
        \"name\": \"Shop A\",
        \"embeddings\": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
        \"geo\": \"POINT(13.399710 52.518010)\"
      },
      {
        \"id\": 2,
        \"name\": \"Shop B\",
        \"embeddings\": [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
        \"geo\": \"POINT(13.403934 52.522877)\"
      },
      {
        \"id\": 3,
        \"name\": \"Shop C\",
        \"embeddings\": [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1],
        \"geo\": \"POINT(13.405088 52.521124)\"
      },
      {
        \"id\": 4,
        \"name\": \"Shop D\",
        \"embeddings\": [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2],
        \"geo\": \"POINT(13.408223 52.516876)\"
      },
      {
        \"id\": 5,
        \"name\": \"Shop E\",
        \"embeddings\": [0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3],
        \"geo\": \"POINT(13.400092 52.521507)\"
      },
      {
        \"id\": 6,
        \"name\": \"Shop F\",
        \"embeddings\": [0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4],
        \"geo\": \"POINT(13.408529 52.519274)\"
      }
    ]
  }"
```

</TabItem>
</Tabs>

### 步骤 3：过滤操作\{#step-3-filtering-operations}

在对 GEOMETRY 字段执行过滤操作之前，请确保：

- 已为每个向量字段创建索引。

- Collection 已加载到内存中。

<details>

<summary>显示代码</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = milvus_client.prepare_index_params()
index_params.add_index(field_name="embeddings", metric_type="L2")

milvus_client.create_index(collection_name, index_params)
milvus_client.load_collection(collection_name)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(IndexParam.builder()
        .fieldName("embeddings")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());
client.createIndex(CreateIndexReq.builder()
        .collectionName(COLLECTION_NAME)
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = {
  field_name: "embeddings",
  index_type: "IVF_FLAT",
  metric_type: "L2",
  params: { nlist: 128 },
};

await milvusClient.createIndex({
  collection_name: 'geo_collection',
  index_name: 'embeddings_index',
  index_params: index_params,
});

await milvusClient.loadCollection({
  collection_name: 'geo_collection',
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
echo -e "\n\n=== 3. Create Index ==="
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"indexParams\": [
      {
        \"fieldName\": \"embeddings\",
        \"metricType\": \"L2\",
        \"indexName\": \"embeddings_index\"
      }
    ]
  }"

echo -e "\n\n=== 4. Load Collection ==="
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\"
  }"

# Wait for loading to complete
sleep 3
```

</TabItem>
</Tabs>

</details>

当满足以上条件后，你就可以使用以下表达式，根据 GEOMETRY 字段中的值对 Collection 进行过滤。

#### 定义过滤表达式\{#define-filter-expressions}

要在 **GEOMETRY** 字段上进行过滤，请使用几何专用运算符，表达式格式如下：`"{operator}(geo_field,'{wkt}')"`

其中：

- `{operator}`：表示支持的几何运算符（例如 `ST_CONTAINS`、`ST_INTERSECTS`）。完整运算符列表请参阅 [Geometry 操作符](./geometry-operators)。

- `geo_field`：表示在 Collection 的 Schema 中定义的 `GEOMETRY` 字段名。

- `{wkt}`：表示用于过滤的几何对象的 WKT 字符串。

<Admonition type="info" icon="📘" title="说明">

某些运算符（如 `ST_DWITHIN`）可能需要额外的参数。有关各运算符的详细说明和使用示例，请参阅 [Geometry 操作符](./geometry-operators)。

</Admonition>

以下示例展示了如何在过滤表达式中使用不同的几何运算符：

#### 示例 1： 查找位于矩形区域内的数据\{#example-1-find-entities-within-a-rectangular-area}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
top_left_lon, top_left_lat = 13.403683, 52.520711
bottom_right_lon, bottom_right_lat = 13.455868, 52.495862
bounding_box_wkt = f"POLYGON(({top_left_lon} {top_left_lat}, {bottom_right_lon} {top_left_lat}, {bottom_right_lon} {bottom_right_lat}, {top_left_lon} {bottom_right_lat}, {top_left_lon} {top_left_lat}))"

query_results = milvus_client.query(
    collection_name,
    # highlight-next-line
    filter=f"st_within(geo, '{bounding_box_wkt}')",
    output_fields=["name", "geo"]
)
for ret in query_results:
    print(ret)
    
# Expected output:
# {'name': 'Shop D', 'geo': 'POINT (13.408223 52.516876)', 'id': 4}
# {'name': 'Shop F', 'geo': 'POINT (13.408529 52.519274)', 'id': 6}
# {'name': 'Shop A', 'geo': 'POINT (13.39971 52.51801)', 'id': 1}
# {'name': 'Shop B', 'geo': 'POINT (13.403934 52.522877)', 'id': 2}
# {'name': 'Shop C', 'geo': 'POINT (13.405088 52.521124)', 'id': 3}
# {'name': 'Shop D', 'geo': 'POINT (13.408223 52.516876)', 'id': 4}
# {'name': 'Shop E', 'geo': 'POINT (13.400092 52.521507)', 'id': 5}
# {'name': 'Shop F', 'geo': 'POINT (13.408529 52.519274)', 'id': 6}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

float topLeftLon = 13.403683f;
float topLeftLat = 52.520711f;
float bottomRightLon = 13.455868f;
float bottomRightLat = 52.495862f;
String boundingBoxWkt = String.format("POLYGON((%f %f, %f %f, %f %f, %f %f, %f %f))",
        topLeftLon, topLeftLat, bottomRightLon, topLeftLat, bottomRightLon, bottomRightLat,
        topLeftLon, bottomRightLat, topLeftLon, topLeftLat);

String filter = String.format("st_within(geo, '%s')", boundingBoxWkt);
QueryResp queryResp = client.query(QueryReq.builder()
        .collectionName(COLLECTION_NAME)
        .filter(filter)
        .outputFields(Arrays.asList("name", "geo"))
        .build());
List<QueryResp.QueryResult> queryResults = queryResp.getQueryResults();
System.out.println("Query results:");
for (QueryResp.QueryResult result : queryResults) {
    System.out.println(result.getEntity());
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const top_left_lon = 13.403683;
const top_left_lat = 52.520711;
const bottom_right_lon = 13.455868;
const bottom_right_lat = 52.495862;
const bounding_box_wkt = `POLYGON((${top_left_lon} ${top_left_lat}, ${bottom_right_lon} ${top_left_lat}, ${bottom_right_lon} ${bottom_right_lat}, ${top_left_lon} ${bottom_right_lat}, ${top_left_lon} ${top_left_lat}))`;

const query_results = await milvusClient.query({
  collection_name: 'geo_collection',
  // highlight-next-line
  filter: `st_within(geo, '${bounding_box_wkt}')`,
  output_fields: ['name', 'geo'],
});
for (const ret of query_results.data) {
    console.log(ret);
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
echo -e "\n\n=== 5. Query geometric objects within a rectangular area ==="
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"st_within(geo, 'POLYGON((13.403683 52.520711, 13.455868 52.520711, 13.455868 52.495862, 13.403683 52.495862, 13.403683 52.520711))')\",
    \"outputFields\": [\"id\", \"name\", \"geo\"]
  }"
```

</TabItem>
</Tabs>

#### 示例 2： 查找距离中心点 1 公里范围内的数据\{#example-2-find-entities-within-1km-of-a-central-point}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
center_point_lon, center_point_lat = 13.403683, 52.520711
radius_meters = 1000.0
central_point_wkt = f"POINT({center_point_lon} {center_point_lat})"

query_results = milvus_client.query(
    collection_name,
    # highlight-next-line
    filter=f"st_dwithin(geo, '{central_point_wkt}', {radius_meters})",
    output_fields=["name", "geo"]
)
for ret in query_results:
    print(ret)
    
# Expected output:
# hit: {'id': 4, 'distance': 0.9823770523071289, 'entity': {'name': 'Shop D', 'geo': 'POINT (13.408223 52.516876)'}}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

float centerPointLon = 13.403683f;
float centerPointLat = 52.520711f;
float radiusMeters = 1000.0f;
String centralPointWkt = String.format("POINT(%f %f)", centerPointLon, centerPointLat);
String filter=String.format("st_dwithin(geo, '%s', %f)", centralPointWkt, radiusMeters);
QueryResp queryResp = client.query(QueryReq.builder()
        .collectionName(COLLECTION_NAME)
        .filter(filter)
        .outputFields(Arrays.asList("name", "geo"))
        .build());
List<QueryResp.QueryResult> queryResults = queryResp.getQueryResults();
System.out.println("Query results:");
for (QueryResp.QueryResult result : queryResults) {
    System.out.println(result.getEntity());
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const center_point_lon = 13.403683;
const center_point_lat = 52.520711;
const radius_meters = 1000.0;
const central_point_wkt = `POINT(${center_point_lon} ${center_point_lat})`;

const query_results_dwithin = await milvusClient.query({
  collection_name: 'geo_collection',
  // highlight-next-line
  filter: `st_dwithin(geo, '${central_point_wkt}', ${radius_meters})`,
  output_fields: ['name', 'geo'],
});
for (const ret of query_results_dwithin.data) {
    console.log(ret);
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
echo -e "\n\n=== 6. Query geometric objects within a specified distance ==="
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"st_dwithin(geo, 'POINT(13.403683 52.520711)', 1000.0)\",
    \"outputFields\": [\"name\", \"geo\"]
  }"
```

</TabItem>
</Tabs>

#### 示例 3： 将向量相似度与空间过滤条件结合使用\{#example-3-combine-vector-similarity-with-a-spatial-filter}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
vectors_to_search = rng.random((1, dim))
result = milvus_client.search(
    collection_name,
    vectors_to_search,
    limit=3,
    output_fields=["name", "geo"],
    # highlight-next-line
    filter=f"st_within(geo, '{bounding_box_wkt}')"
)
for hits in result:
    for hit in hits:
        print(f"hit: {hit}")
        
# Expected output:
# hit: {'id': 6, 'distance': 1.3406795263290405, 'entity': {'name': 'Shop F', 'geo': 'POINT (13.408529 52.519274)'}}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

Random ran = new Random();
List<Float> vector = new ArrayList<>();
for (int d = 0; d < DIM; ++d) {
    vector.add(ran.nextFloat());
}
String filter=String.format("st_within(geo, '%s')", boundingBoxWkt);
SearchReq request = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new FloatVec(vector)))
        .limit(3)
        .filter(filter)
        .outputFields(Arrays.asList("name", "geo"))
        .build();
SearchResp statusR = client.search(request);
List<List<SearchResp.SearchResult>> searchResults = statusR.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.printf("ID: %d, Score: %f, %s\n", (long)result.getId(), result.getScore(), result.getEntity().toString());
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const vectors_to_search = [[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]];
const search_results = await milvusClient.search({
  collection_name: "geo_collection",
  vectors: vectors_to_search,
  limit: 3,
  output_fields: ["name", "geo"],
  // highlight-next-line
  filter: `st_within(geo, '${bounding_box_wkt}')`,
});
for (const hits of search_results.results) {
  for (const hit of hits) {
    console.log(`hit: ${JSON.stringify(hit)}`);
  }
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# Define bounding box coordinates
TOP_LEFT_LON=13.403683
TOP_LEFT_LAT=52.520711
BOTTOM_RIGHT_LON=13.455868
BOTTOM_RIGHT_LAT=52.495862

# Construct WKT polygon
BOUNDING_BOX_WKT="POLYGON((${TOP_LEFT_LON} ${TOP_LEFT_LAT}, ${BOTTOM_RIGHT_LON} ${TOP_LEFT_LAT}, ${BOTTOM_RIGHT_LON} ${BOTTOM_RIGHT_LAT}, ${TOP_LEFT_LON} ${BOTTOM_RIGHT_LAT}, ${TOP_LEFT_LON} ${TOP_LEFT_LAT}))"

# Define query vector (MUST have 8 elements to match the collection's dimension: 8)
QUERY_VECTOR="[0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592, 0.1, 0.2, 0.3]"
echo -e "\n\n=== 7. Execute vector search with st_within filter (Geospatial + Vector Search) ==="
# Execute vector search with st_within filter (Geospatial + Vector Search)
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  --data "{
    \"collectionName\": \"geo_collection\",
    \"data\": [${QUERY_VECTOR}],
    \"annsField\": \"embeddings\",
    \"filter\": \"st_within(geo, '${BOUNDING_BOX_WKT}')\",
    \"limit\": 3,
    \"outputFields\": [\"name\", \"geo\"]
  }"
```

</TabItem>
</Tabs>

## 下一步：加速查询\{#next-accelerate-queries}

默认情况下，如果 **GEOMETRY** 字段未创建索引，查询将对所有行执行全表扫描，这在大规模数据集上可能较慢。

要加速几何查询，可在 GEOMETRY 字段上创建 **RTREE** 索引。

详细信息请参阅 [RTREE](./rtree-index-type)。

## 常见问题\{#faq}

### 如果我为 Collection 启用了 Dynamic Field 功能，是否可以将几何数据插入动态字段键？\{#If-Ive-enabled-the-dynamic-field-feature-for-my-collection-can-I-insert-geometric-data-into-a-dynamic-field-key}

不可以。几何数据不能插入动态字段。在插入几何数据之前，请确保已在 Collection 的 Schema 中显式定义 GEOMETRY 字段。

### GEOMETRY 字段是否支持 mmap 功能？\{#Does-the-GEOMETRY-field-support-the-mmap-feature}

支持。GEOMETRY 字段支持 mmap。更多信息请参阅[使用 mmap](./use-mmap)。

### GEOMETRY 字段是否可以设置为可空 (nullable) 或指定默认值？\{#Can-I-define-the-GEOMETRY-field-as-nullable-or-set-a-default-value}

可以。GEOMETRY 字段支持 nullable 属性，并可设置 WKT 格式 的默认值。更多信息请参考 [Nullable 和默认值](./nullable-fields)。