---
title: "Nullable 属性 | BYOC"
slug: /nullable-fields
sidebar_label: "Nullable 属性"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持 `nullable` 属性。启用 `nullable` 属性后，字段值可以缺失，或显式设置为 `NULL`。该属性在 Schema 级别定义，并在数据写入、索引、搜索和查询操作中保持一致。 | BYOC"
type: origin
token: BdZswOSRyiVxWakbGbCceGminNC
sidebar_position: 15
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nullable 属性

Zilliz Cloud 支持 `nullable` 属性。启用 `nullable` 属性后，字段值可以缺失，或显式设置为 `NULL`。该属性在 Schema 级别定义，并在数据写入、索引、搜索和查询操作中保持一致。

在以下场景中可以使用 `nullable` 属性：

- 从允许缺失值的外部系统写入数据。

- 某些元数据是可选的，或只适用于部分数据集。

- 向量嵌入异步生成，并在之后再写入。

## 限制\{#limits}

- 允许 `NULL` 值的向量字段不支持 `IS NULL` 或 `IS NOT NULL` 过滤表达式。您不能根据向量字段值是否为 `NULL` 来显式过滤 Entity。

- Array of Structs 字段不支持 `NULL` 值。您不能为 Array of Structs 字段或其内部嵌套字段启用 `nullable` 属性。

- `nullable` 属性在创建字段时定义，之后不能修改。您不能为已有字段启用或禁用 `nullable` 属性。

- 启用 `nullable` 属性的字段不能用作 Partition Key。Partition Key 字段必须始终包含有效的非空值。

## 什么是Nullable 属性\{#nullable-attribute}

在 Zilliz Cloud 中，字段是否允许存储 `NULL` 值由名为 `nullable` 的 Schema 级字段属性控制。

当字段定义为 `nullable=True` 时，Zilliz Cloud 允许在数据写入期间缺失该字段值。实际使用中，Zilliz Cloud 会将以下两种输入视为等价，并将字段值存储为 `NULL`：

- 输入 Entity 中省略该字段。

- 显式将该字段设置为 `NULL`（例如 Python 中的 `None`）。

如果字段未启用 `nullable` 属性（默认行为），则每个 Entity 都必须为该字段提供有效值。省略该字段或显式赋值为 `NULL` 会导致插入或导入操作失败。

Collection Schema 中的 **标量字段和向量字段** 都支持 `nullable` 属性。不过，Array of Structs 字段不支持 `nullable` 属性。

<Admonition type="info" icon="📘" title="说明">

`nullable` 属性决定字段值是否可以缺失；它不定义字段缺失时使用什么值。

- 如果启用 `nullable` 属性的字段未配置默认值，省略该字段会存储为 `NULL`。

- 如果配置了默认值，Zilliz Cloud 可能会改为存储默认值。详情请参见[默认值](./default-fields)。

</Admonition>

## 设置 nullable 属性\{#set-the-nullable-attribute}

要使用 `nullable` 属性，您必须在定义 Collection Schema 时启用该属性。

在以下示例中，Collection Schema 定义了一个名为 `embedding` 的向量字段，并设置 `nullable=True`。这样，Collection 中的 Entity 就可以在数据写入期间省略该向量值，或显式将其设置为 `NULL`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Define schema fields
schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True) # Primary field
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
    # highlight-next-line
    nullable=True, # Enable the nullable attribute; defaults to False
)

client.create_collection(
    collection_name="my_collection",
    schema=schema,
)
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
        .token("YOUR_CLUSTER_TOKEN")
        .build());

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        // highlight-next-line
        .isNullable(true)
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

await client.createCollection({
  collection_name: 'my_collection',
  fields: [
    {
      name: 'id',
      data_type: DataType.Int64,
      is_primary_key: true
    },
    {
      name: 'embedding',
      data_type: DataType.FloatVector,
      dim: 4,
      // highlight-next-line
      nullable: true // Enable the nullable attribute; defaults to false
    }
  ]
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
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
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(4).
    // highlight-next-line
    WithNullable(true),
)

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema))
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
  --data '{
    "collectionName": "my_collection",
    "schema": {
      "autoID": false,
      "fields": [
        {
          "fieldName": "id",
          "dataType": "Int64",
          "isPrimary": true
        },
        {
          "fieldName": "embedding",
          "dataType": "FloatVector",
          "elementTypeParams": {
            "dim": "4"
          },
          "nullable": true
        }
      ]
    }
  }'
```

</TabItem>
</Tabs>

在此 Schema 中：

- `embedding` 字段被显式启用 `nullable` 属性。

- Entity 可以在插入期间省略 `embedding` 字段，或为其赋值 `NULL`。

- 是否允许 `NULL` 值的决定在 Collection 创建时固定。

为便于说明，以下示例重点介绍启用 `nullable` 属性的向量字段（`embedding`）。为标量字段启用 `nullable` 属性是可选的，并不是完成本指南后续步骤的前提。

<details>

<summary>可选：为标量字段启用 nullable 属性</summary>

标量字段也可以启用同一个 `nullable` 属性，并在写入期间遵循相同规则。例如：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="age",
    datatype=DataType.INT64,
    # highlight-next-line
    nullable=True,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        // highlight-next-line
        .isNullable(true)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const ageField = {
  name: 'age',
  data_type: DataType.Int64,
  // highlight-next-line
  nullable: true
};
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().
    WithName("age").
    WithDataType(entity.FieldTypeInt64).
    // highlight-next-line
    WithNullable(true),
)
```

</TabItem>

<TabItem value='bash'>

```bash
{
  "fieldName": "age",
  "dataType": "Int64",
  "nullable": true
}
```

</TabItem>
</Tabs>

</details>

## 缺失值或 NULL 值的插入行为\{#insert-behavior-with-missing-or-null-values}

字段在 Collection Schema 中启用 `nullable` 属性后，Zilliz Cloud 允许在数据写入期间缺失该字段值，或显式将其设置为 `NULL`。

以下示例向前面创建的 Collection 插入 3 个 Entity，展示不同输入情况：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {
        "id": 1,
        "embedding": [0.1, 0.2, 0.3, 0.4],
    },
    {
        "id": 2,
        "embedding": None,   # Explicitly set to NULL
    },
    {
        "id": 3,             # Field omitted → stored as NULL
    },
]

client.insert(
    collection_name="my_collection",
    data=data,
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;

import java.util.Arrays;
import java.util.List;

Gson gson = new Gson();

JsonObject row1 = new JsonObject();
row1.addProperty("id", 1);
row1.add("embedding", gson.toJsonTree(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f)));

JsonObject row2 = new JsonObject();
row2.addProperty("id", 2);
row2.add("embedding", JsonNull.INSTANCE); // Explicitly set to NULL

JsonObject row3 = new JsonObject();
row3.addProperty("id", 3); // Field omitted; stored as NULL

List<JsonObject> data = Arrays.asList(row1, row2, row3);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(data)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  {
    id: 1,
    embedding: [0.1, 0.2, 0.3, 0.4]
  },
  {
    id: 2,
    embedding: null // Explicitly set to NULL
  },
  {
    id: 3 // Field omitted; stored as NULL
  }
];

await client.insert({
  collection_name: 'my_collection',
  data
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

embeddingCol, err := column.NewNullableColumnFloatVector(
    "embedding",
    4,
    [][]float32{{0.1, 0.2, 0.3, 0.4}},
    []bool{true, false, false},
)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption(
    "my_collection",
    column.NewColumnInt64("id", []int64{1, 2, 3}),
    embeddingCol,
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
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
        "embedding": [0.1, 0.2, 0.3, 0.4]
      },
      {
        "id": 2,
        "embedding": null
      },
      {
        "id": 3
      }
    ]
  }'
```

</TabItem>
</Tabs>

在此示例中：

- `id = 1` 的 Entity 提供了有效的向量值。

- `id = 2` 的 Entity 显式将 `embedding` 字段赋值为 `NULL`。

- `id = 3` 的 Entity 完全省略 `embedding` 字段；Zilliz Cloud 将其存储为 `NULL`。

## 索引行为\{#index-behavior}

插入数据后，您可以像往常一样在启用 `nullable` 属性的字段上构建索引。区别在于 Zilliz Cloud 在索引构建期间如何处理 `NULL` 值：

- 只有非空值对应的 Entity 会加入索引。

- 具有 `NULL` 值的 Entity 会被跳过，不参与索引构建。

对于启用 `nullable` 属性的向量字段，这意味着只有包含有效向量的 Entity 才能通过向量相似度被搜索到。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index parameters
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

# Create index
client.create_index(
    collection_name="my_collection",
    index_params=index_params,
)

# Load collection for future search operations
client.load_collection(collection_name="my_collection")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.index.request.CreateIndexReq;

import java.util.Collections;

IndexParam indexParam = IndexParam.builder()
        .fieldName("embedding")
        .indexName("embedding_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();

client.createIndex(CreateIndexReq.builder()
        .collectionName("my_collection")
        .indexParams(Collections.singletonList(indexParam))
        .build());

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
  collection_name: 'my_collection',
  field_name: 'embedding',
  index_type: 'AUTOINDEX',
  metric_type: 'COSINE'
});

await client.loadCollection({
  collection_name: 'my_collection'
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

indexTask, err := client.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection",
    "embedding",
    index.NewAutoIndex(entity.COSINE),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = indexTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = loadTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "indexParams": [
      {
        "fieldName": "embedding",
        "indexName": "embedding_index",
        "indexType": "AUTOINDEX",
        "metricType": "COSINE"
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

此时：

- 具有有效 `embedding` 值的 Entity 已加入索引，并可用于搜索。

- `embedding` 为 `NULL` 的 Entity 仍保留在 Collection 中，但不会加入向量索引。

## 搜索行为\{#search-behavior}

当您在启用 `nullable` 属性的字段上执行搜索操作时，Zilliz Cloud 只会评估搜索所用字段具有非空值的 Entity。向量字段值为 `NULL` 的 Entity 会自动跳过。

对于本示例中启用 `nullable` 属性的 `embedding` 向量字段：

- 只有包含有效向量值的 Entity 会被评估和排序。

- 包含 `NULL` 向量的 Entity 不会导致错误。

- 如果有效向量数量小于请求的 TopK（`limit`），Zilliz Cloud 返回的结果数量可能少于 `limit`。

以下示例在启用 `nullable` 属性的 `embedding` 向量字段上执行向量搜索：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="embedding",
    limit=3,
    output_fields=["embedding"],
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;
import java.util.Collections;

SearchResp res = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f))))
        .annsField("embedding")
        .limit(3)
        .outputFields(Collections.singletonList("embedding"))
        .build());

System.out.println(res);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
  collection_name: 'my_collection',
  data: [[0.1, 0.2, 0.3, 0.4]],
  anns_field: 'embedding',
  limit: 3,
  output_fields: ['embedding']
});

console.log(res);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

query := []float32{0.1, 0.2, 0.3, 0.4}
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.FloatVector(query)},
).WithANNSField("embedding").
    WithOutputFields("embedding"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(resultSets)
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
    "data": [[0.1, 0.2, 0.3, 0.4]],
    "annsField": "embedding",
    "limit": 3,
    "outputFields": ["embedding"]
  }'
```

</TabItem>
</Tabs>

在此搜索中：

- 只有 `embedding` 值非空的 Entity 会作为候选项参与搜索。

- `embedding` 值为 `NULL` 的 Entity 会从评估中排除。

- 返回结果数量取决于 Collection 中有效向量的数量。

## 查询与过滤影响\{#query-filtering-implications}

前面的示例重点介绍向量字段。本节说明 **标量过滤表达式** 中 `NULL` 值的行为。

标量字段可以定义为 `nullable=True`，并遵循与向量字段相同的写入规则。不过，**NULL 标量值在过滤表达式中始终评估为 False**。

例如，给定一个启用 `nullable` 属性的标量字段 `age`，以下过滤表达式会选择 `age` 大于 `18` 的 Entity：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "age > 18"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "age > 18";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'age > 18';
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > 18"
```

</TabItem>

<TabItem value='bash'>

```bash
"filter": "age > 18"
```

</TabItem>
</Tabs>

`age` 为 `NULL` 的 Entity 会从结果中排除，因为 `NULL` 值不满足过滤条件。

同样，等值检查也不会匹配 `NULL` 值。例如：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "status == \"active\""
```

</TabItem>

<TabItem value='java'>

```java
String filter = "status == \"active\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'status == "active"';
```

</TabItem>

<TabItem value='go'>

```go
filter := `status == "active"`
```

</TabItem>

<TabItem value='bash'>

```bash
"filter": "status == \"active\""
```

</TabItem>
</Tabs>

`status` 为 `NULL` 的 Entity 会从结果中排除。

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

