---
title: "プライマリフィールドと AutoID | Cloud"
slug: /primary-field-auto-id
sidebar_label: "プライマリフィールド"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のすべてのコレクションには、各エンティティを一意に識別するためのプライマリフィールドが必要です。このフィールドにより、すべてのエンティティをあいまいさなく挿入、更新、クエリ、削除できます。 | Cloud"
type: origin
token: D2ctwKZhNilLY0ke1vpcHL62n5G
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# プライマリフィールドと AutoID

Zilliz Cloud のすべてのコレクションには、各エンティティを一意に識別するためのプライマリフィールドが必要です。このフィールドにより、すべてのエンティティをあいまいさなく挿入、更新、クエリ、削除できます。

ユースケースに応じて、Zilliz Cloud に ID を自動生成させる（AutoID）か、独自の ID を手動で割り当てることができます。

## プライマリフィールドとは？\{#what-is-a-primary-field}

プライマリフィールドは、従来のデータベースの主キーと同様に、コレクション内の各エンティティの一意キーとして機能します。Zilliz Cloud は、挿入、アップサート、削除、クエリの各操作でエンティティを管理するためにプライマリフィールドを使用します。

主な要件は次のとおりです。

- 各コレクションには、プライマリフィールドが **正確に 1 つ** 必要です。

- プライマリフィールドの値は null にできません。

- データ型は作成時に指定する必要があり、後から変更できません。

## サポートされるデータ型\{#supported-data-types}

プライマリフィールドには、エンティティを一意に識別できるサポート対象のスカラーデータ型を使用する必要があります。

| データ型 | 説明 |
| --- | --- |
| `INT64` | 64 ビット整数型で、通常は AutoID と組み合わせて使用します。ほとんどのユースケースで推奨されるオプションです。 |
| `VARCHAR` | 可変長文字列型です。エンティティ識別子が外部システム（例：製品コードやユーザー ID）に由来する場合に使用します。値ごとに許容される最大バイト数を定義するには、`max_length` プロパティが必要です。 |

## AutoID と手動 ID の選択\{#choose-between-autoid-and-manual-ids}

Zilliz Cloud では、主キー値を割り当てる 2 つのモードをサポートしています。

| モード | 説明 | 推奨される用途 |
| --- | --- | --- |
| AutoID | Zilliz Cloud が、挿入またはインポートされたエンティティの一意の識別子を自動的に生成します。 | ID を手動で管理する必要がないほとんどのシナリオ。 |
| Manual ID | データを挿入またはインポートするときに、一意の ID を自分で指定します。 | ID を外部システムや既存のデータセットと一致させる必要がある場合。 |

<Admonition type="info" title="Notes">

- どちらのモードを選択するかわからない場合は、取り込みを簡素化し、一意性を保証するために [AutoID から始める](./primary-field-auto-id#quickstart-use-autoid) ことをお勧めします。

- 主キーの手動設定が有益な場合を除き、すべての場合で `autoId` を使用することをお勧めします。

</Admonition>

## クイックスタート：AutoID を使用する\{#quickstart-use-autoid}

Zilliz Cloud に ID 生成を自動的に処理させることができます。

### ステップ 1: AutoID を使用してコレクションを作成する\{#step-1-create-a-collection-with-autoid}

プライマリフィールドの定義で `auto_id=True` を有効にします。Zilliz Cloud が ID 生成を自動的に処理します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema()

# Define primary field with AutoID enabled
# highlight-start
schema.add_field(
    field_name="id", # Primary field name
    is_primary=True,
    auto_id=True,  # Milvus generates IDs automatically; Defaults to False
    datatype=DataType.INT64
)
# highlight-end

# Define the other fields
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=4) # Vector field
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=1000) # Scalar field of the VARCHAR type

# Create the collection
if client.has_collection("demo_autoid"):
    client.drop_collection("demo_autoid")
client.create_collection(collection_name="demo_autoid", schema=schema)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .build());

client.dropCollection(DropCollectionReq.builder()
        .collectionName("demo_autoid")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo_autoid")
        .collectionSchema(collectionSchema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
// go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: "YOUR_CLUSTER_ENDPOINT",
        APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
        log.Fatal("failed to connect:", err)
}
defer cli.Close(ctx)

schema := &entity.Schema{
        CollectionName: "demo_autoid",
        Fields: []*entity.Field{
                entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true).WithIsAutoID(true),
                entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(4),
                entity.NewField().WithName("category").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000),
        },
}

cli.DropCollection(ctx, milvusclient.NewDropCollectionOption("demo_autoid"))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("demo_autoid", schema))
if err != nil {
        log.Fatal("failed to create collection:", err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

let client = ClientV2::new(
    &ConnectConfig::new()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN"),
)
.await?;

let schema = CollectionSchema::new()
    .add_field(
        FieldSchema::new()
            .name("id")
            .data_type(DataType::Int64)
            .primary_key(true)
            .auto_id(true),
    )
    .add_field(
        FieldSchema::new()
            .name("embedding")
            .data_type(DataType::FloatVector)
            .dimension(4),
    )
    .add_field(
        FieldSchema::new()
            .name("category")
            .data_type(DataType::VarChar)
            .max_length(1000),
    );

if client
    .has_collection(
        HasCollectionRequest::builder()
            .collection_name("demo_autoid")
            .build()?,
    )
    .await?
    .exists()
{
    client
        .drop_collection(
            DropCollectionRequest::builder()
                .collection_name("demo_autoid")
                .build()?,
        )
        .await?;
}

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("demo_autoid")
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

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "Primary field", true, true});
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR, "Vector field").WithDimension(4));
schema->AddField(milvus::FieldSchema("category", milvus::DataType::VARCHAR, "Scalar field").WithMaxLength(1000));

status = client->DropCollection(milvus::DropCollectionRequest().WithCollectionName("demo_autoid"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("demo_autoid")
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
});

// Define schema fields
const schema = [
  {
    name: "id",
    description: "Primary field",
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: true, // Milvus generates IDs automatically
  },
  {
    name: "embedding",
    description: "Vector field",
    data_type: DataType.FloatVector,
    dim: 4,
  },
  {
    name: "category",
    description: "Scalar field",
    data_type: DataType.VarChar,
    max_length: 1000,
  },
];

// Create the collection
await client.createCollection({
  collection_name: "demo_autoid",
  fields: schema,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Types;

var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

var schema = new CollectionSchema
{
    Fields =
    {
        new FieldSchema("id", DataType.Int64, isPrimaryKey: true, autoId: true), // Milvus generates IDs automatically
        FieldSchema.CreateFloatVector("embedding", dimension: 4), // Vector field
        FieldSchema.CreateVarchar("category", maxLength: 1000) // Scalar field of the VARCHAR type
    }
};

if ((await client.HasCollectionAsync(new HasCollectionReq { CollectionName = "demo_autoid" })).Has)
{
    await client.DropCollectionAsync(new DropCollectionReq { CollectionName = "demo_autoid" });
}

await client.CreateCollectionAsync(new CreateCollectionReq
{
    CollectionName = "demo_autoid",
    Schema = schema
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export SCHEMA='{
    "autoID": true,
    "fields": [
        {
            "fieldName": "id",
            "dataType": "Int64",
            "isPrimary": true,
            "elementTypeParams": {}
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "isPrimary": false,
            "elementTypeParams": {
                "dim": "4"
            }
        },
        {
            "fieldName": "category",
            "dataType": "VarChar",
            "isPrimary": false,
            "elementTypeParams": {
                "max_length": "1000"
            }
        }
    ]
}'

curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create' \
-H 'Content-Type: application/json' \
-H "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"demo_autoid\",
    \"schema\": $SCHEMA
}"
```

</TabItem>
</Tabs>

### ステップ 2: データを挿入する\{#step-2-insert-data}

**重要：** データにプライマリフィールド列を含めないでください。Zilliz Cloud が ID を自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_autoid", data=data)
print("Generated IDs:", res.get("ids"))

# Output example:
# Generated IDs: [461526052788333649, 461526052788333650]
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;
import java.util.ArrayList;
import java.util.List;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
JsonObject row1 = new JsonObject();
row1.add("embedding", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f, 0.4f}));
row1.addProperty("category", "book");
rows.add(row1);

JsonObject row2 = new JsonObject();
row2.add("embedding", gson.toJsonTree(new float[]{0.2f, 0.3f, 0.4f, 0.5f}));
row2.addProperty("category", "toy");
rows.add(row2);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("demo_autoid")
        .data(rows)
        .build());
System.out.printf("Generated IDs: %s\n", insertR.getPrimaryKeys());
```

</TabItem>

<TabItem value='go'>

```go
// go
import (
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

data := []any{
        map[string]any{"embedding": []float32{0.1, 0.2, 0.3, 0.4}, "category": "book"},
        map[string]any{"embedding": []float32{0.2, 0.3, 0.4, 0.5}, "category": "toy"},
}

result, err := cli.Insert(ctx, milvusclient.NewRowBasedInsertOption("demo_autoid", data...))
if err != nil {
        log.Fatal("failed to insert:", err)
}
for i := 0; i < result.IDs.Len(); i++ {
        id, _ := result.IDs.GetAsInt64(i)
        fmt.Println("Generated ID:", id)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

client
    .insert(
        InsertRequest::builder()
            .collection_name("demo_autoid")
            .rows([
                serde_json::json!({"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"}),
                serde_json::json!({"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"}),
            ])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

milvus::EntityRows data = {{{"embedding", std::vector<float>{0.1, 0.2, 0.3, 0.4}}, {"category", "book"}},
                           {{"embedding", std::vector<float>{0.2, 0.3, 0.4, 0.5}}, {"category", "toy"}}};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("demo_autoid")
                                .WithRowsData(std::move(data))
                                , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
auto ids = response.Results().IdArray().IntIDArray();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
];

const res = await client.insert({
    collection_name: "demo_autoid",
    fields_data: data,
});

console.log(res);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Responses.Dml;
using Milvus.Client.V2.Types;

var data = new[]
{
    new Dictionary<string, object?>
    {
        ["embedding"] = new[] { 0.1f, 0.2f, 0.3f, 0.4f },
        ["category"] = "book"
    },
    new Dictionary<string, object?>
    {
        ["embedding"] = new[] { 0.2f, 0.3f, 0.4f, 0.5f },
        ["category"] = "toy"
    }
};

MutationResp res = await client.InsertAsync(new InsertReq
{
    CollectionName = "demo_autoid",
    RowsData = data
});
Console.WriteLine("Generated IDs: " + string.Join(", ", res.LongIds ?? []));
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export INSERT_DATA='[
    {
        "embedding": [0.1, 0.2, 0.3, 0.4],
        "category": "book"
    },
    {
        "embedding": [0.2, 0.3, 0.4, 0.5],
        "category": "toy"
    }
]'

curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert' \
-H 'Content-Type: application/json' \
-H "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"demo_autoid\",
    \"data\": $INSERT_DATA
}"
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

重複 ID エラーを回避するため、既存のエンティティを扱うときは `insert()` ではなく `upsert()` を使用してください。

</Admonition>

## 手動 ID を使用する\{#use-manual-ids}

ID を手動で制御する必要がある場合は、AutoID を無効にし、独自の値を指定してください。

### ステップ 1: AutoID なしでコレクションを作成する\{#step-1-create-a-collection-without-autoid}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema()

# Define the primary field without AutoID
# highlight-start
schema.add_field(
    field_name="product_id",
    is_primary=True,
    auto_id=False,  # You'll provide IDs manually at data ingestion
    datatype=DataType.VARCHAR,
    max_length=100 # Required when datatype is VARCHAR
)
# highlight-end

# Define the other fields
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=4) # Vector field
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=1000) # Scalar field of the VARCHAR type

# Create the collection
if client.has_collection("demo_manual_ids"):
    client.drop_collection("demo_manual_ids")
client.create_collection(collection_name="demo_manual_ids", schema=schema)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.VarChar)
        .isPrimaryKey(true)
        .autoID(false)
        .maxLength(100)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .build());

client.dropCollection(DropCollectionReq.builder()
        .collectionName("demo_manual_ids")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo_manual_ids")
        .collectionSchema(collectionSchema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
// go
import (
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

schema = &entity.Schema{
        CollectionName: "demo_manual_ids",
        Fields: []*entity.Field{
                entity.NewField().WithName("product_id").WithDataType(entity.FieldTypeVarChar).WithIsPrimaryKey(true).WithMaxLength(100),
                entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(4),
                entity.NewField().WithName("category").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000),
        },
}

cli.DropCollection(ctx, milvusclient.NewDropCollectionOption("demo_manual_ids"))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("demo_manual_ids", schema))
if err != nil {
        log.Fatal("failed to create collection:", err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

let client = ClientV2::new(
    &ConnectConfig::new()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN"),
)
.await?;

let schema = CollectionSchema::new()
    .add_field(
        FieldSchema::new()
            .name("product_id")
            .data_type(DataType::VarChar)
            .primary_key(true)
            .max_length(100),
    )
    .add_field(
        FieldSchema::new()
            .name("embedding")
            .data_type(DataType::FloatVector)
            .dimension(4),
    )
    .add_field(
        FieldSchema::new()
            .name("category")
            .data_type(DataType::VarChar)
            .max_length(1000),
    );

if client
    .has_collection(
        HasCollectionRequest::builder()
            .collection_name("demo_manual_ids")
            .build()?,
    )
    .await?
    .exists()
{
    client
        .drop_collection(
            DropCollectionRequest::builder()
                .collection_name("demo_manual_ids")
                .build()?,
        )
        .await?;
}

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("demo_manual_ids")
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

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("product_id", milvus::DataType::VARCHAR, "", true, false).WithMaxLength(100));
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(4));
schema->AddField(milvus::FieldSchema("category", milvus::DataType::VARCHAR).WithMaxLength(1000));

status = client->DropCollection(milvus::DropCollectionRequest().WithCollectionName("demo_manual_ids"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("demo_manual_ids")
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
});

const schema = [
  {
    name: "product_id",
    data_type: DataType.VarChar,
    is_primary_key: true,
    autoID: false,
    max_length: 100,
  },
  {
    name: "embedding",
    data_type: DataType.FloatVector,
    dim: 4,
  },
  {
    name: "category",
    data_type: DataType.VarChar,
    max_length: 1000,
  },
];

await client.createCollection({
  collection_name: "demo_manual_ids",
  fields: schema,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Types;

var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

var schema = new CollectionSchema
{
    Fields =
    {
        FieldSchema.CreateVarchar("product_id", maxLength: 100, isPrimaryKey: true, autoId: false), // You provide IDs manually
        FieldSchema.CreateFloatVector("embedding", dimension: 4), // Vector field
        FieldSchema.CreateVarchar("category", maxLength: 1000) // Scalar field of the VARCHAR type
    }
};

if ((await client.HasCollectionAsync(new HasCollectionReq { CollectionName = "demo_manual_ids" })).Has)
{
    await client.DropCollectionAsync(new DropCollectionReq { CollectionName = "demo_manual_ids" });
}

await client.CreateCollectionAsync(new CreateCollectionReq
{
    CollectionName = "demo_manual_ids",
    Schema = schema
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export SCHEMA='{
    "autoID": false,
    "fields": [
        {
            "fieldName": "product_id",
            "dataType": "VarChar",
            "isPrimary": true,
            "elementTypeParams": {
                "max_length": "100"
            }
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "isPrimary": false,
            "elementTypeParams": {
                "dim": "4"
            }
        },
        {
            "fieldName": "category",
            "dataType": "VarChar",
            "isPrimary": false,
            "elementTypeParams": {
                "max_length": "1000"
            }
        }
    ]
}'

curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create' \
-H 'Content-Type: application/json' \
-H "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"schema\": $SCHEMA
}"
```

</TabItem>
</Tabs>

### ステップ 2: 自分の ID でデータを挿入する\{#step-2-insert-data-with-your-ids}

すべての挿入操作にプライマリフィールド列を含める必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Each entity must contain the primary field `product_id`
data = [
    {"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_manual_ids", data=data)
print("Generated IDs:", res.get("ids"))

# Output example:
# Generated IDs: ['PROD-001', 'PROD-002']
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;
import java.util.ArrayList;
import java.util.List;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
JsonObject row1 = new JsonObject();
row1.addProperty("product_id", "PROD-001");
row1.add("embedding", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f, 0.4f}));
row1.addProperty("category", "book");
rows.add(row1);

JsonObject row2 = new JsonObject();
row2.addProperty("product_id", "PROD-002");
row2.add("embedding", gson.toJsonTree(new float[]{0.2f, 0.3f, 0.4f, 0.5f}));
row2.addProperty("category", "toy");
rows.add(row2);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("demo_manual_ids")
        .data(rows)
        .build());
System.out.printf("Generated IDs: %s\n", insertR.getPrimaryKeys());
```

</TabItem>

<TabItem value='go'>

```go
// go
import (
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

data = []any{
        map[string]any{"product_id": "PROD-001", "embedding": []float32{0.1, 0.2, 0.3, 0.4}, "category": "book"},
        map[string]any{"product_id": "PROD-002", "embedding": []float32{0.2, 0.3, 0.4, 0.5}, "category": "toy"},
}

result, err = cli.Insert(ctx, milvusclient.NewRowBasedInsertOption("demo_manual_ids", data...))
if err != nil {
        log.Fatal("failed to insert:", err)
}
for i := 0; i < result.IDs.Len(); i++ {
        id, _ := result.IDs.GetAsString(i)
        fmt.Println("Inserted ID:", id)
}
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

client
    .insert(
        InsertRequest::builder()
            .collection_name("demo_manual_ids")
            .rows([
                serde_json::json!({"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"}),
                serde_json::json!({"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"}),
            ])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

milvus::EntityRows data = {{{"product_id", "PROD-001"}, {"embedding", std::vector<float>{0.1, 0.2, 0.3, 0.4}}, {"category", "book"}},
                           {{"product_id", "PROD-002"}, {"embedding", std::vector<float>{0.2, 0.3, 0.4, 0.5}}, {"category", "toy"}}};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("demo_manual_ids")
                                .WithRowsData(std::move(data))
                                , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
auto string_ids = response.Results().IdArray().StrIDArray();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
];

const insert = await client.insert({
    collection_name: "demo_manual_ids",
    fields_data: data,
});

console.log(insert);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Responses.Dml;
using Milvus.Client.V2.Types;

// Each entity must contain the primary field `product_id`
var data = new[]
{
    new Dictionary<string, object?>
    {
        ["product_id"] = "PROD-001",
        ["embedding"] = new[] { 0.1f, 0.2f, 0.3f, 0.4f },
        ["category"] = "book"
    },
    new Dictionary<string, object?>
    {
        ["product_id"] = "PROD-002",
        ["embedding"] = new[] { 0.2f, 0.3f, 0.4f, 0.5f },
        ["category"] = "toy"
    }
};

MutationResp res = await client.InsertAsync(new InsertReq
{
    CollectionName = "demo_manual_ids",
    RowsData = data
});
Console.WriteLine("Generated IDs: " + string.Join(", ", res.StringIds ?? []));
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export INSERT_DATA='[
    {
        "product_id": "PROD-001",
        "embedding": [0.1, 0.2, 0.3, 0.4],
        "category": "book"
    },
    {
        "product_id": "PROD-002",
        "embedding": [0.2, 0.3, 0.4, 0.5],
        "category": "toy"
    }
]'

# 插入数据
curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert' \
-H 'Content-Type: application/json' \
-H "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"data\": $INSERT_DATA
}"
```

</TabItem>
</Tabs>

ご自身で行う必要があること：

- すべてのエンティティ間で、すべての ID が一意であることを確認してください。

- すべての insert/import 操作にプライマリフィールドを含めてください。

- ID の競合と重複検出はご自身で処理してください。

