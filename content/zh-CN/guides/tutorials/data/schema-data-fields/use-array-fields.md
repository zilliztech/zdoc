---
title: "Array 类型 | Cloud"
slug: /use-array-fields
sidebar_key: use-array-fields
sidebar_label: "Array 类型"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Array 类型的字段用于存放相同数据类型的一组元素。如下示例展示了如何使用 Array 类型的字段存放数据。 | Cloud"
type: origin
token: LKIuw8JSfice0ek9PvTc2GxXnZz
sidebar_position: 9
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - 标量字段
  - array 字段
  - array field
  - max_capacity
  - 最大容量
  - element_type
  - 元素类型

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Array 类型

Array 类型的字段用于存放相同数据类型的一组元素。如下示例展示了如何使用 Array 类型的字段存放数据。

```json
{
  "tags": ["pop", "rock", "classic"],
  "ratings": [5, 4, 3]
}
```

## 相关限制\{#}

- **默认值与空值**：Array 字段不支持设置默认值。但是您可以将 `nullable` 设置为 `True` 来允许元素为空值。具体可参考[Nullable 和默认值](./nullable-and-default)。

- **数据类型**：Array 字段内所有元素的数据类型必须相同。您可以通过设置 `element_type` 参数来指定元素的数据类型。如果您将 `element_type` 设置为 `VARCHAR`，您还需要为元素设置 `max_length` 参数来指定元素的最大长度。

- **Array 容量**：Array 字段中元素的数量需要小于或等于创建该字段时通过 `max_capacity` 定义的最大容量。该值的取值范围为 **1** 至 **4096**。

- **字符串处理**：当 Array 字段中的元素为字符串时，Milvus 会在搜索和查询时保持原样，不会进行转义操作。例如，`'a"b'`, `"a'b"`, `'a\'b'`, and `"a\"b"` 会原样存取，而 `'a'b'` and `"a"b"` 则会被当作非法字符串处理。

## 添加 Array 字段\{#add-array-field}

要在 Zilliz Cloud clusters 中使用 Array 字段，需要在定义 Collection Schema 时定义相关字段类型。这个过程包括：

1. 设置 `datatype` 为支持的 Array 数据类型，即 `ARRAY`。

1. 通过 `element_type` 参数，指定数组中元素的数据类型。该值可以是 Zilliz Cloud clusters 支持的任意标量数据类型，例如 `VARCHAR`、`INT64` 等。同一个 Array 中的所有元素必须是相同的数据类型。

1. 通过 `max_capacity` 参数，设置数组的最大容量，即数组中可以包含的最大元素数量。

以下是如何定义包含 Array 字段的 Collection Schema：

<Admonition type="info" icon="📘" title="说明">

如果您在定义 Schema 时将 `enabled_dynamic_fields` 设置为 `True`，您还可以在该 Collection 中插入 Schema 中未定义的字段。此操作可能会增加查询和管理的复杂性，并影响查询性能。更多详情，请参考 [Dynamic Field](./enable-dynamic-field)。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="tags", datatype=DataType.ARRAY, element_type=DataType.VARCHAR, max_capacity=10, max_length=100)
schema.add_field(field_name="ratings", datatype=DataType.ARRAY, element_type=DataType.INT64, max_capacity=5)
schema.add_field(field_name="pk", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=3)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
        
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("tags")
        .dataType(DataType.Array)
        .elementType(DataType.VarChar)
        .maxCapacity(10)
        .maxLength(100)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("ratings")
        .dataType(DataType.Array)
        .elementType(DataType.Int64)
        .maxCapacity(5)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("pk")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(3)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
const schema = [
  {
    name: "tags",
    data_type: DataType.Array,
    element_type: DataType.VarChar,
    max_capacity: 10,
    max_length: 100
  },
  {
    name: "rating",
    data_type: DataType.Array,
    element_type: DataType.Int64,
    max_capacity: 5,
  },
  {
    name: "pk",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "embedding",
    data_type: DataType.FloatVector,
    dim: 3,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export arrayField1='{
    "fieldName": "tags",
    "dataType": "Array",
    "elementDataType": "VarChar",
    "elementTypeParams": {
        "max_capacity": 10,
        "max_length": 100
    }
}'

export arrayField2='{
    "fieldName": "ratings",
    "dataType": "Array",
    "elementDataType": "Int64",
    "elementTypeParams": {
        "max_capacity": 5
    }
}'

export pkField='{
    "fieldName": "pk",
    "dataType": "Int64",
    "isPrimary": true
}'

export vectorField='{
    "fieldName": "embedding",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 3
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $arrayField1,
        $arrayField2,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

## 设置索引参数\{#set-index-params}

为 Array 字段设置索引参数是一个可选操作，可以显著提高查询效率。在 Zilliz Cloud clusters 中，为向量字段创建索引为必选操作。对于包括布尔和数值类型的标量字段而言，该操作为可选。

以下示例中，我们为 向量字段 `embedding` 和标量字段 `tags` 创建了 `AUTOINDEX` 索引类型，表示 Zilliz Cloud clusters 会自动根据数据类型创建合适的标量索引。有关更多信息，请参考 [AUTOINDEX](./autoindex-explained)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params

index_params = client.prepare_index_params()

# Index \`age\` with AUTOINDEX
index_params.add_index(
    field_name="tags",
    index_type="AUTOINDEX",
    index_name="tags_index"
)

# Index \`embedding\` with AUTOINDEX and specify similarity metric type
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",  # Use automatic indexing to simplify complex index settings
    metric_type="COSINE"  # Specify similarity metric type, options include L2, COSINE, or IP
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("tags")
        .indexName("tags_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());
        
indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
indexOpt1 := milvusclient.NewCreateIndexOption("my_collection", "tags", index.NewInvertedIndex())
indexOpt2 := milvusclient.NewCreateIndexOption("my_collection", "embedding", index.NewAutoIndex(entity.COSINE))
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    index_name: 'inverted_index',
    field_name: 'tags',
    index_type: IndexType.AUTOINDEX,
)];

indexParams.push({
    index_name: 'embedding_index',
    field_name: 'embedding',
    index_type: IndexType.AUTOINDEX,
});
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "tags",
            "indexName": "inverted_index",
            "indexType": "AUTOINDEX"
        },
        {
            "fieldName": "embedding",
            "metricType": "COSINE",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

## 创建 Collection\{#create-collection}

使用定义好的 Schema 和索引参数来创建 Collection：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
    WithIndexOptions(indexOpt1, indexOpt2))
if err != nil {
    fmt.Println(err.Error())
    // handler err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    index_params: indexParams
})
```

</TabItem>

<TabItem value='bash'>

```bash
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

## 插入数据\{#insert-data}

Collection 创建完成后，可以插入包含 Array 字段的数据。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample data
data = [
  {
      "tags": ["pop", "rock", "classic"],
      "ratings": [5, 4, 3],
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "tags": None,  # Entire ARRAY is null
      "ratings": [4, 5],
      "pk": 2,
      "embedding": [0.78, 0.91, 0.23]
  },
  {  # The tags field is completely missing
      "ratings": [9, 5],
      "pk": 3,
      "embedding": [0.18, 0.11, 0.23]
  }
]

client.insert(
    collection_name="my_collection",
    data=data
)
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
rows.add(gson.fromJson("{\"tags\": [\"pop\", \"rock\", \"classic\"], \"ratings\": [5, 4, 3], \"pk\": 1, \"embedding\": [0.12, 0.34, 0.56]}", JsonObject.class));
rows.add(gson.fromJson("{\"tags\": null, \"ratings\": [4, 5], \"pk\": 2, \"embedding\": [0.78, 0.91, 0.23]}", JsonObject.class));
rows.add(gson.fromJson("{\"ratings\": [9, 5], \"pk\": 3, \"embedding\": [0.18, 0.11, 0.23]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
column1, _ := column.NewNullableColumnVarCharArray("tags",
    [][]string{{"pop", "rock", "classic"}},
    []bool{true, false, false})
column2, _ := column.NewNullableColumnInt64Array("ratings",
    [][]int64{{5, 4, 3}, {4, 5}, {9, 5}},
    []bool{true, true, true})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("pk", []int64{1, 2, 3}).
    WithFloatVectorColumn("embedding", 3, [][]float32{
        {0.12, 0.34, 0.56},
        {0.78, 0.91, 0.23},
        {0.18, 0.11, 0.23},
    }).WithColumns(column1, column2))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {
        "tags": ["pop", "rock", "classic"],
        "ratings": [5, 4, 3],
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    },
    {
        "tags": ["jazz", "blues"],
        "ratings": [4, 5],
        "pk": 2,
        "embedding": [0.78, 0.91, 0.23]
    },
    {
        "tags": ["electronic", "dance"],
        "ratings": [3, 3, 4],
        "pk": 3,
        "embedding": [0.67, 0.45, 0.89]
    }
];

client.insert({
  collection_name: "my_collection",
  data: data,
});
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
        {
        "tags": ["pop", "rock", "classic"],
        "ratings": [5, 4, 3],
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    },
    {
        "tags": ["jazz", "blues"],
        "ratings": [4, 5],
        "pk": 2,
        "embedding": [0.78, 0.91, 0.23]
    },
    {
        "tags": ["electronic", "dance"],
        "ratings": [3, 3, 4],
        "pk": 3,
        "embedding": [0.67, 0.45, 0.89]
    }       
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## 使用过滤表达式查询\{#query-with-filter-expressions}

在插入数据后，您可以使用 `query` 方法获取符合指定条件的所有 Entity。

如下示例演示了获取 `tags` 字段不为 null 的所有 Entity。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query to exclude entities where \`tags\` is not null

filter = 'tags IS NOT NULL'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["tags", "ratings", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'tags': ['pop', 'rock', 'classic'], 'ratings': [5, 4, 3], 'pk': 1}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "tags IS NOT NULL";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("tags", "ratings", "pk"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={ratings=[5, 4, 3], pk=1, tags=[pop, rock, classic]})]
```

</TabItem>

<TabItem value='go'>

```go
filter := "tags IS NOT NULL"
rs, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("tags", "ratings", "pk"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("pk", rs.GetColumn("pk").FieldData().GetScalars())
fmt.Println("tags", rs.GetColumn("tags").FieldData().GetScalars())
fmt.Println("ratings", rs.GetColumn("ratings").FieldData().GetScalars())
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_collection',
    filter: 'tags IS NOT NULL',
    output_fields: ['tags', 'ratings', 'embedding']
});
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
    "filter": "tags IS NOT NULL",
    "outputFields": ["tags", "ratings", "embedding"]
}'

```

</TabItem>
</Tabs>

如下示例演示了获取 `ratings` 字段第一个元素大于 4 的所有 Entity。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'ratings[0] > 4'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["tags", "ratings", "embedding"]
)

print(res)

# Example output:
# data: [
#     "{'tags': ['pop', 'rock', 'classic'], 'ratings': [5, 4, 3], 'embedding': [0.12, 0.34, 0.56], 'pk': 1}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ratings[0] > 4"

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("tags", "ratings", "pk"))
        .build());

System.out.println(resp.getQueryResults());

// Output
// [
//    QueryResp.QueryResult(entity={ratings=[5, 4, 3], pk=1, tags=[pop, rock, classic]}), 
//    QueryResp.QueryResult(entity={ratings=[9, 5], pk=3, tags=[]})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter = "ratings[0] > 4"
rs, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("tags", "ratings", "pk"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("pk", rs.GetColumn("pk"))
fmt.Println("tags", rs.GetColumn("tags"))
fmt.Println("ratings", rs.GetColumn("ratings"))
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
const filter = 'ratings[0] > 4';

const res = await client.query({
    collection_name:"my_collection",
    filter:filter,
    output_fields: ["tags", "ratings", "embedding"]
});

console.log(res)

// Example output:
// data: [
//     "{'tags': ['pop', 'rock', 'classic'], 'ratings': [5, 4, 3], 'embedding': [0.12, 0.34, 0.56], 'pk': 1}",
//     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
  "collectionName": "my_collection",
  "filter": "ratings[0] > 4",
  "outputFields": ["tags", "ratings", "embedding"]
}'
```

</TabItem>
</Tabs>

## 使用过滤表达式的向量查询\{#vector-search-with-filter-expressions}

除了简单的基于数值的过滤查询外，您还可以将向量相似性搜索和过滤表达式结合。如下示例演示了如何在向量搜索中添加过滤表达式。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'tags[0] == "pop"'

res = client.search(
    collection_name="my_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["tags", "ratings", "embedding"],
    filter=filter
)

print(res)

# Example output:
# data: [
#     "[{'id': 1, 'distance': -0.2479381263256073, 'entity': {'tags': ['pop', 'rock', 'classic'], 'ratings': [5, 4, 3], 'embedding': [0.11999999731779099, 0.3400000035762787, 0.5600000023841858]}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "tags[0] == \"pop\"";
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("tags", "ratings", "embedding"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={ratings=[5, 4, 3], embedding=[0.12, 0.34, 0.56], tags=[pop, rock, classic]}, score=-0.24793813, id=1)]]
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3, -0.6, 0.1}
filter = "tags[0] == \"pop\""

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 10)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithFilter(filter).
    WithOutputFields("tags", "ratings", "embedding").
    WithAnnParam(annParam))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("tags", resultSet.GetColumn("tags").FieldData().GetScalars())
    fmt.Println("ratings", resultSet.GetColumn("ratings").FieldData().GetScalars())
    fmt.Println("embedding", resultSet.GetColumn("embedding").FieldData().GetVectors())
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['tags', 'ratings', 'embdding'],
    filter: 'tags[0] == "pop"'
});
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
        [0.3, -0.6, 0.1]
    ],
    "annsField": "embedding",
    "limit": 5,
    "filter": "tags[0] == \"pop\"",
    "outputFields": ["tags", "ratings", "embedding"]
}'

# {"code":0,"cost":0,"data":[{"distance":-0.24793813,"embedding":[0.12,0.34,0.56],"id":1,"ratings":{"Data":{"LongData":{"data":[5,4,3]}}},"tags":{"Data":{"StringData":{"data":["pop","rock","classic"]}}}}]}
```

</TabItem>
</Tabs>

另外，Zilliz Cloud 还支持使用高级 Array 过滤操作符，包括 `ARRAY_CONTAINS`, `ARRAY_CONTAINS_ALL`, `ARRAY_CONTAINS_ANY` 和 `ARRAY_LENGTH`，可以进一步加强过滤能力。更多详情，可以参考 [ARRAY 操作符](./array-filtering-operators)。