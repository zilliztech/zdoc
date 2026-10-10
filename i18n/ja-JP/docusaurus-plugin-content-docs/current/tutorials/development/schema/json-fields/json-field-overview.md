---
title: "JSON フィールドの概要 | Cloud"
slug: /json-field-overview
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "商品カタログ、コンテンツ管理システム、ユーザー設定エンジンなどのアプリケーションを構築する場合、ベクトル埋め込みとともに柔軟なメタデータを保存する必要がよくあります。商品の属性はカテゴリによって異なり、ユーザー設定は時間とともに変化し、ドキュメントのプロパティは複雑なネスト構造を持ちます。Zilliz Cloud の JSON フィールドは、パフォーマンスを犠牲にすることなく、柔軟な構造化データを保存・クエリできるようにすることで、この課題を解決します。 | Cloud"
type: origin
token: Neq4wR0EdiXokRkhXwbcMPfanCd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON フィールドの概要

商品カタログ、コンテンツ管理システム、ユーザー設定エンジンなどのアプリケーションを構築する場合、ベクトル埋め込みとともに柔軟なメタデータを保存する必要がよくあります。商品の属性はカテゴリによって異なり、ユーザー設定は時間とともに変化し、ドキュメントのプロパティは複雑なネスト構造を持ちます。Zilliz Cloud の JSON フィールドは、パフォーマンスを犠牲にすることなく、柔軟な構造化データを保存・クエリできるようにすることで、この課題を解決します。

## JSON フィールドとは？\{#what-is-a-json-field}

JSON フィールドは、Zilliz Cloud において構造化されたキーと値のデータを保存する、スキーマで定義されたデータ型（`DataType.JSON`）です。従来の固定的なデータベース列とは異なり、JSON フィールドはネストされたオブジェクト、配列、混合データ型を格納でき、高速なクエリのための複数のインデックスオプションを提供します。

JSON フィールドの構造の例:

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

この例では、`metadata` は、フラットな値（例: `category`、`in_stock`）、配列（`tags`）、ネストされたオブジェクト（`supplier`）を組み合わせて含む単一の JSON フィールドです。

<Admonition type="info" title="Notes">

**命名規則:** JSON キーには英字、数字、アンダースコアのみを使用します。特殊文字、スペース、ドットはクエリで解析の問題を引き起こす可能性があるため、使用を避けてください。

</Admonition>

## JSON フィールドと動的フィールド\{#json-field-vs-dynamic-field}

よく混同される点は、JSON フィールドと [Dynamic Field](./enable-dynamic-field) の違いです。どちらも JSON に関連していますが、目的は異なります。

以下の表に、JSON フィールドと動的フィールドの主な違いをまとめます。

| 機能 | JSON フィールド | 動的フィールド |
| --- | --- | --- |
| スキーマ定義 | `DataType.JSON` 型を使用してコレクションスキーマで明示的に宣言する必要があるスカラーフィールドです。 | 宣言されていないフィールドを自動的に保存する非表示の JSON フィールド（名前は `$meta`）です。 |
| ユースケース | スキーマが既知で一貫している構造化データを保存します。 | 固定スキーマに適合しない、柔軟で変化するデータや半構造化データを保存します。 |
| 制御 | フィールド名と構造を制御できます。 | 未定義のフィールドはシステムによって管理されます。 |
| クエリ | JSON フィールド内のフィールド名または対象キーを使用してクエリします: `metadata["key"]`。 | 動的フィールドのキー（`"dynamic_key"`）または `$meta`（`$meta["dynamic_key"]`）を使用して直接クエリします。 |

## 基本操作\{#basic-operations}

JSON フィールドを使用する基本的なワークフローは、スキーマでフィールドを定義し、データを挿入してから、特定のフィルター式を使用してデータをクエリするという流れです。

### JSON フィールドを定義する\{#define-a-json-field}

JSON フィールドを使用するには、コレクションの作成時にコレクションスキーマで明示的に定義します。次の例は、`DataType.JSON` 型の `metadata` フィールドを持つコレクションを作成する方法を示しています。

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

<Admonition type="info" title="Notes">

この例では、コレクションスキーマで定義された JSON フィールドは、`nullable=True` により null 値を許可します。詳細については、[Nullable & Default](./nullable-fields) を参照してください。

</Admonition>

### データを挿入する\{#insert-data}

コレクションを作成したら、指定した JSON フィールドに構造化された JSON オブジェクトを含むエンティティを挿入します。データは辞書のリストとしてフォーマットする必要があります。

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

### フィルタリング操作\{#filtering-operations}

JSON フィールドに対してフィルタリング操作を実行する前に、以下を満たしていることを確認してください。

- 各ベクトルフィールドにインデックスを作成していること。

- コレクションがメモリにロードされていること。

<details>

<summary>サンプルコードを表示</summary>

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

これらの要件を満たしたら、以下の式を使用して、JSON フィールド内の値に基づいてコレクションをフィルタリングできます。これらのフィルター式は、特定の JSON パス構文と専用の演算子を利用します。

#### JSON パス構文によるフィルタリング\{#filtering-with-json-path-syntax}

特定のキーをクエリするには、ブラケット記法を使用して JSON キーにアクセスします: `json_field_name["key"]`。ネストされたキーの場合は、それらを連結します: `json_field_name["key1"]["key2"]`。

`category` が `"electronics"` であるエンティティをフィルタリングするには:

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

ネストされたキー `supplier["country"]` が `"USA"` であるエンティティをフィルタリングするには:

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

#### JSON 固有の演算子によるフィルタリング\{#filtering-with-json-specific-operators}

Zilliz Cloud は、特定の JSON フィールドキーに対して配列の値をクエリするための特別な演算子も提供しています。例:

- `json_contains(identifier, expr)`: JSON 配列内に特定の要素またはサブ配列が存在するかどうかを確認します。

- `json_contains_all(identifier, expr)`: 指定された JSON 式のすべての要素がフィールド内に存在することを保証します。

- `json_contains_any(identifier, expr)`: JSON 式の少なくとも 1 つのメンバーがフィールド内に存在するエンティティをフィルタリングします。

`tags` キーの下に `"summer_sale"` 値を持つ商品を検索するには:

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

`tags` キーの下に `"electronics"`、`"new"`、`"clearance"` のいずれかの値を持つ商品を検索するには:

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

JSON 固有の演算子の詳細については、[JSON Operators](./json-filtering-operators) を参照してください。

## 次のステップ: JSON クエリを高速化する\{#next-accelerate-json-queries}

デフォルトでは、アクセラレーションなしの JSON フィールドに対するクエリはすべての行をフルスキャンするため、大規模なデータセットでは遅くなることがあります。JSON クエリを高速化するために、Zilliz Cloud は高度なインデックス作成機能とストレージ最適化機能を提供しています。

<Admonition type="warning" title="Warning">

Milvus 3.0.0 以降、オブジェクト全体の JSON インデックス作成（`json_cast_type="JSON"`、JSON flat indexing とも呼ばれます）は非推奨です。既存のインデックスと新しいインデックス作成リクエストは互換性のために引き続きサポートされますが、このモードは新しいワークロードには推奨されません。既知のクエリパスには JSON パスインデックス作成を使用するか、複雑または変化するドキュメント全体のクエリ高速化には [JSON Shredding](./json-shredding) を検討してください。

</Admonition>

以下の表に、それぞれの違いと最適な使用シナリオをまとめます。

| 手法 | 最適な用途 | 配列の高速化 | 注記 |
| --- | --- | --- | --- |
| JSON Indexing | 頻繁にアクセスされる少数のキー、特定の配列キーの配列 | 可（インデックスされた配列キーに対して） | キーを事前に選択する必要があり、スキーマが変化した場合はメンテナンスが必要です。 |
| JSON Shredding | 多くのキーにわたる全般的な高速化、多様なクエリへの柔軟な対応 | 可（ブルートフォースクエリと比較して配列の値をわずかに高速化） | 追加のストレージ設定が必要で、配列には引き続きキーごとのインデックスが必要です。 |
| NGRAM Index | ワイルドカード検索、テキストフィールドの部分文字列マッチング | N/A | 数値/range フィルターには使用できません。 |

**ヒント:** これらのアプローチは組み合わせることができます。たとえば、広範なクエリ高速化には JSON Shredding、高頻度の配列キーには JSON インデックス作成、柔軟なテキスト検索には NGRAM インデックスを使用します。

実装の詳細については、以下を参照してください:

-  [JSON Indexing](./json-indexing)

- [JSON Shredding](./json-shredding)

- [NGRAM](./ngram-index-type)

## FAQ\{#faq}

### JSON フィールドのサイズに制限はありますか？\{#are-there-any-limitations-on-the-size-of-a-json-field}

はい。各 JSON フィールドは 65,536 バイトに制限されています。

### JSON フィールドはデフォルト値の設定をサポートしていますか？\{#does-a-json-field-support-setting-a-default-value}

いいえ、JSON フィールドはデフォルト値をサポートしていません。ただし、フィールドを定義するときに `nullable=True` を設定すると、空のエントリを許可できます。

詳細については、[Nullable & Default](./nullable-fields) を参照してください。

### JSON フィールドのキーの命名規則はありますか？\{#are-there-any-naming-conventions-for-json-field-keys}

はい。クエリおよびインデックス作成との互換性を確保するには、次の点に従ってください:

- JSON キーには英字、数字、アンダースコアのみを使用します。

- 特殊文字、スペース、ドット（`.`、`/` など）の使用は避けてください。

- 互換性のないキーは、フィルター式で解析の問題を引き起こす可能性があります。

### Zilliz Cloud は JSON フィールドの文字列値をどのように処理しますか？\{#how-does-zilliz-cloud-handle-string-values-in-json-fields}

Zilliz Cloud は、文字列値を JSON 入力に表示されているとおりに、意味的な変換を行わずに保存します。引用符の付け方が不適切な文字列は、解析時にエラーになる可能性があります。

**有効な文字列の例**:

```plaintext
"a\"b", "a'b", "a\\b"
```

**無効な文字列の例**:

```plaintext
'a"b', 'a\'b'
```
