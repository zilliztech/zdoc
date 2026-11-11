---
title: "NULL 許容フィールド | BYOC"
slug: /nullable-fields
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマ、挿入、インデックス、検索、フィルターの動作を含め、NULL 許容フィールドとデフォルト値を構成します。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-nullable-fields
sidebar_label: "NULL 許容フィールド"
sidebar_position: 15
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/nullable-and-default.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# NULL 許容フィールド

Zilliz Cloud は NULL 許容フィールドをサポートしており、フィールド値を欠落させるか、明示的に NULL に設定できます。NULL 許容性はスキーマレベルで定義され、データの取り込み、インデックス作成、検索、クエリの各操作に一貫して適用されます。

NULL 許容フィールドは、次の場合に使用します。

- 値の欠落を許容する外部システムからデータを取り込みます。
- 一部のメタデータは任意であるか、データセットの一部でのみ利用可能です。
- ベクトル埋め込みは非同期で生成され、後から挿入されます。

## 制限\{#limits}

- NULL 値を許可するベクトルフィールドでは、`IS NULL` または `IS NOT NULL` のフィルター式はサポートされません。ベクトルフィールドの値が NULL かどうかに基づいてエンティティを明示的にフィルターすることはできません。

- Zilliz Cloud では、NULL 許容の StructArray フィールドは On-Demand クラスターでサポートされています。Serving クラスターでは、NULL 許容の StructArray フィールドはサポートされていません。`nullable=True` を個々のサブフィールドではなく、親の StructArray フィールドに設定してください。NULL は個々の Struct 要素ではなく、StructArray フィールド全体に適用され、親の設定は内部的にそのサブフィールドへ伝播されます。既存のコレクションに追加する StructArray フィールドは、既存のエンティティが新しいフィールドに対して NULL を返せるよう、NULL 許容である必要があります。要素レベルの NULL 値は、Zilliz Cloud クラスターではまだ利用できません。詳細は、[StructArray の制限](./struct-array-limits#nullable-and-dynamic-schema-limits) を参照してください。

- `nullable` 属性はフィールドの作成時に定義され、後から変更できません。既存のフィールドに対して NULL 許容性を有効または無効にすることはできません。

- NULL 許容としてマークされたフィールドは、パーティションキーとして使用できません。パーティションキーフィールドには常に有効な非 NULL 値を含める必要があります。詳細は、[Use Partition Key](./use-partition-key) を参照してください。

## NULL 許容フィールドとは\{#what-is-a-nullable-field}

Zilliz Cloud では、フィールドに NULL 値を格納できるかどうかは、`nullable` という名前のスキーマレベルのフィールド属性で制御されます。

フィールドが `nullable=True` で定義されている場合、Zilliz Cloud はデータの取り込み中にフィールド値が欠落することを許可します。実際には、Zilliz Cloud は次の 2 つの入力を同等として扱い、フィールド値を NULL として格納します。

- 入力エンティティからフィールドが省略されます。
- フィールドが明示的に NULL に設定されます（たとえば、Python の `None`）。

フィールドが NULL 許容として定義されていない場合（デフォルトの動作）、すべてのエンティティはそのフィールドに有効な値を指定する必要があります。フィールドを省略するか、明示的に NULL 値を割り当てると、挿入またはインポート操作が失敗します。

nullable 属性は、コレクションスキーマ内の**スカラーフィールドとベクトルフィールドの両方**でサポートされています。サポート対象の On-Demand クラスターでは、親の StructArray フィールドでもサポートされています。Struct のサブフィールドを個別に NULL 許容として構成しないでください。StructArray の親で NULL 許容性を定義すると、その設定は内部的にサブフィールドへ伝播されます。要素レベルの NULL 値は、Zilliz Cloud クラスターではまだ利用できません。

<Admonition type="info" icon="📘" title="Notes">

NULL 許容性はフィールド値が欠落する可能性があるかどうかを決定しますが、フィールドが欠落したときに使用される値は定義しません。

- NULL 許容フィールドがデフォルト値なしで構成されている場合、フィールドを省略すると NULL 値が格納されます。
- デフォルト値が構成されている場合、Zilliz Cloud は代わりにデフォルト値を格納することがあります。詳細は、[デフォルト値](./default-fields) を参照してください。

</Admonition>

## コレクションスキーマで NULL 許容フィールドを定義する\{#define-a-nullable-field-in-the-collection-schema}

NULL 許容フィールドを使用するには、コレクションスキーマを定義するときに NULL 許容属性を有効にする必要があります。

この例では、コレクションスキーマで `nullable=True` を指定した `embedding` という名前のベクトルフィールドを定義します。これにより、コレクション内のエンティティは、データの取り込み中にベクトル値を省略するか、明示的に NULL に設定できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Define schema fields
schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True)  # Primary field
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
    # highlight-next-line
    nullable=True,  # Enable the nullable attribute; defaults to False
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
```

</TabItem>

<TabItem value='c++'>

```cpp
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
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createCollection({
  collection_name: "my_collection",
  fields: [
    {
      name: "id",
      data_type: DataType.Int64,
      is_primary_key: true,
      autoID: false,
    },
    {
      name: "embedding",
      data_type: DataType.FloatVector,
      dim: 4,
      nullable: true,
    },
  ],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});

// Define schema fields
var schema = new CollectionSchema { Name = "my_collection" };
schema.Fields.Add(new FieldSchema("id", DataType.Int64, isPrimaryKey: true)); // Primary field
schema.Fields.Add(new FieldSchema("embedding", DataType.FloatVector) { Dimension = 4, Nullable = true }); // Enable the nullable attribute; defaults to false

await client.CreateCollectionAsync(new CreateCollectionReq { CollectionName = "my_collection", Schema = schema });
```

</TabItem>

<TabItem value='bash'>

```bash
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export pkField='{
  "fieldName": "id",
  "dataType": "Int64",
  "isPrimary": true
}'

export embeddingField='{
  "fieldName": "embedding",
  "dataType": "FloatVector",
  "elementTypeParams": {"dim": 4},
  "nullable": true
}'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"my_collection\",
    \"schema\": {
      \"fields\": [
        $pkField,
        $embeddingField
      ]
    }
  }"
```

</TabItem>

</Tabs>

このスキーマでは、次のようになります。

- `embedding` フィールドは明示的に NULL 許容としてマークされています。
- エンティティは、挿入時に `embedding` フィールドを省略するか、NULL 値を割り当てることができます。
- NULL 値を許可するかどうかは、コレクションの作成時に固定されます。

明確にするため、以降の例では NULL 許容のベクトルフィールド（`embedding`）に焦点を当てます。NULL 許容のスカラーフィールドの定義は任意であり、このガイドの残りの手順に従うために必要ではありません。

<details>
<summary>任意：NULL 許容スカラーフィールドを定義する</summary>

スカラーフィールドも、同じ `nullable` 属性を使用して NULL 許容として定義でき、取り込み時には同じルールに従います。例は以下の通りです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
    WithNullable(true),
)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

```cpp
schema->AddField(milvus::FieldSchema("age", milvus::DataType::INT64).WithNullable(true));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Add to the fields array when calling createCollection:
// { name: "age", data_type: DataType.Int64, nullable: true },
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

schema.Fields.Add(new FieldSchema("age", DataType.Int64) { Nullable = true });
```

</TabItem>

<TabItem value='bash'>

```bash
# Add another field object to the schema "fields" array, for example:
# { "fieldName": "age", "dataType": "Int64", "nullable": true }
```

</TabItem>

</Tabs>

</details>

## 値の欠落または NULL を使用した場合の挿入動作\{#insert-behavior-with-missing-or-null-values}

コレクションスキーマでフィールドが NULL 許容として定義されると、Zilliz Cloud はデータの取り込み中にフィールド値が欠落するか、明示的に NULL に設定されることを許可します。

次の例では、[コレクションスキーマで NULL 許容フィールドを定義する](#define-a-nullable-field-in-the-collection-schema) で作成したコレクションに 3 つのエンティティを挿入し、これらの異なるケースを示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {
        "id": 1,
        "embedding": [0.1, 0.2, 0.3, 0.4],
    },
    {
        "id": 2,
        "embedding": None,  # Explicitly set to NULL
    },
    {
        "id": 3,  # Field omitted → stored as NULL
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
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

// Assumes `client` is the Zilliz Cloud client from the Go schema example above.
ctx := context.Background()

rows := []any{
    map[string]any{"id": int64(1), "embedding": []float32{0.1, 0.2, 0.3, 0.4}},
    map[string]any{"id": int64(2), "embedding": nil},
    map[string]any{"id": int64(3)},
}

_, err := client.Insert(ctx, milvusclient.NewRowBasedInsertOption("my_collection", rows...))
if err != nil {
    fmt.Println(err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
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

```cpp
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
  { id: 1, embedding: [0.1, 0.2, 0.3, 0.4] },
  { id: 2, embedding: null },
  { id: 3 },
];

await client.insert({
  collection_name: "my_collection",
  data: data,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var data = new List<IDictionary<string, object?>>
{
    new Dictionary<string, object?> { ["id"] = 1L, ["embedding"] = new[] { 0.1f, 0.2f, 0.3f, 0.4f } },
    new Dictionary<string, object?> { ["id"] = 2L, ["embedding"] = null },   // Explicitly set to NULL
    new Dictionary<string, object?> { ["id"] = 3L },                         // Field omitted; stored as NULL
};

await client.InsertAsync(new InsertReq
{
    CollectionName = "my_collection",
    RowsData = data
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
    "collectionName": "my_collection",
    "data": [
      {"id": 1, "embedding": [0.1, 0.2, 0.3, 0.4]},
      {"id": 2, "embedding": null},
      {"id": 3}
    ]
  }'
```

</TabItem>

</Tabs>

この例では、次のようになります。

- エンティティ **id = 1** は有効なベクトル値を提供します。
- エンティティ **id = 2** は、`embedding` フィールドに NULL 値を明示的に割り当てます。
- エンティティ **id = 3** は、`embedding` フィールドを完全に省略します。Zilliz Cloud は、このフィールドを NULL として格納します。

## NULL 許容フィールドのインデックス動作\{#index-behavior-on-nullable-fields}

データを挿入した後、通常どおり NULL 許容フィールドにインデックスを構築できます。主な違いは、インデックス構築中に Zilliz Cloud が NULL 値をどのように処理するかです。

- 非 NULL 値を持つエンティティのみがインデックスに追加されます。
- NULL 値を持つエンティティはスキップされ、インデックスの構築には参加しません。

NULL 許容のベクトルフィールドの場合、これは有効なベクトルを持つエンティティのみがベクトル類似性で検索可能になることを意味します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

// Assumes `client` is the Zilliz Cloud client from the Go schema example above.
ctx := context.Background()

indexOption := milvusclient.NewCreateIndexOption("my_collection", "embedding",
    index.NewAutoIndex(entity.COSINE))

_, err := client.CreateIndex(ctx, indexOption)
if err != nil {
    fmt.Println(err.Error())
}

_, err = client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

```cpp
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
  collection_name: "my_collection",
  field_name: "embedding",
  index_name: "embedding_idx",
  index_type: "AUTOINDEX",
  metric_type: "COSINE",
});

await client.loadCollection({
  collection_name: "my_collection",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

await client.CreateIndexAsync(new CreateIndexReq
{
    CollectionName = "my_collection",
    Indexes = [new IndexParam("embedding", "embedding_index", IndexType.AutoIndex, MetricType.Cosine)]
});

// Load collection for future search operations
await client.LoadCollectionAsync(new LoadCollectionReq { CollectionName = "my_collection" });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  -d '{
    "collectionName": "my_collection",
    "indexParams": [
      {
        "fieldName": "embedding",
        "metricType": "COSINE",
        "indexType": "AUTOINDEX"
      }
    ]
  }'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --header "Request-Timeout: 10" \
  -d '{"collectionName": "my_collection"}'
```

</TabItem>

</Tabs>

この時点で、次のようになります。

- 有効な埋め込み値を持つエンティティはインデックスに登録され、検索可能になります。
- 埋め込みが NULL のエンティティはコレクションに残りますが、ベクトルインデックスには含まれません。

## NULL 許容フィールドの検索動作\{#search-behavior-with-nullable-fields}

NULL 許容フィールドに対して検索操作を実行すると、Zilliz Cloud は検索で使用するフィールドに非 NULL 値を持つエンティティのみを評価します。ベクトルフィールドが NULL のエンティティは自動的にスキップされます。

この例の `embedding` のような NULL 許容ベクトルフィールドの場合、次のようになります。

- 有効なベクトル値を持つエンティティのみが評価され、ランク付けされます。
- NULL ベクトルを持つエンティティがエラーを引き起こすことはありません。
- 有効なベクトルの数が要求された `topK`（`limit`）より少ない場合、Zilliz Cloud は `limit` より少ない結果を返すことがあります。

次の例では、NULL 許容ベクトルフィールド `embedding` に対してベクトル検索を実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="embedding",
    limit=3,
    search_params={"metric_type": "COSINE"},
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
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

// Assumes `client` is the Zilliz Cloud client from the Go schema example above.
ctx := context.Background()

query := []float32{0.1, 0.2, 0.3, 0.4}
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.FloatVector(query)},
).WithANNSField("embedding").
    WithOutputFields("embedding"))
if err != nil {
    fmt.Println(err.Error())
}
fmt.Println(resultSets)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

```cpp
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
  collection_name: "my_collection",
  data: [[0.1, 0.2, 0.3, 0.4]],
  anns_field: "embedding",
  limit: 3,
  search_params: { metric_type: "COSINE" },
  output_fields: ["embedding"],
});

console.log(res);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "my_collection",
    VectorFieldName = "embedding",
    Vectors = new[] { new ReadOnlyMemory<float>(new[] { 0.1f, 0.2f, 0.3f, 0.4f }) },
    Limit = 3,
    Parameters = new SearchParameters { OutputFields = { "embedding" } }
});

Console.WriteLine(res);
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
    "data": [[0.1, 0.2, 0.3, 0.4]],
    "annsField": "embedding",
    "limit": 3,
    "searchParams": {"metricType": "COSINE"},
    "outputFields": ["embedding"]
  }'
```

</TabItem>

</Tabs>

この検索では、次のようになります。

- 非 NULL の `embedding` 値を持つエンティティのみが候補として考慮されます。
- `embedding` が NULL 値のエンティティは評価から除外されます。
- 返される結果の数は、コレクション内に存在する有効なベクトルの数によって決まります。

## クエリとフィルタリングへの影響\{#query-and-filtering-implications}

これまでの例では、ベクトルフィールドに焦点を当ててきました。このセクションでは、**スカラーフィルター式**で NULL 値がどのように動作するかについて説明します。

スカラーフィールドは `nullable=True` で定義でき、ベクトルフィールドと同じ取り込みルールに従います。ただし、**NULL のスカラー値はフィルター式で常に false と評価されます**。スカラーフィールドが NULL かどうかでエンティティを選択するには、`IS NULL` または `IS NOT NULL` を使用します。

たとえば、NULL 許容のスカラーフィールド `age` がある場合、次のフィルターは age が 18 より大きいエンティティを選択します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

```cpp
std::string expr = "age > 18";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const expr = "age > 18";
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

string filter = "age > 18";
```

</TabItem>

<TabItem value='bash'>

```bash
# Use in query/search filter parameter, for example:
# "filter": "age > 18"
```

</TabItem>

</Tabs>

`age` が NULL のエンティティは、NULL 値がフィルター条件を満たさないため、結果から除外されます。

同様に、等価チェックは NULL 値に一致しません。例は以下の通りです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = 'status == "active"'
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

```cpp
std::string expr = "status == \"active\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const expr = 'status == "active"';
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

string filter = "status == \"active\"";
```

</TabItem>

<TabItem value='bash'>

```bash
# "filter": "status == \"active\""
```

</TabItem>

</Tabs>

`status` が NULL のエンティティは、結果から除外されます。

## NULL 許容フィールドとデフォルト値\{#nullable-fields-and-default-values}

フィールドに `nullable` と `default_value` の両方が構成されている場合、挿入時に Zilliz Cloud が NULL 入力または欠落したフィールド値をどのように処理するかは、次のルールで決まります。

| NULL 許容が有効 | デフォルト値 | ユーザー入力（NULL または省略） | 結果 |
| ---------------- | ------------- | ---------------------------- | -------- |
| はい | はい（非 NULL） | NULL または省略 | デフォルト値を使用します。 |
| はい | いいえ | NULL または省略 | NULL として格納します。 |
| いいえ | はい（非 NULL） | NULL または省略 | デフォルト値を使用します。 |
| いいえ | いいえ | NULL または省略 | エラーをスローします。 |
| いいえ | はい（NULL デフォルト） | NULL または省略 | エラーをスローします。 |

**主なポイント：**

- フィールドに非 NULL のデフォルト値がある場合、`nullable` が有効かどうかに関係なく、その値が使用されます。
- `nullable=True` でデフォルト値が設定されていない場合、フィールドには NULL が格納されます。
- `nullable=False` でデフォルト値が設定されていない場合、挿入はエラーで失敗します。
- NULL 以外を許容しないフィールドに NULL のデフォルト値を設定することは無効であり、エラーの原因になります。

デフォルト値の完全な例と API の使用方法については、[デフォルト値](./default-fields) を参照してください。
