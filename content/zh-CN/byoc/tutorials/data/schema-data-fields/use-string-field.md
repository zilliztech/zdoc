---
title: "字符串类型 | BYOC"
slug: /use-string-field
sidebar_label: "字符串类型"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，`VARCHAR` 是用于存储字符串类型的数据类型，适用于可变长度字符串的存储。 | BYOC"
type: origin
token: Z1kKwms8miXdCnkQEzWc9hNyn9f
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - 标量字段
  - 字符串字段
  - varchar 字段
  - max_length
  - 最大长度

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 字符串类型

在 Zilliz Cloud 中，`VARCHAR` 是用于存储字符串类型的数据类型，适用于可变长度字符串的存储。

在定义一个 `VARCHAR` 类型的字段时，需要完成如下设置：

- 设置 `datatype` 为 `DataType.VARCHAR`。

- 设置 `max_length`，用于指定当前 `VARCHAR` 字段可容纳的最大字节数。该参数的取值范围为 1 到 65,535。

<Admonition type="info" icon="📘" title="说明">

<p>Zilliz Cloud 支持为 <code>VARCHAR</code> 字段设置 Null 值和默认值。如需开启这些设置，需要在创建字段时，将 <code>nullable</code> 设置为 <code>True</code> 以及将 <code>default_value</code> 设置为一个字符串。关于 Null 值和默认值的详细情况，可以参考 <a href="./nullable-and-default">Nullable 和默认值</a>。</p>

</Admonition>

## 添加 VARCHAR 字段\{#add-varchar-field}

要在 Zilliz Cloud 中使用字符串类型，需要在创建 Collection 时定义用于存储字符串的 `VARCHAR` 字段。如下示例演示了如何在创建 Collection Schema 时定义两个 `VARCHAR` 字段。其中，

- `varchar_field1` 用于存放最多 100 字节的字符串，允许为 Null，默认值为 `"Unknow"`。

- `varchar_field2` 用于存放最多 200 字节的字符串，允许为 Null，没有默认值。

<Admonition type="info" icon="📘" title="说明">

<p>如果在创建 Schema 时设置了 <code>enable_dynamic_fields=True</code>，Zilliz Cloud 允许您插入的数据中包含 Schema 中未定义的字段。但是这可能会使查询复杂度和管理难度增加，进而影响查询性能。关于动态字段的相关内容，可以参考<a href="./enable-dynamic-field">Dynamic Field</a>。</p>

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

# Add `varchar_field1` that supports null values with default value "Unknown"
schema.add_field(field_name="varchar_field1", datatype=DataType.VARCHAR, max_length=100, nullable=True, default_value="Unknown")
# Add `varchar_field2` that supports null values without default value
schema.add_field(field_name="varchar_field2", datatype=DataType.VARCHAR, max_length=200, nullable=True)
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
        .fieldName("varchar_field1")
        .dataType(DataType.VarChar)
        .maxLength(100)
        .isNullable(true)
        .defaultValue("Unknown")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("varchar_field2")
        .dataType(DataType.VarChar)
        .maxLength(200)
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

const client = new MilvusClient({
  address: `YOUR_CLUSTER_ENDPOINT`
});

const schema = [
  {
    name: "metadata",
    data_type: DataType.JSON,
  },
  {
    name: "pk",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "varchar_field2",
    data_type: DataType.VarChar,
    max_length: 200,
  },
  {
    name: "varchar_field1",
    data_type: DataType.VarChar,
    max_length: 100,
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
    WithName("pk").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(3),
).WithField(entity.NewField().
    WithName("varchar_field1").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(100).
    WithNullable(true).
    WithDefaultValueString("Unknown"),
).WithField(entity.NewField().
    WithName("varchar_field2").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(200).
    WithNullable(true),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export varcharField1='{
    "fieldName": "varchar_field1",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 100
    },
    "nullable": true
}'

export varcharField2='{
    "fieldName": "varchar_field2",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 200
    },
    "nullable": true
}'

export primaryField='{
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
        $varcharField1,
        $varcharField2,
        $primaryField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

## 设置索引参数\{#set-index-params}

为 VARCHAR 字段设置索引参数是一个可选操作，可以显著提高查询效率。在 Zilliz Cloud 中，索引为向量字段的必选配置；对于标量字段而言为可选配置。

以下示例中，我们为名为 `embedding` 的向量字段和名为 `varchar_field1` 的标量字段创建了 `AUTOINDEX` 索引类型，表示 Zilliz Cloud 会自动根据数据类型创建合适的索引。有关更多信息，请参考 [AUTOINDEX](./autoindex-explained)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params

index_params = client.prepare_index_params()

# Index `varchar_field1` with AUTOINDEX
index_params.add_index(
    field_name="varchar_field1",
    index_type="AUTOINDEX",
    index_name="varchar_index"
)

# Index `embedding` with AUTOINDEX and specify metric_type
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
        .fieldName("varchar_field1")
        .indexName("varchar_index")
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
indexOption1 := milvusclient.NewCreateIndexOption("my_collection", "embedding",
    index.NewAutoIndex(index.MetricType(entity.IP)))
indexOption2 := milvusclient.NewCreateIndexOption("my_collection", "varchar_field1",
    index.NewInvertedIndex())
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    index_name: 'varchar_index',
    field_name: 'varchar_field1',
    index_type: IndexType.AUTOINDEX,
)];

indexParams.push({
    index_name: 'embedding_index',
    field_name: 'embedding',
    metric_type: MetricType.COSINE,
    index_type: IndexType.AUTOINDEX,
});
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "varchar_field1",
            "indexName": "varchar_index",
            "indexType": "AUTOINDEX"
        }
    ]'
    
export indexParams='[
        {
            "fieldName": "varchar_field1",
            "indexName": "varchar_index",
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

定义好 Schema 和索引后，我们便可以创建包含字符串字段的 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
await client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    index_params: index_params
});
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
## {"code":0,"data":{}}
```

</TabItem>
</Tabs>

## 插入数据\{#insert-data}

Collection 创建完成后，可以插入包含字符串字段的数据。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample data
data = [
    {"varchar_field1": "Product A", "varchar_field2": "High quality product", "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"varchar_field1": "Product B", "pk": 2, "embedding": [0.4, 0.5, 0.6]}, # varchar_field2 field is missing, which should be NULL
    {"varchar_field1": None, "varchar_field2": None, "pk": 3, "embedding": [0.2, 0.3, 0.1]},  # `varchar_field1` should default to `Unknown`, `varchar_field2` is NULL
    {"varchar_field1": "Product C", "varchar_field2": None, "pk": 4, "embedding": [0.5, 0.7, 0.2]},  # `varchar_field2` is NULL
    {"varchar_field1": None, "varchar_field2": "Exclusive deal", "pk": 5, "embedding": [0.6, 0.4, 0.8]},  # `varchar_field1` should default to `Unknown`
    {"varchar_field1": "Unknown", "varchar_field2": None, "pk": 6, "embedding": [0.8, 0.5, 0.3]},  # `varchar_field2` is NULL
    {"varchar_field1": "", "varchar_field2": "Best seller", "pk": 7, "embedding": [0.8, 0.5, 0.3]}, # Empty string is not treated as NULL
]

# Insert data
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
rows.add(gson.fromJson("{\"varchar_field1\": \"Product A\", \"varchar_field2\": \"High quality product\", \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"Product B\", \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": null, \"varchar_field2\": null, \"pk\": 3, \"embedding\": [0.2, 0.3, 0.1]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"Product C\", \"varchar_field2\": null, \"pk\": 4, \"embedding\": [0.5, 0.7, 0.2]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": null, \"varchar_field2\": \"Exclusive deal\", \"pk\": 5, \"embedding\": [0.6, 0.4, 0.8]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"Unknown\", \"varchar_field2\": null, \"pk\": 6, \"embedding\": [0.8, 0.5, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"\", \"varchar_field2\": \"Best seller\", \"pk\": 7, \"embedding\": [0.8, 0.5, 0.3]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
column1, _ := column.NewNullableColumnVarChar("varchar_field1",
    []string{"Product A", "Product B", "Product C", "Unknown", ""},
    []bool{true, true, false, true, false, true, true})
column2, _ := column.NewNullableColumnVarChar("varchar_field2",
    []string{"High quality product", "Exclusive deal", "Best seller"},
    []bool{true, false, false, false, true, false, true})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("pk", []int64{1, 2, 3, 4, 5, 6, 7}).
    WithFloatVectorColumn("embedding", 3, [][]float32{
        {0.1, 0.2, 0.3},
        {0.4, 0.5, 0.6},
        {0.2, 0.3, 0.1},
        {0.5, 0.7, 0.2},
        {0.6, 0.4, 0.8},
        {0.8, 0.5, 0.3},
        {0.8, 0.5, 0.3},
    }).
    WithColumns(column1, column2),
)
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
    varchar_field1: "Product A",
    varchar_field2: "High quality product",
    pk: 1,
    embedding: [0.1, 0.2, 0.3],
  },
  {
    varchar_field1: "Product B",
    varchar_field2: "Affordable price",
    pk: 2,
    embedding: [0.4, 0.5, 0.6],
  },
  {
    varchar_field1: "Product C",
    varchar_field2: "Best seller",
    pk: 3,
    embedding: [0.7, 0.8, 0.9],
  },
];

await client.insert({
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
--data '{
    "data": [
        {"varchar_field1": "Product A", "varchar_field2": "High quality product", "pk": 1, "embedding": [0.1, 0.2, 0.3]},
        {"varchar_field1": "Product B", "pk": 2, "embedding": [0.4, 0.5, 0.6]},
        {"varchar_field1": null, "varchar_field2": null, "pk": 3, "embedding": [0.2, 0.3, 0.1]},  
        {"varchar_field1": "Product C", "varchar_field2": null, "pk": 4, "embedding": [0.5, 0.7, 0.2]},  
        {"varchar_field1": null, "varchar_field2": "Exclusive deal", "pk": 5, "embedding": [0.6, 0.4, 0.8]},  
        {"varchar_field1": "Unknown", "varchar_field2": null, "pk": 6, "embedding": [0.8, 0.5, 0.3]},  
        {"varchar_field1": "", "varchar_field2": "Best seller", "pk": 7, "embedding": [0.8, 0.5, 0.3]}  
    ],
    "collectionName": "my_collection"
}'

## {"code":0,"cost":0,"data":{"insertCount":3,"insertIds":[1,2,3]}}
```

</TabItem>
</Tabs>

## 使用过滤表达式查询\{#query-with-filter-expressions}

添加字符串字段后，您可以在 `query` 请求中利用这些字段进行过滤。例如，您可以查询 `varchar_field1` 为 `Product A` 的所有数据：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Filter `varchar_field1` with value "Product A"
filter = 'varchar_field1 == "Product A"'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["varchar_field1", "varchar_field2"]
)

print(res)

# Example output:
# data: [
#     "{'varchar_field1': 'Product A', 'varchar_field2': 'High quality product', 'pk': 1}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "varchar_field1 == \"Product A\"";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={varchar_field1=Product A, varchar_field2=High quality product, pk=1})]
```

</TabItem>

<TabItem value='go'>

```go
filter := "varchar_field1 == \"Product A\""
queryResult, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("varchar_field1", "varchar_field2"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("varchar_field1", queryResult.GetColumn("varchar_field1").FieldData().GetScalars())
fmt.Println("varchar_field2", queryResult.GetColumn("varchar_field2").FieldData().GetScalars())

// Output
//
// varchar_field1 string_data:{data:"Product A"}
// varchar_field2 string_data:{data:"High quality product"}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.query({
    collection_name: 'my_collection',
    filter: 'varchar_field1 == "Product A"',
    output_fields: ['varchar_field1', 'varchar_field2']
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
    "filter": "varchar_field1 == \"Product A\"",
    "outputFields": ["varchar_field1", "varchar_field2"]
}'
## {"code":0,"cost":0,"data":[{"pk":1,"varchar_field1":"Product A","varchar_field2":"High quality product"}]}
```

</TabItem>
</Tabs>

您也可以参考如下代码查找所有 `varchar_field2` 字段为 `null` 的所有 Entity。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Filter entities where `varchar_field2` is null
filter = 'varchar_field2 is null'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["varchar_field1", "varchar_field2"]
)

print(res)

# Example output:
# data: [
#     "{'varchar_field1': 'Product B', 'varchar_field2': None, 'pk': 2}",
#     "{'varchar_field1': 'Unknown', 'varchar_field2': None, 'pk': 3}",
#     "{'varchar_field1': 'Product C', 'varchar_field2': None, 'pk': 4}",
#     "{'varchar_field1': 'Unknown', 'varchar_field2': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "varchar_field2 is null";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [
//    QueryResp.QueryResult(entity={varchar_field1=Product B, varchar_field2=null, pk=2}),
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=null, pk=3}),
//    QueryResp.QueryResult(entity={varchar_field1=Product C, varchar_field2=null, pk=4}),
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=null, pk=6})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter = "varchar_field2 is null"
queryResult, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("varchar_field1", "varchar_field2"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("varchar_field1", queryResult.GetColumn("varchar_field1"))
fmt.Println("varchar_field2", queryResult.GetColumn("varchar_field2"))
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.query({
    collection_name: 'my_collection',
    filter: 'varchar_field2 is null',
    output_fields: ['varchar_field1', 'varchar_field2']
});
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
    "filter": "varchar_field2 is null",
    "outputFields": ["varchar_field1", "varchar_field2"]
}'
```

</TabItem>
</Tabs>

如果需要获取 `varchar_field1` 字段值为 `"Unknown"` 的所有 Entity，可以参考如下代码进行查询。值得注意的是，因为 `varchar_field1` 字段的默认值也为 `"Unknown"`，查询的结果会包括该字段显式设置为 `"Unknown"` 的以及值为空的所有 Entity。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Filter entities with `varchar_field1` with value `Unknown`
filter = 'varchar_field1 == "Unknown"'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["varchar_field1", "varchar_field2"]
)

print(res)

# Example output:
# data: [
#     "{'varchar_field1': 'Unknown', 'varchar_field2': None, 'pk': 3}",
#     "{'varchar_field1': 'Unknown', 'varchar_field2': 'Exclusive deal', 'pk': 5}",
#     "{'varchar_field1': 'Unknown', 'varchar_field2': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "varchar_field1 == \"Unknown\"";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .build());

System.out.println(resp.getQueryResults());

// Output
// 
// [
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=null, pk=3}),
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=Exclusive deal, pk=5}),
//    QueryResp.QueryResult(entity={varchar_field1=Unknown, varchar_field2=null, pk=6})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter = "varchar_field1 == \"Unknown\""
queryResult, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("varchar_field1", "varchar_field2"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("varchar_field1", queryResult.GetColumn("varchar_field1"))
fmt.Println("varchar_field2", queryResult.GetColumn("varchar_field2"))
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
await client.query({
    collection_name: 'my_collection',
    filter: 'varchar_field1 == "Unknown"',
    output_fields: ['varchar_field1', 'varchar_field2']
});
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
    "filter": "varchar_field1 == \"Unknown\"",
    "outputFields": ["varchar_field1", "varchar_field2"]
}'
```

</TabItem>
</Tabs>

## 向量搜索与字符串过滤结合\{#vector-search-with-filter-expressions}

除了基本的标量字段过滤，您还可以将向量相似度搜索与标量字段过滤结合使用。例如，以下代码展示了如何在向量搜索中添加标量字段的过滤条件：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Search with string filtering

# Filter `varchar_field2` with value "Best seller"
filter = 'varchar_field2 == "Best seller"'

res = client.search(
    collection_name="my_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["varchar_field1", "varchar_field2"],
    filter=filter
)

print(res)

# Example output:
# data: [
#     "[{'id': 7, 'distance': -0.04468163847923279, 'entity': {'varchar_field1': '', 'varchar_field2': 'Best seller'}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "varchar_field2 == \"Best seller\"";
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={varchar_field1=, varchar_field2=Best seller}, score=-0.04468164, id=7)]]
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3, -0.6, 0.1}
filter = "varchar_field2 == \"Best seller\""

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 10)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,                       // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithFilter(filter).
    WithAnnParam(annParam).
    WithOutputFields("varchar_field1", "varchar_field2"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("varchar_field1: ", resultSet.GetColumn("varchar_field1"))
    fmt.Println("varchar_field2: ", resultSet.GetColumn("varchar_field2"))
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['varchar_field1', 'varchar_field2'],
    filter: 'varchar_field2 == "Best seller"'
    params: {
       nprobe:10
    }
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
    "limit": 5,
    "searchParams":{
        "params":{"nprobe":10}
    },
    "outputFields": ["varchar_field1", "varchar_field2"],
    "filter": "varchar_field2 == \"Best seller\""
}'

## {"code":0,"cost":0,"data":[{"distance":-0.2364331,"id":1,"varchar_field1":"Product A","varchar_field2":"High quality product"}]}
```

</TabItem>
</Tabs>

