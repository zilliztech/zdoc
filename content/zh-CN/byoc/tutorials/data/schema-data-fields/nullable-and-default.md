---
title: "Nullable 和默认值 | BYOC"
slug: /nullable-and-default
sidebar_label: "Nullable 和默认值"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持为除主键字段以外的其他标量字段设置 nullable 属性（`nullable`）和默认值（`defaultvalue`）。对于被标记为 `nullable=True` 的字段，您可以在插入数据时省略该字段，或直接将字段值指定为空值，系统会将其视为空值而不会报错；当字段设置了默认值时，如果插入数据时未指定该字段的值，系统会自动使用默认值。 | BYOC"
type: origin
token: BdZswOSRyiVxWakbGbCceGminNC
sidebar_position: 14
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - 标量字段
  - 默认值
  - 可以为空
  - nullable
  - default value

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nullable 和默认值

Zilliz Cloud 支持为除主键字段以外的其他标量字段设置 nullable 属性（`nullable`）和默认值（`default_value`）。对于被标记为 `nullable=True` 的字段，您可以在插入数据时省略该字段，或直接将字段值指定为空值，系统会将其视为空值而不会报错；当字段设置了默认值时，如果插入数据时未指定该字段的值，系统会自动使用默认值。

默认值和 nullable 属性简化了从其他数据库系统向 Zilliz Cloud  的数据迁移，允许处理包含空值的数据集，同时保持原有的默认值设置。在创建 collection 时，对于值不确定的字段，您也可以选择启用 nullable 属性或设置默认值。

## 使用限制\{#limits}

- 仅支持为除主键列以外的其他标量字段设置默认值和 nullable 属性。

- 不支持为 JSON 或 Array 字段设置默认值。

- 当前仅支持在创建 collection 时为字段设置默认值或 nullable 属性。collection 创建完成后将无法修改相关配置。

- 开启了 nullable 属性的标量字段不能作为分组字段（`group_by_field`）用于  [Grouping Search](./grouping-search)。

- 设置为 nullable 的字段不支持用作 Partition Key。关于 Partition Key 的更多内容，可以参考 [使用 Partition Key](./use-partition-key)。

- 对开启了 nullable 属性的标量字段创建索引时，空值将不参与索引创建。

- JSON 和 ARRAY 字段：当使用 `IS NULL` 或 `IS NOT NULL` 操作符过滤 JSON 或 ARRAY 字段时，这些操作符是字段级别的操作符，意味着仅用于判断整个 JSON 或 ARRAY 字段是否为 Null。当 JSON 字段中某个鍵的值为 Null 时，该字段所在 Entity 不会被包含在 `IS NULL` 的过滤结果中。更多详情，可参考 [基本操作符](./basic-filtering-operators)。

## Nullable 属性\{#nullable-attribute}

Nullable 属性允许您在 collection 中存储空值。这为处理未知数据提供了灵活性。

### 设置 nullable 属性\{#set-the-nullable-attribute}

在创建 collection 时，通过设置 `nullable=True` 来定义 nullable 列（默认为 `False`）。以下示例创建了名为 `user_profiles_null` 的 collection，并将 `age` 字段设置为 nullable 列。

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
schema.add_field(field_name="age", datatype=DataType.INT64, nullable=True) # Nullable field

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

import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
        
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        .isNullable(true)
        .build());

List<IndexParam> indexes = new ArrayList<>();
Map<String,Object> extraParams = new HashMap<>();

indexes.add(IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createCollection({
  collection_name: "my_collection",
  schema: [
    {
      name: "id",
      is_primary_key: true,
      data_type: DataType.int64,
    },
    { name: "vector", data_type: DataType.Int64, dim: 5 },

    { name: "age", data_type: DataType.FloatVector, nullable: true },
  ],

  index_params: [
    {
      index_name: "vector_inde",
      field_name: "vector",
      metric_type: MetricType.L2,
      index_type: IndexType.AUTOINDEX,
    },
  ],
});

```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "localhost:19530"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
).WithField(entity.NewField().
    WithName("age").
    WithDataType(entity.FieldTypeInt64).
    WithNullable(true),
)

indexOption := milvusclient.NewCreateIndexOption("my_collection", "vector",
    index.NewAutoIndex(index.MetricType(entity.L2)))

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export pkField='{
    "fieldName": "id",
    "dataType": "Int64",
    "isPrimary": true
}'

export vectorField='{
    "fieldName": "vector",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 5
    }
}'

export nullField='{
    "fieldName": "age",
    "dataType": "Int64",
    "nullable": true
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $pkField,
        $vectorField,
        $nullField
    ]
}"

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "L2",
            "indexType": "AUTOINDEX"
        }
    ]'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

### 插入数据\{#insert-entities}

当您向一个允许为空的字段中中插入数据时，可以为可空列提供空值或直接省略该字段：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30},
    {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6], "age": None},
    {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7]}
]

client.insert(collection_name="my_collection", data=data)
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
rows.add(gson.fromJson("{\"id\": 1, \"vector\": [0.1, 0.2, 0.3, 0.4, 0.5], \"age\": 30}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 2, \"vector\": [0.2, 0.3, 0.4, 0.5, 0.6], \"age\": null}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 3, \"vector\": [0.3, 0.4, 0.5, 0.6, 0.7]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  { id: 1, vector: [0.1, 0.2, 0.3, 0.4, 0.5], age: 30 },
  { id: 2, vector: [0.2, 0.3, 0.4, 0.5, 0.6], age: null },
  { id: 3, vector: [0.3, 0.4, 0.5, 0.6, 0.7] },
];

client.insert({
  collection_name: "my_collection",
  data: data,
});

```

</TabItem>

<TabItem value='go'>

```go
column, _ := column.NewNullableColumnInt64("age",
    []int64{30},
    []bool{true, false, false})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("id", []int64{1, 2, 3}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
        {0.2, 0.3, 0.4, 0.5, 0.6},
        {0.3, 0.4, 0.5, 0.6, 0.7},
    }).
    WithColumns(column),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30},
        {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6], "age": null}, 
        {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7]} 
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

### 搜索查询处理\{#search-and-query-with-null-values}

在使用 `search` 方法时，如果插入的数据中某个字段的值为空值，搜索结果中对应的字段也会返回空值。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.4, 0.3, 0.128]],
    limit=2,
    search_params={"params": {"nprobe": 16}},
    output_fields=["id", "age"]
)

print(res)

# Output
# data: ["[{'id': 1, 'distance': 0.15838398039340973, 'entity': {'age': 30, 'id': 1}}, {'id': 2, 'distance': 0.28278401494026184, 'entity': {'age': None, 'id': 2}}]"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

Map<String,Object> params = new HashMap<>();
params.put("nprobe", 16);
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("vector")
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f})))
        .topK(2)
        .searchParams(params)
        .outputFields(Arrays.asList("id", "age"))
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={id=1, age=30}, score=0.0, id=1), SearchResp.SearchResult(entity={id=2, age=null}, score=0.050000004, id=2)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_collection',
    data: [0.3, -0.6, 0.1, 0.3, 0.5],
    limit: 2,
    output_fields: ['age', 'id'],
    params: {
        nprobe: 16
    }
});
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.1, 0.2, 0.4, 0.3, 0.128}

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 16)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    2,                    // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector").
    WithAnnParam(annParam).
    WithOutputFields("id", "age"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("age: ", resultSet.GetColumn("age").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.1, -0.2, 0.3, 0.4, 0.5]
    ],
    "annsField": "vector",
    "limit": 2,
    "outputFields": ["id", "age"]
}'

#{"code":0,"cost":0,"data":[{"age":30,"distance":0.16000001,"id":1},{"age":null,"distance":0.28999996,"id":2}]}
```

</TabItem>
</Tabs>

在使用 `query` 方法进行标量过滤时，null 值的过滤结果都为 false，即不会被选出：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Reviewing previously inserted data:
# {"id": 1, "vector": [0.1, 0.2, ..., 0.128], "age": 30}
# {"id": 2, "vector": [0.2, 0.3, ..., 0.129], "age": None}
# {"id": 3, "vector": [0.3, 0.4, ..., 0.130], "age": None}  # Omitted age  column is treated as None

results = client.query(
    collection_name="my_collection",
    filter="age >= 0",
    output_fields=["id", "age"]
)

# Example output:
# [
#     {"id": 1, "age": 30}
# ]
# Note: Entities with `age` as `null` (id 2 and 3) will not appear in the result.
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("age >= 0")
        .outputFields(Arrays.asList("id", "age"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={id=1, age=30})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await client.query(
    collection_name: "my_collection",
    filter: "age >= 0",
    output_fields: ["id", "age"]
);
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("age >= 0").
    WithOutputFields("id", "age"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("id: ", resultSet.GetColumn("id").FieldData().GetScalars())
fmt.Println("age: ", resultSet.GetColumn("age").FieldData().GetScalars())
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": "age >= 0",
    "outputFields": ["id", "age"]
}'

# {"code":0,"cost":0,"data":[{"age":30,"id":1}]}
```

</TabItem>
</Tabs>

如果希望查询包含 null 值的记录，可以使用空表达式 `""`：

<Admonition type="info" icon="📘" title="说明">

<p>当 <code>query</code> 请求不携带过滤表达式时会返回 Collection 中的所有 Entity，也包括所有为 Null 的 Entity。您也可以使用 <code>limit</code> 参数来指定需要返回的 Entity 数量。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
null_results = client.query(
    collection_name="my_collection",
    filter="",     # Query without any filtering condition
    output_fields=["id", "age"],
    limit=10
)

# Example output:
# [{"id": 2, "age": None}, {"id": 3, "age": None}]
```

</TabItem>

<TabItem value='java'>

```java
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("")
        .outputFields(Arrays.asList("id", "age"))
        .limit(10)
        .build());

System.out.println(resp.getQueryResults());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await client.query(
    collection_name: "my_collection",
    filter: "",
    output_fields: ["id", "age"],
    limit: 10
);
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("").
    WithLimit(10).
    WithOutputFields("id", "age"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("id: ", resultSet.GetColumn("id"))
fmt.Println("age: ", resultSet.GetColumn("age"))
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "expr": "",
    "outputFields": ["id", "age"],
    "limit": 10
}'

# {"code":0,"cost":0,"data":[{"age":30,"id":1},{"age":null,"id":2},{"age":null,"id":3}]}
```

</TabItem>
</Tabs>

## 默认值\{#default-values}

默认值是指为标量字段指定的预设值。当插入数据时，如果您没有为设置了默认值的字段提供具体值，系统会自动使用这个预设的默认值。

### 设置默认值\{#set-default-values}

在创建 collection 时，通过设置 `default_value` 参数来定义字段的默认值。以下示例展示了如何为标量列 `age` 设置默认值 `10`，`status` 列设置默认值 `active`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_schema=True,
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)
schema.add_field(field_name="age", datatype=DataType.INT64, default_value=18)
schema.add_field(field_name="status", datatype=DataType.VARCHAR, default_value="active", max_length=10)

index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_type="AUTOINDEX", metric_type="L2")

client.create_collection(collection_name="my_collection", schema=schema, index_params=index_params)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

import java.util.*;

CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        .defaultValue(18L)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("status")
        .dataType(DataType.VarChar)
        .maxLength(10)
        .defaultValue("active")
        .build());

List<IndexParam> indexes = new ArrayList<>();
Map<String,Object> extraParams = new HashMap<>();

indexes.add(IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createCollection({
  collection_name: "my_collection",
  schema: [
    {
      name: "id",
      is_primary_key: true,
      data_type: DataType.int64,
    },
    { name: "vector", data_type: DataType.FloatVector, dim: 5 },
    { name: "age", data_type: DataType.Int64, default_value: 18 },
    { name: 'status', data_type: DataType.VarChar, max_length: 30, default_value: 'active'},
  ],

  index_params: [
    {
      index_name: "vector_inde",
      field_name: "vector",
      metric_type: MetricType.L2,
      index_type: IndexType.AUTOINDEX,
    },
  ],
});

```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "localhost:19530"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
).WithField(entity.NewField().
    WithName("age").
    WithDataType(entity.FieldTypeInt64).
    WithDefaultValueLong(18),
).WithField(entity.NewField().
    WithName("status").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(10).
    WithDefaultValueString("active"),
)

indexOption := milvusclient.NewCreateIndexOption("my_collection", "vector",
    index.NewAutoIndex(index.MetricType(entity.L2)))

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export pkField='{
    "fieldName": "id",
    "dataType": "Int64",
    "isPrimary": true
}'

export vectorField='{
    "fieldName": "vector",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 5
    }
}'

export defaultValueField1='{
    "fieldName": "age",
    "dataType": "Int64",
    "defaultValue": 18
}'

export defaultValueField2='{
    "fieldName": "status",
    "dataType": "VarChar",
    "defaultValue": "active",
    "elementTypeParams": {
        "max_length": 10
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $pkField,
        $vectorField,
        $defaultValueField1,
        $defaultValueField2
    ]
}"

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "L2",
            "indexType": "AUTOINDEX"
        }
    ]'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

### 插入数据\{#insert-entities}

插入数据时，如果省略了设置了默认值的字段，或设置了默认值的字段值为 null，系统会自动使用默认值。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"id": 1, "vector": [0.1, 0.2, ..., 0.128], "age": 30, "status": "premium"},
    {"id": 2, "vector": [0.2, 0.3, ..., 0.129]},  # `age` and `status` use default values
    {"id": 3, "vector": [0.3, 0.4, ..., 0.130], "age": 25, "status": None},  # `status` uses default value
    {"id": 4, "vector": [0.4, 0.5, ..., 0.131], "age": None, "status": "inactive"}  # `age` uses default value
]

client.insert(collection_name="my_collection", data=data)
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
rows.add(gson.fromJson("{\"id\": 1, \"vector\": [0.1, 0.2, 0.3, 0.4, 0.5], \"age\": 30, \"status\": \"premium\"}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 2, \"vector\": [0.2, 0.3, 0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 3, \"vector\": [0.3, 0.4, 0.5, 0.6, 0.7], \"age\": 25, \"status\": null}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 4, \"vector\": [0.4, 0.5, 0.6, 0.7, 0.8], \"age\": null, \"status\": \"inactive\"}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30, "status": "premium"},
    {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6]}, 
    {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7], "age": 25, "status": null}, 
    {"id": 4, "vector": [0.4, 0.5, 0.6, 0.7, 0.8], "age": null, "status": "inactive"}  
];

client.insert({
  collection_name: "my_collection",
  data: data,
});
```

</TabItem>

<TabItem value='go'>

```go
column1, _ := column.NewNullableColumnInt64("age",
    []int64{30, 25},
    []bool{true, false, true, false})
column2, _ := column.NewNullableColumnVarChar("status",
    []string{"premium", "inactive"},
    []bool{true, false, false, true})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("id", []int64{1, 2, 3, 4}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
        {0.2, 0.3, 0.4, 0.5, 0.6},
        {0.3, 0.4, 0.5, 0.6, 0.7},
        {0.4, 0.5, 0.6, 0.7, 0.8},
    }).
    WithColumns(column1, column2),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30, "status": "premium"},
        {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6]},
        {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7], "age": 25, "status": null}, 
        {"id": 4, "vector": [0.4, 0.5, 0.6, 0.7, 0.8], "age": null, "status": "inactive"}      
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="说明">

<p>有关更多默认值和 nullable 属性组合使用的生效规则，请参阅<a href="./nullable-and-default">生效规则</a>。</p>

</Admonition>

### 搜索查询处理\{#search-and-query-with-default-values}

默认值在搜索（search）和查询（query）时的处理方式与普通值相同。您可以在 `search` 和 `query` 操作中查询使用了默认值的记录。

在 `search` 操作中，使用默认值的记录会正常参与向量搜索和标量过滤。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.4, 0.3, 0.5]],
    search_params={"params": {"nprobe": 16}},
    filter="age == 18",  # 18 is the default value of the `age` field
    limit=10,
    output_fields=["id", "age", "status"]
)

print(res)

# Output
# data: ["[{'id': 2, 'distance': 0.050000004, 'entity': {'id': 2, 'age': 18, 'status': 'active'}}, {'id': 4, 'distance': 0.45000002, 'entity': {'id': 4, 'age': 18, 'status': 'inactive'}}]"] 

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

Map<String,Object> params = new HashMap<>();
params.put("nprobe", 16);
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("vector")
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f})))
        .searchParams(params)
        .filter("age == 18")
        .topK(10)
        .outputFields(Arrays.asList("id", "age", "status"))
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={id=2, age=18, status=active}, score=0.050000004, id=2), SearchResp.SearchResult(entity={id=4, age=18, status=inactive}, score=0.45000002, id=4)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_collection',
    data: [0.3, -0.6, 0.1, 0.3, 0.5],
    limit: 2,
    output_fields: ['age', 'id', 'status'],
    filter: 'age == 18',
    params: {
        nprobe: 16
    }
});
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.1, 0.2, 0.4, 0.3, 0.5}

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 16)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    10,              // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector").
    WithFilter("age == 18").
    WithAnnParam(annParam).
    WithOutputFields("id", "age", "status"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("age: ", resultSet.GetColumn("age").FieldData().GetScalars())
    fmt.Println("status: ", resultSet.GetColumn("status").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.1, 0.2, 0.3, 0.4, 0.5]
    ],
    "annsField": "vector",
    "limit": 10,
    "filter": "age == 18",
    "outputFields": ["id", "age", "status"]
}'

# {"code":0,"cost":0,"data":[{"age":18,"distance":0.050000004,"id":2,"status":"active"},{"age":18,"distance":0.45000002,"id":4,"status":"inactive"}]}
```

</TabItem>
</Tabs>

在 `query` 操作中，可以直接使用默认值进行精确匹配或范围查询。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query all entities where `age` equals the default value (18)
default_age_results = client.query(
    collection_name="my_collection",
    filter="age == 18",
    output_fields=["id", "age", "status"]
)

# Query all entities where `status` equals the default value ("active")
default_status_results = client.query(
    collection_name="my_collection",
    filter='status == "active"',
    output_fields=["id", "age", "status"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

QueryResp ageResp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("age == 18")
        .outputFields(Arrays.asList("id", "age", "status"))
        .build());

System.out.println(ageResp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={id=2, age=18, status=active}), QueryResp.QueryResult(entity={id=4, age=18, status=inactive})]

QueryResp statusResp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("status == \"active\"")
        .outputFields(Arrays.asList("id", "age", "status"))
        .build());

System.out.println(statusResp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={id=2, age=18, status=active}), QueryResp.QueryResult(entity={id=3, age=25, status=active})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Query all entities where `age` equals the default value (18)
const default_age_results = await client.query(
    collection_name: "my_collection",
    filter: "age == 18",
    output_fields: ["id", "age", "status"]
);
// Query all entities where `status` equals the default value ("active")
const default_status_results = await client.query(
    collection_name: "my_collection",
    filter: 'status == "active"',
    output_fields: ["id", "age", "status"]
)
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("age == 18").
    WithOutputFields("id", "age", "status"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("id: ", resultSet.GetColumn("id").FieldData().GetScalars())
fmt.Println("age: ", resultSet.GetColumn("age").FieldData().GetScalars())
fmt.Println("status: ", resultSet.GetColumn("status").FieldData().GetScalars())

resultSet, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("status == \"active\"").
    WithOutputFields("id", "age", "status"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("id: ", resultSet.GetColumn("id").FieldData().GetScalars())
fmt.Println("age: ", resultSet.GetColumn("age").FieldData().GetScalars())
fmt.Println("status: ", resultSet.GetColumn("status").FieldData().GetScalars())
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": "age == 18",
    "outputFields": ["id", "age", "status"]
}'

# {"code":0,"cost":0,"data":[{"age":18,"id":2,"status":"active"},{"age":18,"id":4,"status":"inactive"}]}

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": "status == \"active\"",
    "outputFields": ["id", "age", "status"]
}'

# {"code":0,"cost":0,"data":[{"age":18,"id":2,"status":"active"},{"age":25,"id":3,"status":"active"}]}
```

</TabItem>
</Tabs>

## 生效规则\{#applicable-rules}

下表总结了 nullable 列和默认值在不同配置组合下的行为规则。这些规则决定了当您试图插入空值或未提供字段值时，系统如何处理数据。

<table>
   <tr>
     <th><p>是否可空</p></th>
     <th><p>是否有默认值</p></th>
     <th><p>默认值</p></th>
     <th><p>用户输入</p></th>
     <th><p>结果</p></th>
     <th><p>示例</p></th>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>非 null</p></td>
     <td><p>None/null</p></td>
     <td><p>使用默认值</p></td>
     <td><p>字段：<code>age</code></p><p>默认值：<code>18</code></p><p>输入：null</p><p>结果：实际存储 <code>18</code></p></td>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>-</p></td>
     <td><p>None/null</p></td>
     <td><p>存储为 null</p></td>
     <td><p>字段：<code>middle_name</code></p><p>默认值：-</p><p>输入：null</p><p>结果：实际存储 null</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>非 null</p></td>
     <td><p>None/null</p></td>
     <td><p>使用默认值</p></td>
     <td><p>字段：<code>status</code></p><p>默认值：<code>"active"</code></p><p>输入：null</p><p>结果：实际存储 <code>"active"</code></p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>-</p></td>
     <td><p>None/null</p></td>
     <td><p>报错</p></td>
     <td><p>字段：<code>email</code></p><p>默认值：-</p><p>输入：null</p><p>结果：操作被拒绝，系统报错</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>null</p></td>
     <td><p>None/null</p></td>
     <td><p>报错</p></td>
     <td><p>字段：<code>username</code></p><p>默认值：null</p><p>输入：null</p><p>结果：操作被拒绝，系统报错</p></td>
   </tr>
</table>

