---
title: "Array フィールド | Cloud"
slug: /use-array-fields
sidebar_label: "Array"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ARRAY フィールドは、同じデータ型の要素を順序付きリストとして格納します。 | Cloud"
type: origin
token: N0RmwUtmqinQvokWdYLc3yV5nJh
sidebar_position: 10
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Array フィールド

ARRAY フィールドは、同じデータ型の要素を順序付きリストとして格納します。

ARRAY フィールドがデータを格納する方法の例を次に示します。

```json
{
  "tags": ["pop", "rock", "classic"],
  "ratings": [5, 4, 3]
}
```

## 制限\{#limits}

- **デフォルト値**: ARRAY フィールドはデフォルト値をサポートしていません。ただし、`nullable` 属性を `True` に設定すると、null 値を許可できます。詳細は、[Nullable & Default](./nullable-fields) を参照してください。

- <strong>データ型:</strong> ARRAY フィールド内のすべての要素は、`element_type` パラメータで定義される同じデータ型を共有する必要があります。`element_type` が `VARCHAR` に設定されている場合は、配列要素の `max_length` も指定する必要があります。`element_type` は任意のスカラーデータ型、`JSON`、および `STRUCT` を受け入れます。

- **配列容量**: ARRAY フィールド内の要素数は、Array の作成時に `max_capacity` で定義された最大容量以下である必要があります。値は **1** から **4096** の範囲内の整数である必要があります。

- **文字列の扱い**: Array フィールド内の文字列値は、意味的なエスケープや変換を行わずにそのまま格納されます。たとえば、`'a"b'`、`"a'b"`、`'a\'b'`、`"a\"b"` は入力どおりに格納されますが、`'a'b'` と `"a"b"` は無効な値と見なされます。

## ARRAY フィールドを追加する\{#add-array-field}

Zilliz Cloud クラスターで ARRAY フィールドを使用するには、コレクションスキーマの作成時に関連するフィールド型を定義します。このプロセスには以下が含まれます。

1. `datatype` を、サポートされている Array データ型 `ARRAY` に設定します。

1. `element_type` パラメータを使用して、配列内の要素のデータ型を指定します。同じ配列内のすべての要素は同じデータ型である必要があります。

1. `max_capacity` パラメータを使用して、配列の最大容量、つまり含めることができる要素の最大数を定義します。

ARRAY フィールドを含むコレクションスキーマを定義する方法を次に示します。

<Admonition type="info" title="Notes">

スキーマを定義する際に `enable_dynamic_fields=True` を設定すると、Zilliz Cloud では、事前に定義されていないスカラーフィールドを挿入できます。ただし、これによりクエリと管理が複雑になり、パフォーマンスに影響する可能性があります。詳細は、[Dynamic Field](./enable-dynamic-field) を参照してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

# Add `tags` and `ratings` ARRAY fields with nullable=True
schema.add_field(field_name="tags", datatype=DataType.ARRAY, element_type=DataType.VARCHAR, max_capacity=10, max_length=65535, nullable=True)
schema.add_field(field_name="ratings", datatype=DataType.ARRAY, element_type=DataType.INT64, max_capacity=5, nullable=True)
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
        .maxLength(65535)
        .isNullable(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("ratings")
        .dataType(DataType.Array)
        .elementType(DataType.Int64)
        .maxCapacity(5)
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

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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
    WithName("tags").
    WithDataType(entity.FieldTypeArray).
    WithElementType(entity.FieldTypeVarChar).
    WithMaxCapacity(10).
    WithMaxLength(65535).
    WithNullable(true),
).WithField(entity.NewField().
    WithName("ratings").
    WithDataType(entity.FieldTypeArray).
    WithElementType(entity.FieldTypeInt64).
    WithMaxCapacity(5).
    WithNullable(true),
).WithField(entity.NewField().
    WithName("pk").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(3),
)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let schema = CollectionSchema::new()
        .enable_dynamic_field(true)
        .add_field(
            FieldSchema::new()
                .name("tags")
                .data_type(DataType::Array)
                .element_type(DataType::VarChar)
                .max_capacity(10)
                .max_length(65535)
                .nullable(true),
        )
        .add_field(
            FieldSchema::new()
                .name("ratings")
                .data_type(DataType::Array)
                .element_type(DataType::Int64)
                .max_capacity(5)
                .nullable(true),
        )
        .add_field(
            FieldSchema::new()
                .name("pk")
                .data_type(DataType::Int64)
                .primary_key(true),
        )
        .add_field(
            FieldSchema::new()
                .name("embedding")
                .data_type(DataType::FloatVector)
                .dimension(3),
        );
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <memory>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("tags", milvus::DataType::ARRAY)
                                    .WithMaxCapacity(10)
                                    .WithElementType(milvus::DataType::VARCHAR)
                                    .WithMaxLength(65535)
                                    .WithNullable(true));
schema->AddField(milvus::FieldSchema("ratings", milvus::DataType::ARRAY)
                                    .WithMaxCapacity(5)
                                    .WithElementType(milvus::DataType::INT64)
                                    .WithNullable(true));
schema->AddField(milvus::FieldSchema("pk", milvus::DataType::INT64).WithPrimaryKey(true));
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(3));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const schema = [
    {
        name: "tags",
        data_type: DataType.Array,
        element_type: DataType.VarChar,
        max_capacity: 10,
        max_length: 65535,
        nullable: true
    },
    {
        name: "ratings",
        data_type: DataType.Array,
        element_type: DataType.Int64,
        max_capacity: 5,
        nullable: true
    },
    {
        name: "pk",
        data_type: DataType.Int64,
        is_primary_key: true
    },
    {
        name: "embedding",
        data_type: DataType.FloatVector,
        dim: 3
    }
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
        "max_length": 65535
    },
    "nullable": true
}'

export arrayField2='{
    "fieldName": "ratings",
    "dataType": "Array",
    "elementDataType": "Int64",
    "elementTypeParams": {
        "max_capacity": 5
    },
    "nullable": true
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
    \"enableDynamicField\": true,
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

## インデックスパラメータを設定する\{#set-index-params}

インデックスの作成は、検索とクエリのパフォーマンスの向上に役立ちます。Zilliz Cloud クラスターでは、ベクトルフィールドのインデックス作成は必須ですが、スカラーフィールドでは任意です。

次の例では、ベクトルフィールド `embedding` と ARRAY フィールド `tags` の両方に、`AUTOINDEX` インデックスタイプを使用してインデックスを作成します。このタイプを使用すると、Milvus がデータ型に基づいて最適なインデックスを自動的に選択します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params
index_params = client.prepare_index_params()

# Index `tags` with AUTOINDEX
index_params.add_index(
    field_name="tags",
    index_type="AUTOINDEX",
    index_name="tags_index"
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
import (
    "github.com/milvus-io/milvus/client/v3/entity"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

indexOpt1 := milvusclient.NewCreateIndexOption("my_collection", "tags", index.NewInvertedIndex()).WithIndexName("tags_index")
indexOpt2 := milvusclient.NewCreateIndexOption("my_collection", "embedding", index.NewAutoIndex(entity.COSINE))
```

</TabItem>

<TabItem value='rust'>

```rust
let tags_index = IndexParam::new()
    .field_name("tags")
    .index_name("tags_index")
    .index_type(IndexType::AutoIndex);

let embedding_index = IndexParam::new()
    .field_name("embedding")
    .index_type(IndexType::AutoIndex)
    .metric_type(MetricType::Cosine);
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <vector>

std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("tags", "tags_index", milvus::IndexType::AUTOINDEX),
    milvus::IndexDesc("embedding", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { IndexType, MetricType } from "@zilliz/milvus2-sdk-node";

const indexParams = [{
    index_name: 'tags_index',
    field_name: 'tags',
    index_type: IndexType.AUTOINDEX
}, {
    field_name: 'embedding',
    index_type: IndexType.AUTOINDEX,
    metric_type: MetricType.COSINE
}];
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "tags",
            "indexName": "tags_index",
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

## コレクションを作成する\{#create-collection}

スキーマとインデックスを定義したら、ARRAY フィールドを含むコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)

# Load the collection into memory before performing searches and queries
client.load_collection(collection_name="my_collection")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.LoadCollectionReq;

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
    WithIndexOptions(indexOpt1, indexOpt2))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}

_, err = client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.create_collection(
    CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .build()?,
).await?;

// Rust creates indexes with separate create_index calls after creating the collection
client.create_index(
    CreateIndexRequest::builder()
        .collection_name("my_collection")
        .index_param(tags_index)
        .index_param(embedding_index)
        .build()?,
).await?;

client.load_collection(
    LoadCollectionRequest::builder()
        .collection_name("my_collection")
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("my_collection")
                                    .WithIndexes(std::move(indexes))
                                    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->LoadCollection(milvus::LoadCollectionRequest()
                                .WithCollectionName("my_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
    collection_name: "my_collection",
    schema: schema,
    index_params: indexParams
});

await client.loadCollection({
    collection_name: "my_collection"
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## データを挿入する\{#insert-data}

コレクションを作成したら、ARRAY フィールドを含むデータを挿入できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import (
    "github.com/milvus-io/milvus/client/v3/column"
)

column1 := column.NewColumnVarCharArray("tags", [][]string{{"pop", "rock", "classic"}})
column1.SetNullable(true)
column1.AppendNull()
column1.AppendNull()
column2 := column.NewColumnInt64Array("ratings", [][]int64{{5, 4, 3}, {4, 5}, {9, 5}})

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

<TabItem value='rust'>

```rust
use serde_json::json;

let rows = vec![
    json!({
        "tags": ["pop", "rock", "classic"],
        "ratings": [5, 4, 3],
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    }),
    json!({
        "tags": None::<String>,
        "ratings": [4, 5],
        "pk": 2,
        "embedding": [0.78, 0.91, 0.23]
    }),
    json!({
        "ratings": [9, 5],
        "pk": 3,
        "embedding": [0.18, 0.11, 0.23]
    }),
];

client.insert(
    InsertRequest::builder()
        .collection_name("my_collection")
        .rows(rows)
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <string>
#include <vector>

milvus::EntityRows data = {{{"pk", 1}, {"tags", std::vector<std::string>{"pop", "rock", "classic"}}, {"ratings", std::vector<int64_t>{5, 4, 3}}, {"embedding", std::vector<float>{0.12, 0.34, 0.56}}},
                           {{"pk", 2}, {"tags", nullptr}, {"ratings", std::vector<int64_t>{4, 5}}, {"embedding", std::vector<float>{0.78, 0.91, 0.23}}},
                           {{"pk", 3}, {"ratings", std::vector<int64_t>{9, 5}}, {"embedding", std::vector<float>{0.18, 0.11, 0.23}}}};

milvus::InsertResponse insert_response;
status = client->Insert(milvus::InsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(data)),
                        insert_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
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
        "tags": null,
        "ratings": [4, 5],
        "pk": 2,
        "embedding": [0.78, 0.91, 0.23]
    },
    {
        "ratings": [9, 5],
        "pk": 3,
        "embedding": [0.18, 0.11, 0.23]
    }
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
--header "Request-Timeout: 10" \
-d '{
    "data": [
        {
            "tags": ["pop", "rock", "classic"],
            "ratings": [5, 4, 3],
            "pk": 1,
            "embedding": [0.12, 0.34, 0.56]
        },
        {
            "tags": null,
            "ratings": [4, 5],
            "pk": 2,
            "embedding": [0.78, 0.91, 0.23]
        },
        {
            "ratings": [9, 5],
            "pk": 3,
            "embedding": [0.18, 0.11, 0.23]
        }
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

完全な配列を挿入するだけでなく、`ARRAY` フィールドは `upsert` API 上の `ARRAY_APPEND` および `ARRAY_REMOVE` 部分更新演算子もサポートしています。これらの演算子を使用すると、既存の配列の現在値を取得することなく、要素の追加や一致する要素の削除ができるため、クライアント側の read-modify-write パターンを回避できます。詳細は、[Upsert array fields in merge mode](./upsert-entities#upsert-array-fields-in-merge-mode) を参照してください。

</Admonition>

## フィルター式を使ったクエリ\{#query-with-filter-expressions}

エンティティを挿入したら、`query` メソッドを使用して、指定したフィルター式に一致するエンティティを取得します。

`tags` が null でないエンティティを取得するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query entities where `tags` is not null
filter = 'tags IS NOT NULL'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["tags", "ratings", "pk"]
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

String filter = "tags IS NOT NULL";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("tags", "ratings", "pk"))
        .build());

System.out.println(resp.getQueryResults());
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

<TabItem value='rust'>

```rust
let query_results = client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("tags IS NOT NULL")
            .output_fields(["tags", "ratings", "pk"])
            .build()?,
    )
    .await?;
for row in query_results.results().get_output_rows()? {
    println!("{:?}", row);
}
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::QueryResponse query_response;
status = client->Query(milvus::QueryRequest()
                        .WithCollectionName("my_collection")
                        .WithFilter("tags IS NOT NULL")
                        .AddOutputField("tags")
                        .AddOutputField("ratings")
                        .AddOutputField("pk"),
                        query_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::EntityRows output_rows;
status = query_response.Results().OutputRows(output_rows);
for (const auto& row : output_rows) {
    std::cout << "	" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
    collection_name: 'my_collection',
    filter: 'tags IS NOT NULL',
    output_fields: ['tags', 'ratings', 'pk']
});

console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "filter": "tags IS NOT NULL",
    "outputFields": ["tags", "ratings", "pk"]
}'
```

</TabItem>
</Tabs>

`ratings` の最初の要素の値が 4 より大きいエンティティを取得するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'ratings[0] > 4'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["tags", "ratings", "embedding"]
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ratings[0] > 4";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("tags", "ratings", "embedding"))
        .build());

System.out.println(resp.getQueryResults());
```

</TabItem>

<TabItem value='go'>

```go
filter = "ratings[0] > 4"
rs, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("tags", "ratings", "embedding"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("pk", rs.GetColumn("pk").FieldData().GetScalars())
fmt.Println("tags", rs.GetColumn("tags").FieldData().GetScalars())
fmt.Println("ratings", rs.GetColumn("ratings").FieldData().GetScalars())
```

</TabItem>

<TabItem value='rust'>

```rust
let query_results = client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("ratings[0] > 4")
            .output_fields(["tags", "ratings", "embedding"])
            .build()?,
    )
    .await?;
for row in query_results.results().get_output_rows()? {
    println!("{:?}", row);
}
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->Query(milvus::QueryRequest()
                        .WithCollectionName("my_collection")
                        .WithFilter("ratings[0] > 4")
                        .AddOutputField("tags")
                        .AddOutputField("ratings")
                        .AddOutputField("embedding"),
                        query_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = query_response.Results().OutputRows(output_rows);
for (const auto& row : output_rows) {
    std::cout << "	" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ratings[0] > 4';

const res = await client.query({
    collection_name: "my_collection",
    filter: filter,
    output_fields: ["tags", "ratings", "embedding"]
});

console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
  "collectionName": "my_collection",
  "filter": "ratings[0] > 4",
  "outputFields": ["tags", "ratings", "embedding"]
}'
```

</TabItem>
</Tabs>

## フィルター式を使ったベクトル検索\{#vector-search-with-filter-expressions}

基本的なスカラーフィールドのフィルタリングに加えて、ベクトル類似度検索とスカラーフィールドフィルターを組み合わせることもできます。たとえば、次のコードは、ベクトル検索にスカラーフィールドフィルターを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

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

<TabItem value='rust'>

```rust
let search_results = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("embedding")
            .vectors(SearchVectors::Float(vec![vec![0.3f32, -0.6, 0.1]]))
            .filter("tags[0] == \"pop\"")
            .output_fields(["tags", "ratings", "embedding"])
            .limit(5)
            .build()?,
    )
    .await?;
for result in search_results.results().iter() {
    for row in result.get_output_rows()? {
        println!("{:?}", row);
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3, -0.6, 0.1};
milvus::SearchResponse search_response;
status = client->Search(milvus::SearchRequest()
                            .WithCollectionName("my_collection")
                            .WithAnnsField("embedding")
                            .WithLimit(5)
                            .WithFilter(R"(tags[0] == "pop")")
                            .AddOutputField("tags")
                            .AddOutputField("ratings")
                            .AddOutputField("embedding")
                            .AddFloatVector(query_vector),
                        search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto search_results = search_response.Results();
for (const auto& result : search_results.Results()) {
    milvus::EntityRows result_rows;
    status = result.OutputRows(result_rows);
    for (const auto& row : result_rows) {
        std::cout << "	" << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['tags', 'ratings', 'embedding'],
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
--header "Request-Timeout: 10" \
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
```

</TabItem>
</Tabs>

また、Zilliz Cloud は、クエリ機能をさらに強化するために、`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、`ARRAY_LENGTH` などの高度な Array フィルタリング演算子をサポートしています。詳細は、[ARRAY Operators](./array-filtering-operators) を参照してください。
