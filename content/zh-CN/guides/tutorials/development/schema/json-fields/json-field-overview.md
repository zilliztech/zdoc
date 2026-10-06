---
title: "JSON 概述 | Cloud"
slug: /json-field-overview
sidebar_label: "JSON 概述"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在构建产品目录、内容管理系统或用户偏好引擎等应用时，你通常需要在向量 Embedding 的同时存储灵活的元数据。产品属性会因品类而异，用户偏好会随时间变化，文档属性可能包含复杂的嵌套结构。 | Cloud"
type: origin
token: W1c9w47DGipPiAkMpr8cKviNnpb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON 概述

在构建产品目录、内容管理系统或用户偏好引擎等应用时，你通常需要在向量 Embedding 的同时存储灵活的元数据。产品属性会因品类而异，用户偏好会随时间变化，文档属性可能包含复杂的嵌套结构。
 在 Zilliz Cloud 中，JSON 字段通过支持存储和查询灵活的结构化数据，在不牺牲性能的前提下解决了这一挑战。

## 什么是 JSON 字段？\{#what-is-a-json-field?}

JSON 字段是 Zilliz Cloud 中一种通过模式定义的数据类型（`DataType.JSON`），用于存储结构化的键值对数据。
 与传统的刚性数据库列不同，JSON 字段支持嵌套对象、数组和混合数据类型，并提供多种索引选项以加速查询。

示例 JSON 字段结构：

```json
{
  "metadata": { 
    "category": "electronics",
    "brand": "BrandA",
    "in_stock": true,
    "price": 99.99,
    "string_price": "99.99",
    "tags": ["clearance", "summer_sale"],
    "supplier": {
      "name": "SupplierX",
      "country": "USA",
      "contact": {
        "email": "support@supplierx.com",
        "phone": "+1-800-555-0199"
      }
    }
  }
}
```

在该示例中，`metadata` 是一个单独的 JSON 字段，其中包含扁平值（如 `category`、`in_stock`）、数组（`tags`）以及嵌套对象（`supplier`）的混合结构。

<Admonition type="info" title="说明">

**命名规范**：JSON 键只能使用字母、数字和下划线。避免使用特殊字符、空格或点号，否则可能导致查询解析错误。

</Admonition>

## JSON 字段 vs. 动态字段\{#json-field-vs-dynamic-field}

一个常见的困惑点是 JSON 字段与动态字段之间的区别。两者虽然都与 JSON 相关，但用途不同。

| **特性** | JSON Field | Dynamic Field |
| --- | --- | --- |
| **模式定义** | 必须在集合模式中显式声明为 **DataType.JSON** 类型的标量字段 | 一个隐藏的 JSON 字段（名称为 `$meta`），会自动存储未声明的字段 |
| **使用场景** | 存储已知且一致的结构化数据 | 存储灵活的、演变的或不符合固定模式的半结构化数据 |
| **控制** | 由用户控制字段名和结构 | 系统管理未定义的字段 |
| **查询方式** | 使用字段名或 JSON 字段中的目标键进行查询：`metadata["key"]` | 可直接使用动态字段键 `"dynamic_key"`，或通过 `$meta` 引用：`$meta["dynamic_key"]` |

## 基本操作\{#basic-operations}

使用 JSON 字段的基本流程包括：

1. 在 Schema 中定义字段

1. 插入数据

1. 使用特定的过滤表达式进行查询

### 定义 JSON 字段\{#1-define-json-field}

要使用 JSON 字段，你需要在创建集合时显式地在 Collection Schema 中定义它。以下示例展示了如何创建一个包含 `metadata` 字段（类型为 `DataType.JSON`）的 Collection：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN" 

# Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# Create schema
schema = client.create_schema(auto_id=False, enable_dynamic_field=True)

schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True) # Primary field
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5) # Vector field
# Define a JSON field that allows null values
# highlight-next-line
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)

client.create_collection(
    collection_name="product_catalog",
    schema=schema
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

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// Set up a Milvus client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// Create schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);

// Primary field
schema.addField(AddFieldReq.builder().fieldName("product_id").dataType(DataType.Int64).isPrimaryKey(true).autoID(false).build());
// Vector field
schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(5).build());
// Define a JSON field that allows null values
schema.addField(AddFieldReq.builder().fieldName("metadata").dataType(DataType.JSON).isNullable(true).build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("product_catalog")
        .collectionSchema(schema)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// Set up a Milvus client
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}
defer cli.Close(ctx)

// Create schema
schema := entity.NewSchema().WithDynamicFieldEnabled(true)

// Primary field
schema.WithField(entity.NewField().WithName("product_id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true))
// Vector field
schema.WithField(entity.NewField().WithName("vector").WithDataType(entity.FieldTypeFloatVector).WithDim(5))
// Define a JSON field that allows null values
schema.WithField(entity.NewField().WithName("metadata").WithDataType(entity.FieldTypeJSON).WithNullable(true))

if err := cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("product_catalog", schema)); err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Set up a Milvus client
let client = ClientV2::new(
    &ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN"),
)
.await?;

// Create schema
let schema = CollectionSchema::new()
    .enable_dynamic_field(true)
    // Primary field
    .add_field(
        FieldSchema::new()
            .name("product_id")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    // Vector field
    .add_field(
        FieldSchema::new()
            .name("vector")
            .data_type(DataType::FloatVector)
            .dimension(5),
    )
    // Define a JSON field that allows null values
    .add_field(
        FieldSchema::new()
            .name("metadata")
            .data_type(DataType::Json)
            .nullable(true),
    );

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("product_catalog")
            .schema(schema)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

// Set up a Milvus client
auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Create schema
milvus::CollectionSchema schema;
schema.SetEnableDynamicField(true);

// Primary field
schema.AddField(milvus::FieldSchema("product_id", milvus::DataType::INT64).WithPrimaryKey(true));
// Vector field
schema.AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
// Define a JSON field that allows null values
schema.AddField(milvus::FieldSchema("metadata", milvus::DataType::JSON).WithNullable(true));

status = client->CreateCollection(milvus::CreateCollectionRequest()
    .WithCollectionName("product_catalog")
    .WithCollectionSchema(std::make_shared<milvus::CollectionSchema>(schema)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
const TOKEN = "YOUR_CLUSTER_TOKEN";

// Set up a Milvus client
const client = new MilvusClient({ address: CLUSTER_ENDPOINT, token: TOKEN });

// Create schema
const schema = [
  {
    name: "product_id",
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: false,
  },
  {
    name: "vector",
    data_type: DataType.FloatVector,
    dim: 5,
  },
  // Define a JSON field that allows null values
  {
    name: "metadata",
    data_type: DataType.JSON,
    nullable: true,
  },
];

await client.createCollection({
  collection_name: "product_catalog",
  enableDynamicField: true,
  schema,
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "accept: application/json" \
  --header "content-type: application/json" \
  --data '{
    "collectionName": "product_catalog",
    "schema": {
      "autoId": false,
      "enableDynamicField": true,
      "fields": [
        {
          "fieldName": "product_id",
          "dataType": "Int64",
          "isPrimary": true
        },
        {
          "fieldName": "vector",
          "dataType": "FloatVector",
          "elementTypeParams": {
            "dim": 5
          }
        },
        {
          "fieldName": "metadata",
          "dataType": "JSON",
          "nullable": true
        }
      ]
    }
  }'
```

</TabItem>
</Tabs>

<Admonition type="info" title="说明">

在此示例中，集合模式中定义的 JSON 字段通过设置 `nullable=True` 允许空值。详情请参见 [Nullable 和默认值](./nullable-fields)。

</Admonition>

### 插入数据\{#2-insert-data}

Collection 创建完成后，在指定的 JSON 字段中插入包含结构化 JSON 对象的实体。你的数据格式应为字典列表。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
entities = [
    {
        "product_id": 1,
        "vector": [0.1, 0.2, 0.3, 0.4, 0.5],
        # highlight-start
        "metadata": { # JSON field
            "category": "electronics",
            "brand": "BrandA",
            "in_stock": True,
            "price": 99.99,
            "string_price": "99.99",
            "tags": ["clearance", "summer_sale"],
            "supplier": {
                "name": "SupplierX",
                "country": "USA",
                "contact": {
                    "email": "support@supplierx.com",
                    "phone": "+1-800-555-0199"
                }
            }
        }
        # highlight-end
    }
]

client.insert(collection_name="product_catalog", data=entities)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;

import java.util.Arrays;
import java.util.List;

// Insert data
Gson gson = new Gson();

List<JsonObject> data = Arrays.asList(
    gson.fromJson(
        "{\"product_id\": 1, \"vector\": [0.1, 0.2, 0.3, 0.4, 0.5], \"metadata\": {\"category\": \"electronics\", \"brand\": \"BrandA\", \"in_stock\": true, \"price\": 99.99, \"string_price\": \"99.99\", \"tags\": [\"clearance\", \"summer_sale\"], \"supplier\": {\"name\": \"SupplierX\", \"country\": \"USA\", \"contact\": {\"email\": \"support@supplierx.com\", \"phone\": \"+1-800-555-0199\"}}}}",
        JsonObject.class
    )
);

InsertReq insertReq = InsertReq.builder()
        .collectionName("product_catalog")
        .data(data)
        .build();
client.insert(insertReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "encoding/json"
    "log"

    "github.com/milvus-io/milvus/client/v3/column"
)

// Insert data
metadata, _ := json.Marshal(map[string]any{
    "category":     "electronics",
    "brand":        "BrandA",
    "in_stock":     true,
    "price":        99.99,
    "string_price": "99.99",
    "tags":         []string{"clearance", "summer_sale"},
    "supplier": map[string]any{
        "name":    "SupplierX",
        "country": "USA",
        "contact": map[string]any{
            "email": "support@supplierx.com",
            "phone": "+1-800-555-0199",
        },
    },
})

columns := []column.Column{
    column.NewColumnInt64("product_id", []int64{1}),
    column.NewColumnFloatVector("vector", 5, [][]float32{{0.1, 0.2, 0.3, 0.4, 0.5}}),
    column.NewColumnJSONBytes("metadata", [][]byte{metadata}),
}

if _, err := cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("product_catalog", columns...)); err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

// Insert data
let entities = vec![
    json!({
        "product_id": 1,
        "vector": [0.1_f32, 0.2_f32, 0.3_f32, 0.4_f32, 0.5_f32],
        // JSON field
        "metadata": {
            "category": "electronics",
            "brand": "BrandA",
            "in_stock": true,
            "price": 99.99,
            "string_price": "99.99",
            "tags": ["clearance", "summer_sale"],
            "supplier": {
                "name": "SupplierX",
                "country": "USA",
                "contact": {
                    "email": "support@supplierx.com",
                    "phone": "+1-800-555-0199"
                }
            }
        }
    }),
];

client
    .insert(
        InsertRequest::builder()
            .collection_name("product_catalog")
            .rows(entities)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <utility>

// Insert data
milvus::EntityRows rows = {
    {
        {"product_id", 1},
        {"vector", {0.1f, 0.2f, 0.3f, 0.4f, 0.5f}},
        // JSON field
        {"metadata", {
            {"category", "electronics"},
            {"brand", "BrandA"},
            {"in_stock", true},
            {"price", 99.99},
            {"string_price", "99.99"},
            {"tags", {"clearance", "summer_sale"}},
            {"supplier", {
                {"name", "SupplierX"},
                {"country", "USA"},
                {"contact", {
                    {"email", "support@supplierx.com"},
                    {"phone", "+1-800-555-0199"}
                }}
            }}
        }}
    }
};

milvus::InsertResponse insert_resp;
auto status = client->Insert(milvus::InsertRequest()
    .WithCollectionName("product_catalog")
    .WithRowsData(std::move(rows)), insert_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Insert data
const entities = [
  {
    product_id: 1,
    vector: [0.1, 0.2, 0.3, 0.4, 0.5],
    // JSON field
    metadata: {
      category: "electronics",
      brand: "BrandA",
      in_stock: true,
      price: 99.99,
      string_price: "99.99",
      tags: ["clearance", "summer_sale"],
      supplier: {
        name: "SupplierX",
        country: "USA",
        contact: {
          email: "support@supplierx.com",
          phone: "+1-800-555-0199",
        },
      },
    },
  },
];

await client.insert({
  collection_name: "product_catalog",
  data: entities,
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "accept: application/json" \
  --header "content-type: application/json" \
  --data '{
    "collectionName": "product_catalog",
    "data": [
      {
        "product_id": 1,
        "vector": [0.1, 0.2, 0.3, 0.4, 0.5],
        "metadata": {
          "category": "electronics",
          "brand": "BrandA",
          "in_stock": true,
          "price": 99.99,
          "string_price": "99.99",
          "tags": ["clearance", "summer_sale"],
          "supplier": {
            "name": "SupplierX",
            "country": "USA",
            "contact": {
              "email": "support@supplierx.com",
              "phone": "+1-800-555-0199"
            }
          }
        }
      }
    ]
  }'
```

</TabItem>
</Tabs>

### 过滤操作\{#3-filtering-operations}

在对 JSON 字段执行过滤操作之前，请确保：

- 已为每个向量字段创建索引。

- Collection 已加载到内存中。

<details>

<summary>显示示例代码</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector",
    index_type="AUTOINDEX",
    index_name="vector_index",
    metric_type="COSINE"
)

client.create_index(collection_name="product_catalog", index_params=index_params)

client.load_collection(collection_name="product_catalog")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.index.request.CreateIndexReq;

import java.util.Arrays;

// Create an index on the vector field
client.createIndex(CreateIndexReq.builder()
        .collectionName("product_catalog")
        .indexParams(Arrays.asList(IndexParam.builder()
                .fieldName("vector")
                .indexName("vector_index")
                .indexType(IndexParam.IndexType.AUTOINDEX)
                .metricType(IndexParam.MetricType.COSINE)
                .build()))
        .build());

// Load the collection
client.loadCollection(LoadCollectionReq.builder()
        .collectionName("product_catalog")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
)

// Create an index on the vector field
indexTask, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "product_catalog", "vector", index.NewAutoIndex(entity.COSINE),
).WithIndexName("vector_index"))
if err != nil {
    log.Fatal(err)
}
if err := indexTask.Await(ctx); err != nil {
    log.Fatal(err)
}

// Load the collection
loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("product_catalog"))
if err != nil {
    log.Fatal(err)
}
if err := loadTask.Await(ctx); err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// Create an index on the vector field
client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name("product_catalog")
            .index_params(vec![
                IndexParam::new()
                    .field_name("vector")
                    .index_name("vector_index")
                    .index_type(IndexType::AutoIndex)
                    .metric_type(MetricType::Cosine),
            ])
            .build()?,
    )
    .await?;

// Load the collection
client
    .load_collection(
        LoadCollectionRequest::builder()
            .collection_name("product_catalog")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <utility>

// Create an index on the vector field
milvus::IndexDesc index("vector", "vector_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);
auto status = client->CreateIndex(milvus::CreateIndexRequest()
    .WithCollectionName("product_catalog")
    .WithIndexes({std::move(index)})
    .WithSync(true));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Load the collection
status = client->LoadCollection(milvus::LoadCollectionRequest()
    .WithCollectionName("product_catalog")
    .WithSync(true));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { IndexType, MetricType } from "@zilliz/milvus2-sdk-node";

// Create an index on the vector field
await client.createIndex({
  collection_name: "product_catalog",
  field_name: "vector",
  index_name: "vector_index",
  index_type: IndexType.AUTOINDEX,
  metric_type: MetricType.COSINE,
});

// Load the collection
await client.loadCollection({
  collection_name: "product_catalog",
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Create an index on the vector field
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "accept: application/json" \
  --header "content-type: application/json" \
  --data '{
    "collectionName": "product_catalog",
    "indexParams": [
      {
        "fieldName": "vector",
        "indexName": "vector_index",
        "indexType": "AUTOINDEX",
        "metricType": "COSINE"
      }
    ]
  }'

# Load the collection
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "accept: application/json" \
  --header "content-type: application/json" \
  --data '{
    "collectionName": "product_catalog"
  }'
```

</TabItem>
</Tabs>

</details>

当满足以上条件后，你就可以使用以下表达式，根据 JSON 字段中的值对 Collection 进行过滤。这些过滤表达式利用了特定的JSON 路径语法和专用运算符。

#### 使用 JSON 路径语法进行过滤\{#filtering-with-json-path-syntax}

- 查询特定键时，使用中括号语法访问 JSON 键：<br/>
  `json_field_name["key"]`

- 对于嵌套键，将其链式拼接：<br/>
  `json_field_name["key1"]["key2"]`

要过滤出 `category` 为 `"electronics"` 的数据：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define filter expression
filter = 'metadata["category"] == "electronics"'

client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;

// Define filter expression
String filter = "metadata[\"category\"] == \"electronics\"";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("product_catalog") // Collection name
        .data(Arrays.asList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}))) // Query vector (must match collection's vector dim)
        .limit(5) // Max. number of results to return
        .filter(filter) // Filter expression
        .outputFields(Arrays.asList("product_id", "metadata")) // Fields to include in the search results
        .build());

System.out.println(resp.getSearchResults());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
)

// Define filter expression
filter := `metadata["category"] == "electronics"`

res, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "product_catalog", // Collection name
    5, // Max. number of results to return
    []entity.Vector{entity.FloatVector{0.1, 0.2, 0.3, 0.4, 0.5}}, // Query vector (must match collection's vector dim)
).WithFilter(filter).WithOutputFields("product_id", "metadata")) // Filter expression; fields to include in the search results
if err != nil {
    log.Fatal(err)
}

for _, resultSet := range res {
    log.Println("IDs: ", resultSet.IDs)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// Define filter expression
let filter = r#"metadata["category"] == "electronics""#;

let search = client
    .search(
        SearchRequest::builder()
            .collection_name("product_catalog") // Collection name
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![vec![0.1_f32, 0.2_f32, 0.3_f32, 0.4_f32, 0.5_f32]])) // Query vector (must match collection's vector dim)
            .limit(5) // Max. number of results to return
            .filter(filter) // Filter expression
            .output_fields(["product_id", "metadata"]) // Fields to include in the search results
            .build()?,
    )
    .await?;

println!("{} rows returned", search.results().len());
```

</TabItem>

<TabItem value='c++'>

```c++
// Define filter expression
std::string filter = R"(metadata["category"] == "electronics")";

milvus::SearchRequest search_request;
search_request.WithCollectionName("product_catalog"); // Collection name
search_request.AddFloatVector({0.1f, 0.2f, 0.3f, 0.4f, 0.5f}); // Query vector (must match collection's vector dim)
search_request.WithLimit(5); // Max. number of results to return
search_request.WithFilter(filter); // Filter expression
search_request.WithOutputFields({"product_id", "metadata"}); // Fields to include in the search results

milvus::SearchResponse search_response;
auto status = client->Search(search_request, search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Define filter expression
const filter = 'metadata["category"] == "electronics"';

const res = await client.search({
  collection_name: "product_catalog", // Collection name
  data: [[0.1, 0.2, 0.3, 0.4, 0.5]], // Query vector (must match collection's vector dim)
  limit: 5, // Max. number of results to return
  filter, // Filter expression
  output_fields: ["product_id", "metadata"], // Fields to include in the search results
});

console.log(res.results);
```

</TabItem>

<TabItem value='bash'>

```bash
# Define filter expression
FILTER='metadata[\"category\"] == \"electronics\"'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "accept: application/json" \
  --header "content-type: application/json" \
  --data "{
    \"collectionName\": \"product_catalog\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"limit\": 5,
    \"filter\": \"${FILTER}\",
    \"outputFields\": [\"product_id\", \"metadata\"]
  }"
```

</TabItem>
</Tabs>

要过滤出嵌套键 `supplier["country"]` 等于 `"USA"` 的数据：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define filter expression
filter = 'metadata["supplier"]["country"] == "USA"'

res = client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
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

// Define filter expression
String filter = "metadata[\"supplier\"][\"country\"] == \"USA\"";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("product_catalog") // Collection name
        .data(Arrays.asList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}))) // Query vector (must match collection's vector dim)
        .limit(5) // Max. number of results to return
        .filter(filter) // Filter expression
        .outputFields(Arrays.asList("product_id", "metadata")) // Fields to include in the search results
        .build());

System.out.println(resp.getSearchResults());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
)

// Define filter expression
filter := `metadata["supplier"]["country"] == "USA"`

res, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "product_catalog", // Collection name
    5, // Max. number of results to return
    []entity.Vector{entity.FloatVector{0.1, 0.2, 0.3, 0.4, 0.5}}, // Query vector (must match collection's vector dim)
).WithFilter(filter).WithOutputFields("product_id", "metadata")) // Filter expression; fields to include in the search results
if err != nil {
    log.Fatal(err)
}

for _, resultSet := range res {
    log.Println("IDs: ", resultSet.IDs)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// Define filter expression
let filter = r#"metadata["supplier"]["country"] == "USA""#;

let search = client
    .search(
        SearchRequest::builder()
            .collection_name("product_catalog") // Collection name
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![vec![0.1_f32, 0.2_f32, 0.3_f32, 0.4_f32, 0.5_f32]])) // Query vector (must match collection's vector dim)
            .limit(5) // Max. number of results to return
            .filter(filter) // Filter expression
            .output_fields(["product_id", "metadata"]) // Fields to include in the search results
            .build()?,
    )
    .await?;

println!("{} rows returned", search.results().len());
```

</TabItem>

<TabItem value='c++'>

```c++
// Define filter expression
std::string filter = R"(metadata["supplier"]["country"] == "USA")";

milvus::SearchRequest search_request;
search_request.WithCollectionName("product_catalog"); // Collection name
search_request.AddFloatVector({0.1f, 0.2f, 0.3f, 0.4f, 0.5f}); // Query vector (must match collection's vector dim)
search_request.WithLimit(5); // Max. number of results to return
search_request.WithFilter(filter); // Filter expression
search_request.WithOutputFields({"product_id", "metadata"}); // Fields to include in the search results

milvus::SearchResponse search_response;
auto status = client->Search(search_request, search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Define filter expression
const filter = 'metadata["supplier"]["country"] == "USA"';

const res = await client.search({
  collection_name: "product_catalog", // Collection name
  data: [[0.1, 0.2, 0.3, 0.4, 0.5]], // Query vector (must match collection's vector dim)
  limit: 5, // Max. number of results to return
  filter, // Filter expression
  output_fields: ["product_id", "metadata"], // Fields to include in the search results
});

console.log(res.results);
```

</TabItem>

<TabItem value='bash'>

```bash
# Define filter expression
FILTER='metadata[\"supplier\"][\"country\"] == \"USA\"'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "accept: application/json" \
  --header "content-type: application/json" \
  --data "{
    \"collectionName\": \"product_catalog\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"limit\": 5,
    \"filter\": \"${FILTER}\",
    \"outputFields\": [\"product_id\", \"metadata\"]
  }"
```

</TabItem>
</Tabs>

#### 使用 JSON 专用运算符进行过滤\{#filtering-with-json-specific-operators}

Zilliz Cloud 还提供了一些专门用于查询 JSON 字段中数组值的运算符，例如：

- `json_contains(identifier, expr)`：检查某个 JSON 数组中是否包含指定元素或子数组

- `json_contains_all(identifier, expr)`：确保字段中包含 JSON 表达式中指定的所有元素

- `json_contains_any(identifier, expr)`：筛选出字段中至少包含 JSON 表达式中一个元素的实体

要查找 `tags` 键下包含 `"summer_sale"` 值的产品：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define filter expression
filter = 'json_contains(metadata["tags"], "summer_sale")'

res = client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
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

// Define filter expression
String filter = "json_contains(metadata[\"tags\"], \"summer_sale\")";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("product_catalog") // Collection name
        .data(Arrays.asList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}))) // Query vector (must match collection's vector dim)
        .limit(5) // Max. number of results to return
        .filter(filter) // Filter expression
        .outputFields(Arrays.asList("product_id", "metadata")) // Fields to include in the search results
        .build());

System.out.println(resp.getSearchResults());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
)

// Define filter expression
filter := `json_contains(metadata["tags"], "summer_sale")`

res, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "product_catalog", // Collection name
    5, // Max. number of results to return
    []entity.Vector{entity.FloatVector{0.1, 0.2, 0.3, 0.4, 0.5}}, // Query vector (must match collection's vector dim)
).WithFilter(filter).WithOutputFields("product_id", "metadata")) // Filter expression; fields to include in the search results
if err != nil {
    log.Fatal(err)
}

for _, resultSet := range res {
    log.Println("IDs: ", resultSet.IDs)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// Define filter expression
let filter = r#"json_contains(metadata["tags"], "summer_sale")"#;

let search = client
    .search(
        SearchRequest::builder()
            .collection_name("product_catalog") // Collection name
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![vec![0.1_f32, 0.2_f32, 0.3_f32, 0.4_f32, 0.5_f32]])) // Query vector (must match collection's vector dim)
            .limit(5) // Max. number of results to return
            .filter(filter) // Filter expression
            .output_fields(["product_id", "metadata"]) // Fields to include in the search results
            .build()?,
    )
    .await?;

println!("{} rows returned", search.results().len());
```

</TabItem>

<TabItem value='c++'>

```c++
// Define filter expression
std::string filter = R"(json_contains(metadata["tags"], "summer_sale"))";

milvus::SearchRequest search_request;
search_request.WithCollectionName("product_catalog"); // Collection name
search_request.AddFloatVector({0.1f, 0.2f, 0.3f, 0.4f, 0.5f}); // Query vector (must match collection's vector dim)
search_request.WithLimit(5); // Max. number of results to return
search_request.WithFilter(filter); // Filter expression
search_request.WithOutputFields({"product_id", "metadata"}); // Fields to include in the search results

milvus::SearchResponse search_response;
auto status = client->Search(search_request, search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Define filter expression
const filter = 'json_contains(metadata["tags"], "summer_sale")';

const res = await client.search({
  collection_name: "product_catalog", // Collection name
  data: [[0.1, 0.2, 0.3, 0.4, 0.5]], // Query vector (must match collection's vector dim)
  limit: 5, // Max. number of results to return
  filter, // Filter expression
  output_fields: ["product_id", "metadata"], // Fields to include in the search results
});

console.log(res.results);
```

</TabItem>

<TabItem value='bash'>

```bash
# Define filter expression
FILTER='json_contains(metadata[\"tags\"], \"summer_sale\")'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "accept: application/json" \
  --header "content-type: application/json" \
  --data "{
    \"collectionName\": \"product_catalog\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"limit\": 5,
    \"filter\": \"${FILTER}\",
    \"outputFields\": [\"product_id\", \"metadata\"]
  }"
```

</TabItem>
</Tabs>

要查找在 `tags` 键下至少包含 `"electronics"`、`"new"` 或 `"clearance"` 其中一个值的产品：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define filter expression
filter = 'json_contains_any(metadata["tags"], ["electronics", "new", "clearance"])'

res = client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
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

// Define filter expression
String filter = "json_contains_any(metadata[\"tags\"], [\"electronics\", \"new\", \"clearance\"])";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("product_catalog") // Collection name
        .data(Arrays.asList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}))) // Query vector (must match collection's vector dim)
        .limit(5) // Max. number of results to return
        .filter(filter) // Filter expression
        .outputFields(Arrays.asList("product_id", "metadata")) // Fields to include in the search results
        .build());

System.out.println(resp.getSearchResults());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
)

// Define filter expression
filter := `json_contains_any(metadata["tags"], ["electronics", "new", "clearance"])`

res, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "product_catalog", // Collection name
    5, // Max. number of results to return
    []entity.Vector{entity.FloatVector{0.1, 0.2, 0.3, 0.4, 0.5}}, // Query vector (must match collection's vector dim)
).WithFilter(filter).WithOutputFields("product_id", "metadata")) // Filter expression; fields to include in the search results
if err != nil {
    log.Fatal(err)
}

for _, resultSet := range res {
    log.Println("IDs: ", resultSet.IDs)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// Define filter expression
let filter = r#"json_contains_any(metadata["tags"], ["electronics", "new", "clearance"])"#;

let search = client
    .search(
        SearchRequest::builder()
            .collection_name("product_catalog") // Collection name
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![vec![0.1_f32, 0.2_f32, 0.3_f32, 0.4_f32, 0.5_f32]])) // Query vector (must match collection's vector dim)
            .limit(5) // Max. number of results to return
            .filter(filter) // Filter expression
            .output_fields(["product_id", "metadata"]) // Fields to include in the search results
            .build()?,
    )
    .await?;

println!("{} rows returned", search.results().len());
```

</TabItem>

<TabItem value='c++'>

```c++
// Define filter expression
std::string filter = R"(json_contains_any(metadata["tags"], ["electronics", "new", "clearance"]))";

milvus::SearchRequest search_request;
search_request.WithCollectionName("product_catalog"); // Collection name
search_request.AddFloatVector({0.1f, 0.2f, 0.3f, 0.4f, 0.5f}); // Query vector (must match collection's vector dim)
search_request.WithLimit(5); // Max. number of results to return
search_request.WithFilter(filter); // Filter expression
search_request.WithOutputFields({"product_id", "metadata"}); // Fields to include in the search results

milvus::SearchResponse search_response;
auto status = client->Search(search_request, search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Define filter expression
const filter = 'json_contains_any(metadata["tags"], ["electronics", "new", "clearance"])';

const res = await client.search({
  collection_name: "product_catalog", // Collection name
  data: [[0.1, 0.2, 0.3, 0.4, 0.5]], // Query vector (must match collection's vector dim)
  limit: 5, // Max. number of results to return
  filter, // Filter expression
  output_fields: ["product_id", "metadata"], // Fields to include in the search results
});

console.log(res.results);
```

</TabItem>

<TabItem value='bash'>

```bash
# Define filter expression
FILTER='json_contains_any(metadata[\"tags\"], [\"electronics\", \"new\", \"clearance\"])'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "accept: application/json" \
  --header "content-type: application/json" \
  --data "{
    \"collectionName\": \"product_catalog\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"limit\": 5,
    \"filter\": \"${FILTER}\",
    \"outputFields\": [\"product_id\", \"metadata\"]
  }"
```

</TabItem>
</Tabs>

有关更多信息，请参考 [JSON 操作符](./json-filtering-operators)。

## 下一步：加速 JSON 查询\{#next-accelerate-json-queries}

默认情况下，如果对 JSON 字段的查询没有加速措施，会对所有行执行全表扫描，在大规模数据集上可能会非常慢。

 为了加速 JSON 查询，Zilliz Cloud 提供了高级的索引和存储优化功能。

<Admonition type="warning" title="警告">

从 Milvus 3.0.0 开始，整对象 JSON 索引（`json_cast_type="JSON"`），也称为 JSON 平铺索引，已弃用。为保持兼容性，现有索引和新建索引请求仍受支持，但不再建议在新工作负载中使用此模式。对于已知的查询路径，请使用 JSON 路径索引；若要对复杂或不断演化的文档进行广泛查询加速，请考虑使用 [JSON Shredding](./json-shredding)。

</Admonition>

下表总结了它们的区别及最佳使用场景：

| **技术** | **最佳适用场景** | **是否支持数组加速** | **说明** |
| --- | --- | --- | --- |
| **JSON 索引** | 少量高频访问的键，或某个特定数组键上的数组 | 是（针对已索引的数组键） | 必须预先选择键，如果 schema 演变需要维护 |
| **JSON Shredding** | 跨多个键的一般性加速，灵活支持多样化查询 | 是（与暴搜相比能轻微加速数组查询） | 需要额外的存储配置，数组仍需逐键索引 |
| **NGRAM 索引** | 通配符搜索、文本字段中的子串匹配 | 不适用 | 不适用于数值/范围过滤 |

 **提示**：你可以组合使用这些方法，例如：

- 使用 **JSON Shredding** 提供广泛的查询加速

- 使用 **JSON 索引**优化高频数组键

- 使用 **NGRAM 索引**实现灵活的文本搜索

有关实现细节，请参考：

- [JSON 索引](./json-indexing)

- [JSON Shredding](./json-shredding)

- [NGRAM](./ngram-index-type)

## FAQ\{#faq}

### JSON 字段的大小有限制吗？\{#are-there-any-limitations-on-the-size-of-a-json-field}

有的。每个 JSON 字段限制为 65,536 字节。

### JSON 字段支持设置默认值吗？\{#does-a-json-field-support-setting-a-default-value}

不支持，JSON 字段不支持默认值。但是，您可以在定义字段时设置 `nullable=True` 来允许空条目。

详情请参考 [Nullable 和默认值](./nullable-fields)。

### JSON 字段键有命名规范吗？\{#are-there-any-naming-conventions-for-json-field-keys}

有的。为了确保与查询和索引的兼容性：

- 在 JSON 键中只使用字母、数字和下划线。

- 避免使用特殊字符、空格或点（`.`、`/` 等）。

- 不兼容的键可能会在过滤表达式中导致解析问题。

### Zilliz Cloud 如何处理 JSON 字段中的字符串值？\{#how-does-zilliz-cloud-handle-string-values-in-json-fields}

Zilliz Cloud 完全按照 JSON 输入中的字符串值存储——不进行语义转换。引号不当的字符串可能会在解析过程中导致错误。

**有效字符串示例**：

```plaintext
"a\"b", "a'b", "a\\b"
```

**无效字符串示例**：

```plaintext
'a"b', 'a\'b'
```

