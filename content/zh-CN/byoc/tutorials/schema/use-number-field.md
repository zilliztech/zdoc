---
title: "布尔与数值类型 | BYOC"
slug: /use-number-field
sidebar_label: "布尔与数值类型"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "布尔与数值类型的标量字段用于存放布尔值或标量数值。布尔值是指在两个可能的值中取一个，而标量数值则既可能是整数，也可能是小数。它们通常用来表示数量、度量值或其它需要进行逻辑或数学运算的数据。 | BYOC"
type: origin
token: Axmuw0uKmiIwdhk3pH9cGKThn5d
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 布尔与数值类型

布尔与数值类型的标量字段用于存放布尔值或标量数值。布尔值是指在两个可能的值中取一个，而标量数值则既可能是整数，也可能是小数。它们通常用来表示数量、度量值或其它需要进行逻辑或数学运算的数据。

如下表格描述了 Zilliz Cloud 支持的布尔与数值类数据类型。

| 数据类型 | 描述 |
| --- | --- |
| `BOOL` | 布尔类型，用于存储 `true` 或 `false`，适合描述二元状态，例如是否有效、是否有库存等。 |
| `INT8` | 8 位整数，适用于存储小范围的整数数据。 |
| `INT16` | 16 位整数，适用于存储中等范围的整数数据。 |
| `INT32` | 32 位整数，适合一般整型数据存储，如商品数量或用户 ID。 |
| `INT64` | 64 位整数，适合存储较大范围的数据，例如时间戳或标识符。 |
| `FLOAT` | 32 位浮点数，适用于一般精度的数值数据，如评分或温度。 |
| `DOUBLE` | 64 位双精度浮点数，适用于需要高精度的数据，如金融数据或科学计算。 |

如需定义一个布尔类型的字段，需要将 `datatype` 设置成 `BOOL`。如需定义一个数值类型的字段，则可以将 `datatype` 设置成上述支持的数值类型。例如，`DataType.INT64` 表示一个整数类型的字段，而 `DataType.FLOAT` 则表示一个小数类型的字段。

<Admonition type="info" icon="📘" title="说明">

Zilliz Cloud 允许布尔类型或数值类型的字段为空。您也可以为它们设置默认值。简单来说，您可以将字段的 `nullable` 设置为 `True` 来允许字段为空，并通过 `default_value` 为字段设置默认值，具体可以参考 [Nullable 和默认值](./nullable-fields)。

</Admonition>

## 添加布尔或数值字段\{#add-boolean-and-number-fields}

您可以在 Collection Schema 中字义布尔或数值类型的字段来存放相应类型的数据。在下方的示例中，Schema 中定义了如下字段：

- `age`：用于存放整数类型的数据，允许为空，默认值为 `18`。

- `broken`：用于存放布尔类型的数据，允许为空，无默认值。

- `height`：用于存放小数类型的数据，允许为空，无默认值。

<Admonition type="info" icon="📘" title="说明">

如果您在定义 Schema 时将 `enabled_dynamic_fields` 设置为 `True`，您还可以在该 Collection 中插入 Schema 中未定义的字段。此操作可能会增加查询和管理的复杂性，并影响查询性能。更多详情，请参考 [Dynamic Field](./enable-dynamic-field)。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Import necessary libraries
from pymilvus import MilvusClient, DataType

# Define server address
SERVER_ADDR = "YOUR_CLUSTER_ENDPOINT"

# Create a MilvusClient instance
client = MilvusClient(uri=SERVER_ADDR)

# Define the collection schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

# Add an INT64 field `age` that supports null values with default value 18
schema.add_field(field_name="age", datatype=DataType.INT64, nullable=True, default_value=18)
schema.add_field(field_name="broken", datatype=DataType.BOOL, nullable=True)
# Add a FLOAT field `price` that supports null values without default value
schema.add_field(field_name="price", datatype=DataType.FLOAT, nullable=True)
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
        .fieldName("age")
        .dataType(DataType.Int64)
        .isNullable(true)
        .defaultValue(18)
        .build());
        
schema.addField(AddFieldReq.builder()
        .fieldName("broken")
        .dataType(DataType.BOOL)
        .isNullable(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Float)
        .isNullable(true)
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
    name: "age",
    data_type: DataType.Int64,
  },
  {
    name: "broken",
    data_type: DataType.Bool,
  },
  {
    name: "price",
    data_type: DataType.Float,
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

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

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
    WithName("pk").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(3),
).WithField(entity.NewField().
    WithName("price").
    WithDataType(entity.FieldTypeFloat).
    WithNullable(true),
).WithField(entity.NewField().
    WithName("age").
    WithDataType(entity.FieldTypeInt64).
    WithNullable(true).
    WithDefaultValueLong(18),
).WithField(entity.NewField().
    WithName("broken").
    WithDataType(entity.FieldTypeBool).
    WithNullable(true),
```

</TabItem>

<TabItem value='bash'>

```bash
export int64Field='{
    "fieldName": "age",
    "dataType": "Int64"
}'

export boolField='{
    "fieldName": "broken",
    "dataType": "Bool"
}'

export floatField='{
    "fieldName": "price",
    "dataType": "Float"
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
        $int64Field,
        $boolField,
        $floatField,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

## 设置索引参数\{#set-index-params}

为标量数值字段设置索引参数可以提供查询和搜索效率。在 Zilliz Cloud clusters 中，为向量字段创建索引为必选操作。对于包括布尔和数值类型的标量字段而言，该操作为可选。

以下示例中，我们为向量字段 `embedding` 和 标量字段 `age` 创建了 `AUTOINDEX` 类型的索引，表示 Milvus 会自动根据数据类型创建合适的索引。有关更多信息，请参考 [AUTOINDEX](./autoindex-explained)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params

index_params = client.prepare_index_params()

# Index `age` with AUTOINDEX
index_params.add_index(
    field_name="age",
    index_type="AUTOINDEX",
    index_name="age_index"
)

# Index `embedding` with AUTOINDEX and specify similarity metric type
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
        .fieldName("age")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());
        
indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { IndexType } from "@zilliz/milvus2-sdk-node";
const indexParams = [
  {
    field_name: "age",
    index_name: "inverted_index",
    index_type: IndexType.AUTOINDEX,
  },
  {
    field_name: "embedding",
    metric_type: "COSINE",
    index_type: IndexType.AUTOINDEX,
  },
];
```

</TabItem>

<TabItem value='go'>

```go
indexOption1 := milvusclient.NewCreateIndexOption("my_collection", "embedding",
    index.NewAutoIndex(index.MetricType(entity.IP)))
indexOption2 := milvusclient.NewCreateIndexOption("my_collection", "age",
    index.NewInvertedIndex())
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "age",
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

定义好 Collection 的 Schema 和索引后，我们便可以创建包含标量字段的 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create Collection
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

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    index_params: indexParams
})
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption1, indexOption2))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
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

Collection 创建完成后，可以插入包含标量字段的数据。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample data
data = [
    {"age": 25, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"age": 30, "pk": 2, "embedding": [0.4, 0.5, 0.6]}, # `price` field is missing, which should be null
    {"age": None, "price": None, "pk": 3, "embedding": [0.2, 0.3, 0.1]},  # `age` should default to 18, `price` is null
    {"age": 45, "price": None, "pk": 4, "embedding": [0.9, 0.1, 0.4]},  # `price` is null
    {"age": None, "price": 59.99, "pk": 5, "embedding": [0.8, 0.5, 0.3]},  # `age` should default to 18
    {"age": 60, "price": None, "pk": 6, "embedding": [0.1, 0.6, 0.9]}  # `price` is null
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
rows.add(gson.fromJson("{\"age\": 25, \"price\": 99.99, \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 30, \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": null, \"price\": null, \"pk\": 3, \"embedding\": [0.2, 0.3, 0.1]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 45, \"price\": null, \"pk\": 4, \"embedding\": [0.9, 0.1, 0.4]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": null, \"price\": 59.99, \"pk\": 5, \"embedding\": [0.8, 0.5, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 60, \"price\": null, \"pk\": 6, \"embedding\": [0.1, 0.6, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  { age: 25, price: 99.99, pk: 1, embedding: [0.1, 0.2, 0.3] },
  { age: 30, price: 149.5, pk: 2, embedding: [0.4, 0.5, 0.6] },
  { age: 35, price: 199.99, pk: 3, embedding: [0.7, 0.8, 0.9] },
];

client.insert({
  collection_name: "my_collection",
  data: data,
});
```

</TabItem>

<TabItem value='go'>

```go
column1, _ := column.NewNullableColumnFloat("price",
    []float32{99.99, 59.99},
    []bool{true, false, false, false, true, false})
column2, _ := column.NewNullableColumnInt64("age",
    []int64{25, 30, 45, 60},
    []bool{true, true, false, true, false, true})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("pk", []int64{1, 2, 3, 4, 5, 6}).
    WithFloatVectorColumn("embedding", 3, [][]float32{
        {0.1, 0.2, 0.3},
        {0.4, 0.5, 0.6},
        {0.2, 0.3, 0.1},
        {0.9, 0.1, 0.4},
        {0.8, 0.5, 0.3},
        {0.1, 0.6, 0.9},
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
        {"age": 25, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
        {"age": 30, "price": 149.50, "pk": 2, "embedding": [0.4, 0.5, 0.6]},
        {"age": 35, "price": 199.99, "pk": 3, "embedding": [0.7, 0.8, 0.9]}       
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## 使用过滤表达式查询\{#query-with-filter-expressions}

在插入数据后，您可以使用 `query` 方法获取符合指定条件的所有 Entity。

如下示例演示了获取 `age` 字段大于 30 的所有 Entity。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'age > 30'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'age': 45, 'price': None, 'pk': 4}",
#     "{'age': 60, 'price': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "age > 30";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// Output
//
// [
//    QueryResp.QueryResult(entity={price=null, pk=4, age=45}), 
//    QueryResp.QueryResult(entity={price=null, pk=6, age=60})
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_collection',
    filter: 'age > 30',
    output_fields: ['age', 'price', 'pk']
});
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > 30"
queryResult, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("pk", queryResult.GetColumn("pk").FieldData().GetScalars())
fmt.Println("age", queryResult.GetColumn("age").FieldData().GetScalars())
fmt.Println("price", queryResult.GetColumn("price").FieldData().GetScalars())
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
    "filter": "age > 30",
    "outputFields": ["age","price", "pk"]
}'

## {"code":0,"cost":0,"data":[{"age":30,"pk":2,"price":149.5},{"age":35,"pk":3,"price":199.99}]}
```

</TabItem>
</Tabs>

如下示例演示了获取 `price` 字段为 null 的所有 Entity。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'price is null'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'age': 30, 'price': None, 'pk': 2}",
#     "{'age': 18, 'price': None, 'pk': 3}",
#     "{'age': 45, 'price': None, 'pk': 4}",
#     "{'age': 60, 'price': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "price is null";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// Output
// [
//    QueryResp.QueryResult(entity={price=null, pk=2, age=30}), 
//    QueryResp.QueryResult(entity={price=null, pk=3, age=18}), 
//    QueryResp.QueryResult(entity={price=null, pk=4, age=45}), 
//    QueryResp.QueryResult(entity={price=null, pk=6, age=60})
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
const filter = 'price is null';

const res = await client.query({
    collection_name:"my_collection",
    filter:filter,
    output_fields=["age", "price", "pk"]
});

console.log(res);

// Example output:
// data: [
//     "{'age': 18, 'price': None, 'pk': 3}",
//     "{'age': 18, 'price': 59.99, 'pk': 5}"
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter = "price is null"
queryResult, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
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
  "filter": "price is null",
  "outputFields": ["age", "price", "pk"]
}'
```

</TabItem>
</Tabs>

如需获取 `age` 字段为 `18` 的所有 Entity，可以参考如下示例。由于 `18` 为 `age` 字段的默认值，查询结果将包含该字段显式设置为 `18` 以及设置为 null 的所有 Entity。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'age == 18'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'age': 18, 'price': None, 'pk': 3}",
#     "{'age': 18, 'price': 59.99, 'pk': 5}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "age == 18";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// Output
// [
//    QueryResp.QueryResult(entity={price=null, pk=3, age=18}), 
//    QueryResp.QueryResult(entity={price=59.99, pk=5, age=18})
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
const filter = 'age == 18';

const res = await client.query({
    collection_name:"my_collection",
    filter:filter,
    output_fields=["age", "price", "pk"]
});

console.log(res);

// Example output:
// data: [
//     "{'age': 18, 'price': None, 'pk': 3}",
//     "{'age': 18, 'price': 59.99, 'pk': 5}"
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter = "age == 18"
queryResult, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
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
  "filter": "age == 18",
  "outputFields": ["age", "price", "pk"]
}'
```

</TabItem>
</Tabs>

## 使用过滤表达式的向量查询\{#vector-search-with-filter-expressions}

除了简单的基于数值的过滤查询外，您还可以将向量相似性搜索和过滤表达式结合。如下示例演示了如何在向量搜索中添加过滤表达式。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "25 <= age <= 35"

res = client.search(
    collection_name="my_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["age","price"],
    filter=filter
)

print(res)

# Example output:
# data: [
#     "[{'id': 2, 'distance': -0.2016308456659317, 'entity': {'age': 30, 'price': None}}, {'id': 1, 'distance': -0.23643313348293304, 'entity': {'age': 25, 'price': 99.98999786376953}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "25 <= age <= 35";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("age", "price"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [
//   [
//     SearchResp.SearchResult(entity={price=null, age=30}, score=-0.20163085, id=2),
//     SearchResp.SearchResult(entity={price=99.99, age=25}, score=-0.23643313, id=1)
//   ]
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['age', 'price'],
    filter: '25 <= age <= 35'
});
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3, -0.6, 0.1}
filter = "25 <= age <= 35"

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 10)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithFilter(filter).
    WithAnnParam(annParam).
    WithOutputFields("age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("age: ", resultSet.GetColumn("age"))
    fmt.Println("price: ", resultSet.GetColumn("price"))
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
        [0.3, -0.6, 0.1]
    ],
    "annsField": "embedding",
    "limit": 5,
    "outputFields": ["age", "price"]
}'

## {"code":0,"cost":0,"data":[{"age":35,"distance":-0.19054288,"id":3,"price":199.99},{"age":30,"distance":-0.20163085,"id":2,"price":149.5},{"age":25,"distance":-0.2364331,"id":1,"price":99.99}]}
```

</TabItem>
</Tabs>

在该示例中，我们首先定义了一个查询向量，然后添加了一个过滤表达式 `25 <= age <= 35`。查询结果除了与查询向量在语义上相关外，还需要满足过滤表达式的要求。关于过滤查询的更多内容，可以参考 [Filtered Search](./filtered-search)。