---
title: "NULL 許容フィールド | Cloud"
slug: /nullable-fields
sidebar_label: "NULL 許容フィールド"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は NULL 許容フィールドをサポートしています。NULL 許容フィールドでは、フィールド値を欠落させたり、明示的に NULL に設定したりできます。NULL 許容性はスキーマレベルで定義され、データの取り込み、インデックス作成、検索、クエリの各操作に一貫して適用されます。 | Cloud"
type: origin
token: DjROwgK6ziCf7Rkoji6ccyEUnsg
sidebar_position: 15
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# NULL 許容フィールド

Zilliz Cloud は NULL 許容フィールドをサポートしています。これにより、フィールド値を欠落させたり、明示的に NULL に設定したりできます。NULL 許容性はスキーマレベルで定義され、データの取り込み、インデックス作成、検索、クエリの各操作に一貫して適用されます。

NULL 許容フィールドは、次のような場合に使用します：

- 欠落した値が許容される外部システムからデータが取り込まれる場合

- 一部のメタデータが任意であり、データセットの一部でのみ使用可能である場合

- ベクトル埋め込みが非同期で生成され、後から挿入される場合

## 制限事項\{#limits}

- Zilliz Cloud では、NULL 許容 StructArray フィールドは、3.0.x ラインの Milvus 3.0.0 以降を実行するオンデマンドクラスターでサポートされています。Serving クラスターは NULL 許容 StructArray フィールドをサポートしていません。`nullable=True` は、個々のサブフィールドではなく、親の StructArray フィールドに設定してください。NULL は個々の Struct 要素ではなく StructArray フィールド全体に適用され、親の設定は内部でサブフィールドに伝播されます。既存のコレクションに追加する StructArray フィールドは NULL 許容である必要があります。これにより、既存のエンティティが新しいフィールドに対して NULL を返せるようになります。詳細は、[StructArray Limits](./struct-array-limits) を参照してください。

- `nullable` 属性はフィールドの作成時に定義され、後から変更することはできません。既存のフィールドに対して NULL 許容を有効化または無効化することはできません。

- NULL 許容としてマークされたフィールドは、パーティションキーとして使用できません。パーティションキーフィールドには常に有効な非 NULL 値を含める必要があります。

## NULL 許容フィールドとは？\{#what-is-a-nullable-field}

Zilliz Cloud では、フィールドが NULL 値を格納できるかどうかは、`nullable` という名前のスキーマレベルのフィールド属性によって制御されます。

フィールドが `nullable=True` で定義されている場合、Zilliz Cloud はデータの取り込み時にフィールド値が欠落していることを許可します。実際には、Zilliz Cloud は次の2つの入力を同等として扱い、フィールド値を NULL として格納します：

- 入力エンティティからフィールドが省略されている

- フィールドが明示的に NULL に設定されている（たとえば、Python の `None`）

フィールドが NULL 許容として定義されていない場合（デフォルトの動作）、すべてのエンティティはそのフィールドに有効な値を指定する必要があります。フィールドを省略したり、明示的に NULL 値を割り当てたりすると、挿入またはインポート操作が失敗します。

NULL 許容属性は、コレクションスキーマ内の **スカラーフィールドとベクトルフィールド** の両方でサポートされています。サポートされているオンデマンドクラスターでは、親の StructArray フィールドでもサポートされています。Struct サブフィールドを個別に NULL 許容として構成しないでください。StructArray の親で NULL 許容性を定義すると、その設定は内部でサブフィールドに伝播されます。

<Admonition type="info" title="Notes">

NULL 許容性はフィールド値が欠落する可能性があるかどうかを決定しますが、フィールドが欠落しているときにどの値が使用されるかは定義しません。

- NULL 許容フィールドがデフォルト値なしで構成されている場合、フィールドを省略すると NULL 値が格納されます。

- デフォルト値が構成されている場合、Zilliz Cloud は代わりにデフォルト値を格納することがあります。詳細は、[Default Values](./default-fields) を参照してください。

</Admonition>

## コレクションスキーマで NULL 許容フィールドを定義する\{#define-a-nullable-field-in-the-collection-schema}

NULL 許容フィールドを使用するには、コレクションスキーマを定義するときに `nullable` 属性を有効にする必要があります。

この例では、コレクションスキーマは `nullable=True` を持つ `embedding` という名前のベクトルフィールドを定義しています。これにより、コレクション内のエンティティは、データの取り込み時にベクトル値を省略したり、明示的に NULL に設定したりできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let schema = CollectionSchema::new()
        .add_field(
            FieldSchema::new()
                .name("id")
                .data_type(DataType::Int64)
                .primary_key(true),
        )
        .add_field(
            FieldSchema::new()
                .name("embedding")
                .data_type(DataType::FloatVector)
                .dimension(4)
                // highlight-next-line
                .nullable(true),
        );

    client.create_collection(
        CreateCollectionRequest::builder()
            .collection_name("my_collection")
            .schema(schema)
            .build()?,
    ).await?;
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
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64).WithPrimaryKey(true));
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(4).WithNullable(true));

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("my_collection")
                                    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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
            "dim": 4
          },
          "nullable": true
        }
      ]
    }
  }'
```

</TabItem>
</Tabs>

このスキーマでは：

- `embedding` フィールドは明示的に NULL 許容としてマークされています。

- エンティティは、挿入時に `embedding` フィールドを省略したり、NULL 値を割り当てたりできます。

- NULL 値を許可するかどうかの決定は、コレクション作成時に固定されます。

明確にするため、以降の例では NULL 許容ベクトルフィールド（`embedding`）に焦点を当てます。NULL 許容スカラーフィールドの定義は任意であり、このガイドの残りの部分を読み進めるために必須ではありません。

<details>

<summary>**オプション: NULL 許容スカラーフィールドを定義する**</summary>

スカラーフィールドも、同じ `nullable` 属性を使用して NULL 許容として定義でき、取り込み時に同じルールに従います。たとえば：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
let schema = schema.add_field(
    FieldSchema::new()
        .name("age")
        .data_type(DataType::Int64)
        // highlight-next-line
        .nullable(true),
);
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("age", milvus::DataType::INT64).WithNullable(true));
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

## 値が欠落している場合または NULL 値の場合の挿入動作\{#insert-behavior-with-missing-or-null-values}

コレクションスキーマでフィールドが NULL 許容として定義されると、Zilliz Cloud はデータの取り込み時にフィールド値が欠落していること、または明示的に NULL に設定されていることを許可します。

次の例では、[ステップ 1](./nullable-fields#define-a-nullable-field-in-the-collection-schema) で作成したコレクションに3つのエンティティを挿入し、これらのさまざまなケースを示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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

<TabItem value='rust'>

```rust
use serde_json::json;

let rows = vec![
    json!({"id": 1, "embedding": [0.1, 0.2, 0.3, 0.4]}),
    json!({"id": 2, "embedding": None::<Vec<f32>>}),
    json!({"id": 3}),
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
#include <vector>

milvus::EntityRows data = {
    {{"id", 1}, {"embedding", std::vector<float>{0.1, 0.2, 0.3, 0.4}}},
    {{"id", 2}, {"embedding", nullptr}},
    {{"id", 3}},
};

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

この例では：

- エンティティ **id = 1** は有効なベクトル値を提供します。

- エンティティ **id = 2** は、embedding フィールドに明示的に NULL 値を割り当てます。

- エンティティ **id = 3** は embedding フィールドを完全に省略します。Zilliz Cloud はそれを NULL として格納します。

## NULL 許容フィールドのインデックス動作\{#index-behavior-on-nullable-fields}

データを挿入した後は、通常どおり NULL 許容フィールドにインデックスを構築できます。主な違いは、インデックス構築中に Zilliz Cloud が NULL 値をどのように処理するかです：

- 非 NULL 値を持つエンティティのみがインデックスに追加されます。

- NULL 値を持つエンティティはスキップされ、インデックス構築には参加しません。

NULL 許容ベクトルフィールドの場合、これは有効なベクトルを持つエンティティのみがベクトル類似度で検索可能になることを意味します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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

<TabItem value='rust'>

```rust
client.create_index(
    CreateIndexRequest::builder()
        .collection_name("my_collection")
        .index_param(
            IndexParam::new()
                .field_name("embedding")
                .index_type(IndexType::AutoIndex)
                .metric_type(MetricType::Cosine),
        )
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
status = client->CreateIndex(milvus::CreateIndexRequest()
                                .WithCollectionName("my_collection")
                                .AddIndex(milvus::IndexDesc("embedding", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE))
                                .WithSync(true));
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

この時点では：

- 有効な `embedding` 値を持つエンティティはインデックス化され、検索可能な状態になります。

- `embedding` が NULL であるエンティティはコレクション内に残りますが、ベクトルインデックスには含まれません。

## NULL 許容フィールドの検索動作\{#search-behavior-with-nullable-fields}

NULL 許容フィールドに対して検索操作を実行すると、Zilliz Cloud は検索に使用するフィールドの非 NULL 値を持つエンティティのみを評価します。ベクトルフィールドが NULL であるエンティティは自動的にスキップされます。

この例の `embedding` のような NULL 許容ベクトルフィールドの場合：

- 有効なベクトル値を持つエンティティのみが評価され、ランク付けされます。

- NULL ベクトルを持つエンティティはエラーを引き起こしません。

- 有効なベクトルの数が要求された topK（`limit`）より少ない場合、Zilliz Cloud は `limit` より少ない結果を返すことがあります。

次の例では、NULL 許容ベクトルフィールド `embedding` に対してベクトル検索を実行します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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

<TabItem value='rust'>

```rust
let search_results = client.search(
    SearchRequest::builder()
        .collection_name("my_collection")
        .vector_field("embedding")
        .vectors(SearchVectors::Float(vec![vec![0.1f32, 0.2, 0.3, 0.4]]))
        .output_fields(["embedding"])
        .limit(3)
        .build()?,
).await?;
for result in search_results.results().iter() {
    for row in result.get_output_rows()? {
        println!("{:?}", row);
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <vector>

std::vector<float> query_vector = {0.1, 0.2, 0.3, 0.4};
milvus::SearchResponse search_response;
status = client->Search(milvus::SearchRequest()
                            .WithCollectionName("my_collection")
                            .WithAnnsField("embedding")
                            .WithLimit(3)
                            .AddOutputField("embedding")
                            .AddFloatVector(query_vector),
                        search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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

この検索では：

- 非 NULL の `embedding` 値を持つエンティティのみが候補と見なされます。

- `embedding` に NULL 値を持つエンティティは評価から除外されます。

- 返される結果の数は、コレクション内に存在する有効なベクトルの数によって異なります。

## クエリとフィルタリングへの影響\{#query-and-filtering-implications}

これまでの例ではベクトルフィールドに焦点を当てました。次の例では、通常の比較フィルターがスカラーフィールドの NULL 値をどのように扱うかを示します。

スカラーフィールドは `nullable=True` で定義でき、ベクトルフィールドと同じ取り込みルールに従います。`age > 18` や `status == "active"` などの通常の比較フィルターは NULL 値に一致しません。サポート対象のフィールドが NULL かどうかに基づいてエンティティを明示的に選択するには、`IS NULL` または `IS NOT NULL` を使用します。

たとえば、NULL 許容スカラーフィールド `age` がある場合、次のフィルターは `age` が 18 より大きいエンティティを選択します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
filter := "age > 18"
```

</TabItem>

<TabItem value='rust'>

```rust
let expr = "age > 18";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string expr = "age > 18";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'age > 18';
```

</TabItem>

<TabItem value='bash'>

```bash
"filter": "age > 18"
```

</TabItem>
</Tabs>

`age` が NULL であるエンティティは、NULL 値がフィルター条件を満たさないため、結果から除外されます。

同様に、等価チェックは NULL 値に一致しません。たとえば：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
filter := `status == "active"`
```

</TabItem>

<TabItem value='rust'>

```rust
let expr = "status == \"active\"";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string expr = "status == \"active\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'status == "active"';
```

</TabItem>

<TabItem value='bash'>

```bash
"filter": "status == \"active\""
```

</TabItem>
</Tabs>

`status` が NULL であるエンティティは結果から除外されます。

## 適用されるルール\{#applicable-rules}

フィールドに `nullable` と `default_value` の両方が構成されている場合、次のルールは、挿入時に Zilliz Cloud が NULL 入力または欠落したフィールド値をどのように処理するかを決定します。

| NULL 許容 | デフォルト値 | ユーザー入力 | 結果 |
| --- | --- | --- | --- |
| ✅ | ✅（非 NULL） | NULL または省略 | デフォルト値を使用する |
| ✅ | ❌ | NULL または省略 | NULL として格納される |
| ❌ | ✅（非 NULL） | NULL または省略 | デフォルト値を使用する |
| ❌ | ❌ | NULL または省略 | エラーがスローされる |
| ❌ | ✅（NULL） | NULL または省略 | エラーがスローされる |

**重要なポイント：**

- フィールドに非 NULL のデフォルト値がある場合、`nullable` が有効かどうかに関係なく、その値が使用されます。

- `nullable=True` であるがデフォルト値が設定されていない場合、フィールドは NULL を格納します。

- `nullable=False` でデフォルト値が設定されていない場合、挿入はエラーで失敗します。

- NULL 非許容フィールドに NULL のデフォルト値を設定することは無効であり、エラーが発生します。

