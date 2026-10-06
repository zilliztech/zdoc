---
title: "JSON 索引 | Cloud"
slug: /json-indexing
sidebar_label: "JSON 索引"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON 字段可用于在 Zilliz Cloud 中存储灵活的结构化元数据。如果没有索引，对 JSON 字段执行查询时需要进行全量扫描；随着数据集增长，查询会变慢。JSON 索引会在 JSON 数据中的特定路径上创建索引，从而加速该路径上的等值、范围和其他过滤查询。 | Cloud"
type: origin
token: GKEewZ99aij5Twk7OecceHdsnMg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON 索引

JSON 字段可用于在 Zilliz Cloud 中存储灵活的结构化元数据。如果没有索引，对 JSON 字段执行查询时需要进行全量扫描；随着数据集增长，查询会变慢。JSON 索引会在 JSON 数据中的特定路径上创建索引，从而加速该路径上的等值、范围和其他过滤查询。

JSON 索引适用于以下场景：

- 数据结构稳定、Key 已知的结构化 Schema

- 针对特定 JSON 路径的等值、`IN`、范围和文本匹配查询

- 需要精确控制哪些 Key 被索引的场景

对于查询模式更复杂的 JSON 文档，可以考虑使用 [JSON Shredding](./json-shredding)。

## 索引类型概览\{#json-index-syntax}​

Zilliz Cloud 为 JSON 路径提供四种索引类型。每种索引类型适用于不同的查询模式。

选择索引类型前，先确定 JSON 路径的 **Cast type**。Cast type 决定 Zilliz Cloud 如何解释该路径上的值，以及可以使用哪些索引类型。

### 理解 Cast type\{#supported-cast-types}​

`json_cast_type` 是用于解释并索引 `json_path` 上取值的数据类型。它不同于字段的 Schema 类型：字段本身仍然是 `JSON` 字段，但每个被索引的路径会被当作特定的标量、数组或 JSON 对象类型处理。

请选择与路径取值匹配的 Cast type。要确认某个 Cast type 是否支持特定索引类型，请参见[兼容性参考](./json-indexing#compatibility-reference)。

| Cast type | 适用于路径取值为... | 示例值 |
| --- | --- | --- |
| `BOOL` | 布尔值 | `true` |
| `DOUBLE` | 数值 | `99.99` |
| `VARCHAR` | 字符串 | `"electronics"` |
| `ARRAY_BOOL` | 布尔值数组 | `[true, false]` |
| `ARRAY_DOUBLE` | 数值数组 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 字符串数组 | `["tag1", "tag2"]` |
| `JSON` | 整个 JSON 对象或子对象 | `{"supplier": {"country": "USA"}}` |

如果同一路径上的值类型不一致，只有与 Cast type 匹配的值会被索引。例如，如果 `metadata["price"]` 同时包含 `99.99` 和 `"99.99"`，以 `DOUBLE` Cast type 创建的索引会包含数值 `99.99`，并跳过字符串 `"99.99"`。如需在建索引时转换字符串值，请使用 `json_cast_function`；参见[示例 5：在建索引时转换数据类型](./json-indexing#example-3-convert-data-type-at-index-time)。

### 选择索引类型\{#choose-an-index-type}​

选择 Cast type 后，根据查询模式选择索引类型。

| 查询模式 | 推荐索引类型 | Cast type 要求 | 说明 |
| --- | --- | --- | --- |
| 针对标量值混合使用等值和范围过滤 | `AUTOINDEX` | 使用 `BOOL`、`DOUBLE` 或 `VARCHAR`。 | 让 Zilliz Cloud 根据值的基数选择内部索引布局。 |
| 过滤 JSON 数组中的值 | `INVERTED` | 使用 `ARRAY_BOOL`、`ARRAY_DOUBLE` 或 `ARRAY_VARCHAR`。 | 所有数组 Cast type 都必须使用该索引类型。 |
| 对整个对象或子对象建索引 | `INVERTED` 或 `AUTOINDEX` | 使用 `JSON`。 | 对 `JSON` Cast type，`AUTOINDEX` 使用 `INVERTED`，而不是基于基数选择索引。 |
| 对数值或可排序字符串执行范围过滤 | `STL_SORT` 或 `AUTOINDEX` | 使用 `DOUBLE` 或 `VARCHAR`。 | 使用 `STL_SORT` 可强制使用排序布局；使用 `AUTOINDEX` 则由系统自动选择。 |
| 对低基数字段执行等值或 `IN` 过滤 | `BITMAP` 或 `AUTOINDEX` | 使用 `BOOL` 或 `VARCHAR`。 | 使用 `BITMAP` 可强制使用位图布局。对于数值，请使用 `AUTOINDEX` 或 `STL_SORT`。 |

不确定时，建议先为标量路径使用 `AUTOINDEX`。对数组 Cast type 和文本匹配查询，请显式使用 `INVERTED`。对整个 JSON 对象建索引时，可以使用 `INVERTED` 或 `AUTOINDEX`。

### AUTOINDEX\{#autoindex}​

`AUTOINDEX` 的行为取决于指定的 `json_cast_type`。

| Cast type | `AUTOINDEX` 行为 |
| --- | --- |
| `BOOL`、`DOUBLE`、`VARCHAR` | 根据值的基数在 `BITMAP` 和 `STL_SORT` 之间选择。 |
| `ARRAY_BOOL`、`ARRAY_DOUBLE`、`ARRAY_VARCHAR` | 不支持。请显式使用 `INVERTED` 作为索引类型。 |
| `JSON` | 对整个对象或子对象建索引时使用 `INVERTED`。 |

对于标量 Cast type（`BOOL`、`DOUBLE` 和 `VARCHAR`），如果希望 Zilliz Cloud 自动选择内部索引布局，建议从 `AUTOINDEX` 开始。构建索引时，Zilliz Cloud 会测量 JSON 路径上值的**基数**。基数表示该路径上不同取值的数量。

根据基数，Zilliz Cloud 会选择以下两种内部布局之一：

- **低基数**：值经常重复，例如只包含 `true` 和 `false` 的 `metadata["in_stock"]`，或只包含少量状态字符串的 `metadata["status"]`。Zilliz Cloud 会在内部构建 `BITMAP` 索引，以加速等值和 `IN` 过滤。

- **高基数**：大多数值都不同，例如 `metadata["price"]`、`metadata["created_at"]` 或 `metadata["product_id"]`。Zilliz Cloud 会在内部构建 `STL_SORT` 索引，以加速 `>`、`<`、`>=` 和 `<=` 等范围过滤。

默认的 `BITMAP` 与 `STL_SORT` 分界阈值为 **100 个不同值**。您可以使用 `bitmap_cardinality_limit` 调整该阈值；参见[如何调整 AUTOINDEX 的 BITMAP 与 STL_SORT 分界阈值？](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stl_sort-threshold)

### INVERTED\{#inverted}​

当您需要文本匹配查询、数组索引或整个 JSON 对象索引时，`INVERTED` 是最合适的选择。

在以下场景中，请显式指定 `INVERTED`：

- 需要索引 JSON 数组中的值。

- 需要索引整个 JSON 对象或子对象，并希望明确使用 `INVERTED` 行为。

- 希望使用一种索引类型处理等值、`IN`、范围、文本匹配、数组和对象级查询，并接受更大的索引大小。

对于整个 JSON 对象（`json_cast_type="JSON"`），您可以使用 `INVERTED` 或 `AUTOINDEX`。对该 Cast type，`AUTOINDEX` 使用 `INVERTED`。

详情请参见 [INVERTED](./inverted-index-type)。

### STL_SORT\{#stl_sort}​

`STL_SORT` 会按排序顺序存储 JSON 路径上的值。它针对数值或可排序字符串上的范围过滤进行了优化。

`STL_SORT` 仅支持 `DOUBLE` 和 `VARCHAR` Cast type。以下场景适合使用 `STL_SORT`：

- 过滤条件使用 `>`、`<`、`>=` 或 `<=`。

- 被索引值具有高基数，例如价格、时间戳、ID 或可排序代码。

- 希望强制使用排序布局，而不是让 `AUTOINDEX` 自动选择。

`STL_SORT` 不支持 `BOOL`、`ARRAY_*` 或 `JSON` Cast type。对于数组或整个对象索引，请使用 `INVERTED`。

详情请参见 [STL_SORT](./slt-sort-index-type)。

### BITMAP\{#bitmap}​

`BITMAP` 会为 JSON 路径上的每个不同取值创建紧凑的位图。它针对重复值上的等值和 `IN` 过滤进行了优化。

`BITMAP` 仅支持 `BOOL` 和 `VARCHAR` Cast type。以下场景适合使用 `BITMAP`：

- 过滤条件使用 `==` 或 `IN`。

- 被索引值具有低基数，例如布尔值、状态值或少量类别。

- 希望强制使用位图布局，而不是让 `AUTOINDEX` 自动选择。

`BITMAP` 不支持 `DOUBLE`、`ARRAY_*` 或 `JSON` Cast type。对于数值，请使用 `AUTOINDEX`、`STL_SORT` 或 `INVERTED`。

详情请参见 [BITMAP](./bitmap-index-type)。

### 兼容性参考\{#compatibility-reference}​

下表汇总了支持的 `(cast type, index type)` 组合。

| Cast type | 描述 | 示例值 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | 布尔值（`true`/`false`）。 | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | 数值（整数或浮点数）。 | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | 字符串。 | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | 布尔值数组。 | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | 数值数组。 | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | 字符串数组。 | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | 具有自动类型推断和扁平化能力的整个 JSON 对象或子对象。 | 任意嵌套对象 | ✓ | ✓ | — | — |

对于标记为 `—` 的组合，Zilliz Cloud 会在创建索引时报错。对于数组 Cast type，请显式使用 `INVERTED`（`AUTOINDEX` 不支持数组）。

## 创建 JSON 索引\{#create-json-index}​

本节介绍如何为不同形态的 JSON 数据创建索引。所有示例都使用以下样例结构，并假设您已经有一个包含名为 `metadata` 的 `JSON` 字段的 Collection。

### 样例 JSON 结构\{#example-json-structure}​

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

### 基础设置\{#basic-setup}​

以下示例假设您已经创建了名为 `client` 的 `MilvusClient`，并已连接到 Zilliz Cloud 部署，同时已有一个包含名为 `metadata` 的 `JSON` 字段的 Collection。如果需要从头创建这些资源，请展开下面的内容。

<details>

<summary>**连接并创建样例 Collection**</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Define a schema with a JSON field
schema = client.create_schema(enable_dynamic_field=False)
schema.add_field("pk", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("vec", DataType.FLOAT_VECTOR, dim=4)
schema.add_field("metadata", DataType.JSON, nullable=True)

# Minimal vector index so the collection can be loaded
vec_index = client.prepare_index_params()
vec_index.add_index(field_name="vec", index_type="AUTOINDEX", metric_type="L2")

client.create_collection(
    collection_name="your_collection_name",
    schema=schema,
    index_params=vec_index,
)

# Insert one row that matches the sample JSON structure above
client.insert(
    collection_name="your_collection_name",
    data=[{
        "pk": 1,
        "vec": [0.1, 0.2, 0.3, 0.4],
        "metadata": {
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
    }],
)
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
import io.milvus.v2.service.vector.request.InsertReq;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.util.*;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// Define a schema with a JSON field
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(false);
schema.addField(AddFieldReq.builder().fieldName("pk").dataType(DataType.Int64).isPrimaryKey(true).autoID(false).build());
schema.addField(AddFieldReq.builder().fieldName("vec").dataType(DataType.FloatVector).dimension(4).build());
schema.addField(AddFieldReq.builder().fieldName("metadata").dataType(DataType.JSON).isNullable(true).build());

// Minimal vector index so the collection can be loaded
List<IndexParam> vecIndex = new ArrayList<>();
vecIndex.add(IndexParam.builder()
        .fieldName("vec")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("your_collection_name")
        .collectionSchema(schema)
        .indexParams(vecIndex)
        .build());

// Insert one row that matches the sample JSON structure above
Gson gson = new Gson();
JsonObject metadata = gson.fromJson("{"
        + "\"category\": \"electronics\","
        + "\"brand\": \"BrandA\","
        + "\"in_stock\": true,"
        + "\"price\": 99.99,"
        + "\"string_price\": \"99.99\","
        + "\"tags\": [\"clearance\", \"summer_sale\"],"
        + "\"supplier\": {"
        + "    \"name\": \"SupplierX\","
        + "    \"country\": \"USA\","
        + "    \"contact\": {"
        + "        \"email\": \"support@supplierx.com\","
        + "        \"phone\": \"+1-800-555-0199\""
        + "    }"
        + "}"
        + "}", JsonObject.class);
JsonObject row = new JsonObject();
row.addProperty("pk", 1L);
row.add("vec", gson.toJsonTree(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f)));
row.add("metadata", metadata);

client.insert(InsertReq.builder()
        .collectionName("your_collection_name")
        .data(Collections.singletonList(row))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
package main

import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

func main() {
    ctx := context.Background()

    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: "YOUR_CLUSTER_ENDPOINT",
    })
    if err != nil {
        log.Fatal(err)
    }
    defer cli.Close(ctx)

    // Define a schema with a JSON field
    schema := entity.NewSchema().WithDynamicFieldEnabled(false).
        WithField(entity.NewField().WithName("pk").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true).WithIsAutoID(false)).
        WithField(entity.NewField().WithName("vec").WithDataType(entity.FieldTypeFloatVector).WithDim(4)).
        WithField(entity.NewField().WithName("metadata").WithDataType(entity.FieldTypeJSON).WithNullable(true))

    // Minimal vector index so the collection can be loaded
    vecIndex := milvusclient.NewCreateIndexOption("your_collection_name", "vec", index.NewAutoIndex(entity.L2))

    err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("your_collection_name", schema).
        WithIndexOptions(vecIndex))
    if err != nil {
        log.Fatal(err)
    }

    // Insert one row that matches the sample JSON structure above
    metadata := []byte(`{
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
    }`)
    result, err := cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("your_collection_name").
        WithInt64Column("pk", []int64{1}).
        WithFloatVectorColumn("vec", 4, [][]float32{{0.1, 0.2, 0.3, 0.4}}).
        WithColumns(column.NewColumnJSONBytes("metadata", [][]byte{metadata})))
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("inserted %d rows", result.InsertCount())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");
    let client = ClientV2::new(&config).await?;

    // Define a schema with a JSON field
    let schema = CollectionSchema::new()
        .add_field(FieldSchema::new().name("pk").data_type(DataType::Int64).primary_key(true).auto_id(false))
        .add_field(FieldSchema::new().name("vec").data_type(DataType::FloatVector).dimension(4))
        .add_field(FieldSchema::new().name("metadata").data_type(DataType::Json).nullable(true));

    client.create_collection(
        CreateCollectionRequest::builder()
            .collection_name("your_collection_name")
            .schema(schema)
            .build()?,
    )
    .await?;

    // Minimal vector index so the collection can be loaded
    let vec_index = IndexParam::new()
        .field_name("vec")
        .index_type(IndexType::AutoIndex)
        .metric_type(MetricType::L2);

    client.create_index(
        CreateIndexRequest::builder()
            .collection_name("your_collection_name")
            .index_params(vec![vec_index])
            .build()?,
    )
    .await?;

    // Insert one row that matches the sample JSON structure above
    let row = json!({
        "pk": 1,
        "vec": [0.1f32, 0.2, 0.3, 0.4],
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
    });
    client.insert(
        InsertRequest::builder()
            .collection_name("your_collection_name")
            .rows(vec![row])
            .build()?,
    )
    .await?;

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Define a schema with a JSON field
milvus::CollectionSchema schema("your_collection_name");
schema.AddField(milvus::FieldSchema("pk", milvus::DataType::INT64, "", true, false));
schema.AddField(milvus::FieldSchema("vec", milvus::DataType::FLOAT_VECTOR, "").WithDimension(4));
schema.AddField(milvus::FieldSchema("metadata", milvus::DataType::JSON, "").WithNullable(true));

// Minimal vector index so the collection can be loaded
milvus::IndexDesc vec_index("vec", "vec_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::L2);

status = client->CreateCollection(milvus::CreateCollectionRequest()
    .WithCollectionName("your_collection_name")
    .WithCollectionSchema(std::make_shared<milvus::CollectionSchema>(schema)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateIndex(milvus::CreateIndexRequest()
    .WithCollectionName("your_collection_name")
    .WithIndexes({std::move(vec_index)})
    .WithSync(true));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Insert one row that matches the sample JSON structure above
milvus::InsertRequest insert_req;
insert_req.WithCollectionName("your_collection_name");
insert_req.AddRowData({{"pk", 1},
                       {"vec", std::vector<float>{0.1f, 0.2f, 0.3f, 0.4f}},
                       {"metadata", nlohmann::json::parse(R"({
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
                        })")}});
milvus::InsertResponse insert_resp;
status = client->Insert(insert_req, insert_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

// Define a schema with a JSON field
const fields = [
  { name: "pk", data_type: DataType.Int64, is_primary_key: true, autoID: false },
  { name: "vec", data_type: DataType.FloatVector, type_params: { dim: "4" } },
  { name: "metadata", data_type: DataType.JSON, nullable: true },
];

// Minimal vector index so the collection can be loaded
const indexParams = [
  { field_name: "vec", index_name: "vec_index", index_type: "AUTOINDEX", metric_type: "L2" },
];

await client.createCollection({
  collection_name: "your_collection_name",
  fields,
  index_params: indexParams,
});

// Insert one row that matches the sample JSON structure above
await client.insert({
  collection_name: "your_collection_name",
  data: [
    {
      pk: 1,
      vec: [0.1, 0.2, 0.3, 0.4],
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
  ],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "your_collection_name",
    "schema": {
      "autoID": false,
      "enableDynamicField": false,
      "fields": [
        {"fieldName": "pk", "dataType": "Int64", "isPrimary": true},
        {"fieldName": "vec", "dataType": "FloatVector", "elementTypeParams": {"dim": 4}},
        {"fieldName": "metadata", "dataType": "JSON", "nullable": true}
      ]
    },
    "indexParams": [
      {"fieldName": "vec", "indexName": "vec_index", "indexType": "AUTOINDEX", "metricType": "L2"}
    ]
  }'
```

</TabItem>
</Tabs>

</details>

准备一个 Index params 对象，用于收集后续示例中的索引定义：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
```

</TabItem>

<TabItem value='java'>

```java
List<IndexParam> indexParams = new ArrayList<>();
```

</TabItem>

<TabItem value='go'>

```go
var indexOpts []milvusclient.CreateIndexOption
```

</TabItem>

<TabItem value='rust'>

```rust
let mut index_params = Vec::new();
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<milvus::IndexDesc> index_params;
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [];
```

</TabItem>

<TabItem value='bash'>

```bash
# REST creates one index per request; collect the definitions below
export indexParams="[]"
```

</TabItem>
</Tabs>

后续每个示例都展示一次 `index_params.add_index(...)` 调用。请选择与您的数据匹配的索引定义，并在同一个 `index_params` 对象上调用这些方法；最后通过一次 `client.create_index(...)` 调用统一应用这些索引（参见[应用索引](./json-indexing#apply-index-configuration)）。

### 示例 1：使用 AUTOINDEX 为顶层 Key 建索引\{#example-1-index-a-simple-json-key}​

为 `category` 字段建索引，以便按商品类别快速过滤。使用 `AUTOINDEX` 时，Zilliz Cloud 会根据数据中不同类别的数量选择 `BITMAP` 或 `STL_SORT`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="category_index",
    params={
        "json_path": 'metadata["category"]',
        "json_cast_type": "VARCHAR",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"category\"]");
extraParams.put("json_cast_type", "VARCHAR");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("category_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex1 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["category"]`).
    WithIndexName("category_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex1))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("category_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"category\"]".to_string()),
            ("json_cast_type".to_string(), "VARCHAR".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc category_index("metadata", "category_index", milvus::IndexType::AUTOINDEX);
category_index.AddExtraParam("json_path", "metadata[\"category\"]");
category_index.AddExtraParam("json_cast_type", "VARCHAR");
index_params.push_back(std::move(category_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "category_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["category"]',
    json_cast_type: "VARCHAR",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export categoryIndex='{
  "fieldName": "metadata",
  "indexName": "category_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"category\\\"]",
    "json_cast_type": "VARCHAR"
  }
}'
```

</TabItem>
</Tabs>

### 示例 2：为嵌套 Key 建索引\{#example-2-index-a-nested-key}​

为深层嵌套的 `email` 字段建索引，以便按供应商联系邮箱查询。`json_path` 参数支持任意深度的方括号表示法。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="email_index",
    params={
        "json_path": 'metadata["supplier"]["contact"]["email"]',
        "json_cast_type": "VARCHAR",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"supplier\"][\"contact\"][\"email\"]");
extraParams.put("json_cast_type", "VARCHAR");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("email_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex2 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["supplier"]["contact"]["email"]`).
    WithIndexName("email_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex2))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("email_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"supplier\"][\"contact\"][\"email\"]".to_string()),
            ("json_cast_type".to_string(), "VARCHAR".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc email_index("metadata", "email_index", milvus::IndexType::AUTOINDEX);
email_index.AddExtraParam("json_path", "metadata[\"supplier\"][\"contact\"][\"email\"]");
email_index.AddExtraParam("json_cast_type", "VARCHAR");
index_params.push_back(std::move(email_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "email_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["supplier"]["contact"]["email"]',
    json_cast_type: "VARCHAR",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export emailIndex='{
  "fieldName": "metadata",
  "indexName": "email_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"supplier\\\"][\\\"contact\\\"][\\\"email\\\"]",
    "json_cast_type": "VARCHAR"
  }
}'
```

</TabItem>
</Tabs>

### 示例 3：使用 STL_SORT 执行范围查询\{#example-3-range-queries-with-stl_sort}​

如果您确定某个路径上的查询主要是范围比较（`>`、`<`、`>=`、`<=`），可以直接选择 `STL_SORT`。这样可以跳过基数测量，并立即构建排序布局。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="STL_SORT",
    index_name="price_index",
    params={
        "json_path": 'metadata["price"]',
        "json_cast_type": "DOUBLE",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"price\"]");
extraParams.put("json_cast_type", "DOUBLE");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("price_index")
        .indexType(IndexParam.IndexType.STL_SORT)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex3 := index.NewJSONPathIndex(index.Sorted, "double", `metadata["price"]`).
    WithIndexName("price_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex3))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("price_index")
        .index_type(IndexType::StlSort)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"price\"]".to_string()),
            ("json_cast_type".to_string(), "DOUBLE".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc price_index("metadata", "price_index", milvus::IndexType::STL_SORT);
price_index.AddExtraParam("json_path", "metadata[\"price\"]");
price_index.AddExtraParam("json_cast_type", "DOUBLE");
index_params.push_back(std::move(price_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "price_index",
  index_type: "STL_SORT",
  extra_params: {
    json_path: 'metadata["price"]',
    json_cast_type: "DOUBLE",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export priceIndex='{
  "fieldName": "metadata",
  "indexName": "price_index",
  "params": {
    "index_type": "STL_SORT",
    "json_path": "metadata[\\\"price\\\"]",
    "json_cast_type": "DOUBLE"
  }
}'
```

</TabItem>
</Tabs>

建索引后，类似 `metadata["price"] > 50 AND metadata["price"] < 100` 的范围查询会使用二分查找，而不是全量扫描。

### 示例 4：使用 BITMAP 执行等值查询\{#example-4-equality-queries-with-bitmap}​

对于低基数 Key（例如状态码、布尔值、枚举式字符串），可以直接选择 `BITMAP`。等值查询和 `IN` 查询会变成位图操作。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="BITMAP",
    index_name="in_stock_index",
    params={
        "json_path": 'metadata["in_stock"]',
        "json_cast_type": "BOOL",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"in_stock\"]");
extraParams.put("json_cast_type", "BOOL");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("in_stock_index")
        .indexType(IndexParam.IndexType.BITMAP)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex4 := index.NewJSONPathIndex(index.BITMAP, "bool", `metadata["in_stock"]`).
    WithIndexName("in_stock_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex4))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("in_stock_index")
        .index_type(IndexType::Bitmap)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"in_stock\"]".to_string()),
            ("json_cast_type".to_string(), "BOOL".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc in_stock_index("metadata", "in_stock_index", milvus::IndexType::BITMAP);
in_stock_index.AddExtraParam("json_path", "metadata[\"in_stock\"]");
in_stock_index.AddExtraParam("json_cast_type", "BOOL");
index_params.push_back(std::move(in_stock_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "in_stock_index",
  index_type: "BITMAP",
  extra_params: {
    json_path: 'metadata["in_stock"]',
    json_cast_type: "BOOL",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export inStockIndex='{
  "fieldName": "metadata",
  "indexName": "in_stock_index",
  "params": {
    "index_type": "BITMAP",
    "json_path": "metadata[\\\"in_stock\\\"]",
    "json_cast_type": "BOOL"
  }
}'
```

</TabItem>
</Tabs>

`BITMAP` 也很适合类似 `status` 这类只包含少量不同字符串值的字段。

### 示例 5：在建索引时转换数据类型\{#example-3-convert-data-type-at-index-time}​

如果数值数据被错误地存储为字符串，可以使用 `STRING_TO_DOUBLE` 在构建索引时将值转换为数值。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="string_to_double_index",
    params={
        "json_path": 'metadata["string_price"]',
        "json_cast_type": "DOUBLE",
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"string_price\"]");
extraParams.put("json_cast_type", "DOUBLE");
extraParams.put("json_cast_function", "STRING_TO_DOUBLE");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("string_to_double_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex5 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `metadata["string_price"]`).
    WithIndexName("string_to_double_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex5).
    WithExtraParam("json_cast_function", "STRING_TO_DOUBLE"))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("string_to_double_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"string_price\"]".to_string()),
            ("json_cast_type".to_string(), "DOUBLE".to_string()),
            ("json_cast_function".to_string(), "STRING_TO_DOUBLE".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc string_to_double_index("metadata", "string_to_double_index", milvus::IndexType::AUTOINDEX);
string_to_double_index.AddExtraParam("json_path", "metadata[\"string_price\"]");
string_to_double_index.AddExtraParam("json_cast_type", "DOUBLE");
string_to_double_index.AddExtraParam("json_cast_function", "STRING_TO_DOUBLE");
index_params.push_back(std::move(string_to_double_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "string_to_double_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["string_price"]',
    json_cast_type: "DOUBLE",
    json_cast_function: "STRING_TO_DOUBLE",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export stringToDoubleIndex='{
  "fieldName": "metadata",
  "indexName": "string_to_double_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"string_price\\\"]",
    "json_cast_type": "DOUBLE",
    "json_cast_function": "STRING_TO_DOUBLE"
  }
}'
```

</TabItem>
</Tabs>

如果某个 Entity 的转换失败（例如值是 `"invalid"` 这样的非数字字符串），该 Entity 会在索引构建时被跳过。

### 示例 6：为整个 JSON 对象建索引\{#example-4-index-entire-objects}​

设置 `json_cast_type="JSON"` 会为给定路径上的完整结构建索引。Zilliz Cloud 会将嵌套对象扁平化为路径，并自动推断每个值的类型。该路径下的所有 Key 都会变为可搜索。

对于 `JSON` Cast type，`AUTOINDEX` 会透明地使用 `INVERTED`，因为扁平化和类型推断依赖倒排索引能力。

为整个 `metadata` 对象建索引：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="metadata_full_index",
    params={
        "json_path": "metadata",
        "json_cast_type": "JSON",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata");
extraParams.put("json_cast_type", "JSON");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("metadata_full_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex6 := index.NewJSONPathIndex(index.AUTOINDEX, "json", `metadata`).
    WithIndexName("metadata_full_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex6))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("metadata_full_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata".to_string()),
            ("json_cast_type".to_string(), "JSON".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc metadata_full_index("metadata", "metadata_full_index", milvus::IndexType::AUTOINDEX);
metadata_full_index.AddExtraParam("json_path", "metadata");
metadata_full_index.AddExtraParam("json_cast_type", "JSON");
index_params.push_back(std::move(metadata_full_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "metadata_full_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: "metadata",
    json_cast_type: "JSON",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export metadataFullIndex='{
  "fieldName": "metadata",
  "indexName": "metadata_full_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata",
    "json_cast_type": "JSON"
  }
}'
```

</TabItem>
</Tabs>

也可以为某个子对象建索引，例如所有 `supplier` 信息：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="supplier_index",
    params={
        "json_path": 'metadata["supplier"]',
        "json_cast_type": "JSON",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"supplier\"]");
extraParams.put("json_cast_type", "JSON");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("supplier_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex7 := index.NewJSONPathIndex(index.AUTOINDEX, "json", `metadata["supplier"]`).
    WithIndexName("supplier_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex7))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("supplier_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"supplier\"]".to_string()),
            ("json_cast_type".to_string(), "JSON".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc supplier_index("metadata", "supplier_index", milvus::IndexType::AUTOINDEX);
supplier_index.AddExtraParam("json_path", "metadata[\"supplier\"]");
supplier_index.AddExtraParam("json_cast_type", "JSON");
index_params.push_back(std::move(supplier_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "supplier_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["supplier"]',
    json_cast_type: "JSON",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export supplierIndex='{
  "fieldName": "metadata",
  "indexName": "supplier_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"supplier\\\"]",
    "json_cast_type": "JSON"
  }
}'
```

</TabItem>
</Tabs>

为整个对象建索引会增加索引大小。对于嵌套较深且查询模式多样的文档，可以考虑使用 JSON Shredding。

### 应用索引\{#apply-index-configuration}​

添加所有索引参数后，将它们应用到 Collection：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
client.createIndex(CreateIndexReq.builder()
        .collectionName("your_collection_name")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
for _, opt := range indexOpts {
    _, err := cli.CreateIndex(ctx, opt)
    if err != nil {
        log.Fatal(err)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.create_index(
    CreateIndexRequest::builder()
        .collection_name("your_collection_name")
        .index_params(index_params)
        .build()?,
)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateIndex(milvus::CreateIndexRequest()
    .WithCollectionName("your_collection_name")
    .WithIndexes(std::move(index_params))
    .WithSync(true));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex(indexParams);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams="[
  $categoryIndex,
  $emailIndex,
  $priceIndex,
  $inStockIndex,
  $stringToDoubleIndex,
  $metadataFullIndex,
  $supplierIndex
]"
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data "{
    \"collectionName\": \"your_collection_name\",
    \"indexParams\": $indexParams
  }"
```

</TabItem>
</Tabs>

索引构建是异步执行的。使用 `client.describe_index(...)` 可查看特定索引的构建状态：当 `state` 字段显示 `Finished` 时，表示构建完成；`total_rows`、`indexed_rows` 和 `pending_index_rows` 会显示构建进度。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.describe_index(
    collection_name="your_collection_name",
    index_name="category_index",
)
```

</TabItem>

<TabItem value='java'>

```java
DescribeIndexResp descResp = client.describeIndex(DescribeIndexReq.builder()
        .collectionName("your_collection_name")
        .indexName("category_index")
        .build());
System.out.println(descResp);
```

</TabItem>

<TabItem value='go'>

```go
desc, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("your_collection_name", "category_index"))
if err != nil {
    log.Fatal(err)
}
log.Printf("state=%s totalRows=%d indexedRows=%d", desc.State, desc.TotalRows, desc.IndexedRows)
```

</TabItem>

<TabItem value='rust'>

```rust
let desc = client
    .describe_index(
        DescribeIndexRequest::builder()
            .collection_name("your_collection_name")
            .index_name("category_index")
            .build()?,
    )
    .await?;
println!("{:?}", desc);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::DescribeIndexRequest describe_req;
describe_req.WithCollectionName("your_collection_name");
describe_req.WithIndexName("category_index");
milvus::DescribeIndexResponse describe_resp;
status = client->DescribeIndex(describe_req, describe_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.describeIndex({ collection_name: "your_collection_name", index_name: "category_index" });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/describe" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "your_collection_name",
    "indexName": "category_index"
  }'
```

</TabItem>
</Tabs>

返回示例：

```json
{
  "json_path": "metadata[\"category\"]",
  "json_cast_type": "VARCHAR",
  "index_type": "AUTOINDEX",
  "field_name": "metadata",
  "index_name": "category_index",
  "total_rows": 20,
  "indexed_rows": 20,
  "pending_index_rows": 0,
  "state": "Finished"
}
```

当 `state` 显示 `Finished` 后，针对该索引路径的查询会自动使用新索引。

对于 `AUTOINDEX` 条目，该响应中的 `index_type` 字段会显示为 `AUTOINDEX`。Zilliz Cloud 当前不会暴露构建时实际选择的底层布局（`BITMAP` 或 `STL_SORT`）。请将该选择视为内部优化：无论系统选择哪种布局，针对该路径的等值、`IN` 和范围查询都可以正常工作。

## FAQ\{#faq}​

### 如何在 AUTOINDEX 和显式索引类型之间选择？\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}​

建议从 `AUTOINDEX` 开始。它会根据数据基数选择合适的布局，并覆盖 JSON 路径上的大多数等值、`IN` 和范围查询。在以下场景中，请选择显式索引类型：

- 您明确知道查询模式（例如始终是范围查询 → `STL_SORT`；始终是低基数等值查询 → `BITMAP`），并希望跳过基数测量。

- 需要文本匹配或子字符串查询 → `INVERTED`。

- 正在索引数组 Cast type 或整个 JSON 对象 → `INVERTED`（整个对象场景也可以使用 `AUTOINDEX`）。

### 如果查询过滤表达式使用的类型不同于索引的 Cast type，会发生什么？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}​

如果过滤表达式使用的类型不同于索引的 `json_cast_type`，Zilliz Cloud 不会使用该索引；如果数据允许，系统可能会回退到较慢的暴力扫描。为获得最佳性能，请始终让过滤表达式与索引的 Cast type 保持一致。例如，如果使用 `json_cast_type="DOUBLE"` 创建了数值索引，则只有数值过滤条件会利用该索引。

### 如果不同 Entity 中的同一个 JSON Key 存在不一致的数据类型，会发生什么？\{#when-creating-a-JSON-index-what-if-a-JSON-key-has-inconsistent-data-types-across-different-entities}​

数据类型不一致可能导致**部分索引**。例如，如果 `metadata["price"]` 既存储为数值（`99.99`）又存储为字符串（`"99.99"`），并且您使用 `json_cast_type="DOUBLE"` 创建索引，则只有数值会被索引。字符串形式的条目会被跳过，也不会出现在过滤结果中。您可以使用 `json_cast_function="STRING_TO_DOUBLE"` 在建索引时将字符串转换为数值，或修正源数据，使所有条目使用同一种类型。

### 可以在同一个 JSON Key 上创建多个索引吗？\{#can-I-create-multiple-indexes-on-the-same-JSON-key}​

不可以。Zilliz Cloud 对每个 `(field, json_path)` 组合最多允许创建一个索引，不区分 Cast type 或索引类型。您不能在同一路径上同时创建 `INVERTED` 和 `BITMAP` 索引，也不能在同一路径上使用不同 Cast type 创建两个索引。不过，您可以为整个 JSON 对象创建一个索引，并为该对象中的某个嵌套 Key 另外创建一个索引，因为它们属于不同路径。

### 如何调整 AUTOINDEX 的 BITMAP 与 STL_SORT 分界阈值？\{#how-do-i-tune-autoindexs-bitmap-vs-stl_sort-threshold}​

默认情况下，当被索引值的不同取值数量**不超过 100** 时，`AUTOINDEX` 选择 `BITMAP`；否则选择 `STL_SORT`。您可以在索引参数中添加 `"bitmap_cardinality_limit"` 来覆盖该阈值（取值范围：1–1000）：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    index_type="AUTOINDEX",
    index_name="category_index",
    params={
        "json_path": 'metadata["category"]',
        "json_cast_type": "VARCHAR",
        # highlight-next-line
        "bitmap_cardinality_limit": 200,  # use BITMAP up to 200 distinct values
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"category\"]");
extraParams.put("json_cast_type", "VARCHAR");
extraParams.put("bitmap_cardinality_limit", 200);
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("category_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex8 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["category"]`).
    WithIndexName("category_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex8).
    WithExtraParam("bitmap_cardinality_limit", "200"))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("category_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"category\"]".to_string()),
            ("json_cast_type".to_string(), "VARCHAR".to_string()),
            ("bitmap_cardinality_limit".to_string(), "200".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc category_limit_index("metadata", "category_index", milvus::IndexType::AUTOINDEX);
category_limit_index.AddExtraParam("json_path", "metadata[\"category\"]");
category_limit_index.AddExtraParam("json_cast_type", "VARCHAR");
category_limit_index.AddExtraParam("bitmap_cardinality_limit", "200");
index_params.push_back(std::move(category_limit_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "category_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["category"]',
    json_cast_type: "VARCHAR",
    bitmap_cardinality_limit: 200,
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export categoryLimitIndex='{
  "fieldName": "metadata",
  "indexName": "category_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"category\\\"]",
    "json_cast_type": "VARCHAR",
    "bitmap_cardinality_limit": 200
  }
}'
```

</TabItem>
</Tabs>

大多数用户不需要调整该阈值。如果某个中等基数字段更适合使用位图，可以调高该值；如果希望 `AUTOINDEX` 更早转向 `STL_SORT`，可以调低该值。当您显式指定 `INVERTED`、`STL_SORT` 或 `BITMAP` 时，该设置会被忽略。