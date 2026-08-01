---
title: "默认值 | Cloud"
slug: /default-fields
sidebar_label: "默认值"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持为标量字段（不包括主字段）设置默认值。字段配置默认值后，如果插入数据时未提供该字段的值，Zilliz Cloud 会自动使用配置的默认值。 | Cloud"
type: origin
token: PH1hwciixiXnF5kd0z2cVzxDnzh
sidebar_position: 16
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 默认值

Zilliz Cloud 支持为标量字段（不包括主字段）设置默认值。字段配置默认值后，如果插入数据时未提供该字段的值，Zilliz Cloud 会自动使用配置的默认值。

默认值可以保留其他数据库系统中的既有默认值设置，从而简化数据迁移到 Zilliz Cloud 的过程。对于插入时暂时无法确定取值的字段，您也可以使用默认值。

## 限制\{#limits}

- 只有标量字段支持默认值。主字段和向量字段不能配置默认值。

- `JSON` 和 `ARRAY` 字段不支持默认值。

- 默认值只能在创建 Collection 时配置，创建后不能修改。

## 设置默认值\{#set-default-values}

创建 Collection 时，在 `add_field()` 中使用 `default_value` 参数为字段定义默认值。

以下示例创建一个 Collection，其中两个标量字段配置了默认值：`age` 的默认值为 `18`，`status` 的默认值为 `"active"`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri='YOUR_CLUSTER_ENDPOINT')

# Define collection schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_schema=True,
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

import java.util.ArrayList;
import java.util.List;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

String collectionName = "my_collection";

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
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
});

const collectionName = 'my_collection';

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
  index_params: {
    field_name: 'vector',
    index_type: 'AUTOINDEX',
    metric_type: 'L2',
  },
});
```

</TabItem>

<TabItem value='go'>

```go
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal(err)
}
defer client.Close(ctx)

collectionName := "my_collection"

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

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

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

## 插入 Entity\{#insert-entities}

插入数据时，如果省略已配置默认值的字段，或显式将该字段设为 `NULL`，Zilliz Cloud 会自动使用配置的默认值。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;

import java.util.ArrayList;
import java.util.List;

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
```

</TabItem>

<TabItem value='javascript'>

```javascript
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
```

</TabItem>

<TabItem value='go'>

```go
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
```

</TabItem>
</Tabs>

## 使用默认值进行搜索和查询\{#search-and-query-with-default-values}

包含默认值的 Entity 在向量搜索和标量过滤中的行为与其他 Entity 相同。您可以在搜索和查询操作中按默认值进行过滤。

以下示例搜索 `age` 等于默认值 `18` 的 Entity：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
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

<TabItem value='go'>

```go
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

<summary>预期输出</summary>

```plaintext
Output:
Search results (age == 18):
  id: 2, age: 18, status: active
  id: 4, age: 18, status: inactive
```

</details>

您也可以直接匹配默认值来查询 Entity：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
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

<TabItem value='go'>

```go
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

<summary>预期输出</summary>

```plaintext
Query results (age == 18):
  id: 2, age: 18, status: active
  id: 4, age: 18, status: inactive

Query results (status == 'active'):
  id: 2, age: 18, status: active
  id: 3, age: 25, status: active
```

</details>

## 适用规则\{#applicable-rules}

如果字段同时配置了 `nullable` 和 `default_value`，以下规则决定 Zilliz Cloud 在插入时如何处理 `NULL` 输入或缺失字段值。

| Nullable | Default Value | 用户输入 | 结果 |
| --- | --- | --- | --- |
| ✅ | ✅（非 `NULL`） | `NULL` 或省略 | 使用默认值 |
| ✅ | ❌ | `NULL` 或省略 | 存储为 `NULL` |
| ❌ | ✅（非 `NULL`） | `NULL` 或省略 | 使用默认值 |
| ❌ | ❌ | `NULL` 或省略 | 抛出错误 |
| ❌ | ✅（`NULL`） | `NULL` 或省略 | 抛出错误 |

关键结论：

- 当字段具有非 `NULL` 默认值时，无论是否启用 `nullable`，都会使用该默认值。

- 当 `nullable=True` 但未设置默认值时，字段存储为 `NULL`。

- 当 `nullable=False` 且未设置默认值时，插入失败并报错。

- 在非可空字段上设置 `NULL` 默认值无效，并会导致错误。

