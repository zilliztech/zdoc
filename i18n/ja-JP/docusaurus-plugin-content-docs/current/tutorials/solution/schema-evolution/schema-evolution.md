---
title: "スキーマエボリューション | Cloud"
slug: /schema-evolution
sidebar_label: "スキーマエボリューション"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマエボリューションでは、既存のコレクションを再構築したり、本番トラフィックを停止したりすることなく、フィールドを追加できます。ただし、フィールドを追加しても変更されるのはコレクションスキーマのみです。既存のエンティティに新しいフィールドの値が自動的に設定されることはなく、移行中も新規エンティティや更新されたエンティティが到着し続ける場合があります。 | Cloud"
type: origin
token: P5q7wCCk5i3rlEkceyjcQMi0nSc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマエボリューション

スキーマエボリューションでは、既存のコレクションを再構築したり、本番トラフィックを停止したりすることなく、フィールドを追加できます。ただし、フィールドを追加しても変更されるのはコレクションスキーマのみです。既存のエンティティに新しいフィールドの値が自動的に設定されることはなく、移行中も新規エンティティや更新されたエンティティが到着し続ける場合があります。

本記事では、スキーマエボリューションの一般的な手順を示します。

## ワークフローを理解する\{#understand-the-workflow}

稼働中のコレクションのスキーマを安全に進化させるには、調整済みの一連の手順に従います。

![OQbQwegIUhOoBXbDgfAcMfw0n5e](https://zdoc-images.s3.us-west-2.amazonaws.com/OQbQwegIUhOoBXbDgfAcMfw0n5e.png)

上記のシーケンス図に示すように、移行フロー全体は次のとおりです。

1. **[リーダーとライターを準備する](./schema-evolution#step-1-prepare-readers-and-writers)。** 

    アプリケーションが新しいフィールドへの書き込みと新しいフィールドからの読み取りに対応していることを確認します。

1. **[新しいフィールドを追加する](./schema-evolution#step-2-add-the-new-fields)。** 

    必要なフィールドでコレクションスキーマを拡張します。 

1. **[書き込みを切り替える](./schema-evolution#step-3-switch-writes)。** 

    新規および更新されたすべてのエンティティが新しいフィールドに値を設定するようにします。 

1. **[既存のエンティティをバックフィルする](./schema-evolution#step-4-backfill-existing-entities)。** 

    履歴データの新しいフィールドに値を設定します。 

1. **[移行を検証する](./schema-evolution#step-5-validate-migration)。** 

    履歴エンティティと新しく書き込まれたエンティティの両方に期待どおりの値が含まれていることを確認します。 

1. **[読み取りを切り替える](./schema-evolution#step-6-switch-reads)。** 

    本番の読み取りで新しいフィールドの使用を開始します。

順序が重要です。バックフィルを開始する前にアプリケーションの書き込みを切り替えることで、移行中に作成または更新されたエンティティにも新しいフィールドの値がすでに含まれるようにします。バックフィルが完了したら、読み取りを新しいフィールドに切り替える前に、履歴データと新しく書き込まれたデータの両方を検証します。

## 事前準備\{#before-you-start}

稼働中のコレクションのスキーマを進化させる前に、以下を満たしていることを確認してください。

- アプリケーションを更新して、新しいフィールドからの読み取りと新しいフィールドへの書き込みができること。

- 既存のエンティティの新しいフィールドに値を設定するために必要なソースデータが利用可能であること。

- 各ソースレコードを主キーによって既存のエンティティと照合できること。

- 移行が検証されるまで、既存のフィールドが引き続き利用可能であること。

## ステップ 1: リーダーとライターを準備する\{#step-1-prepare-readers-and-writers}

コレクションスキーマを変更する前に、新しいフィールドからの読み取りと新しいフィールドへの書き込みができるようにアプリケーションを準備します。これらの変更は構成またはフィーチャーフラグの背後にデプロイしますが、新しいフィールドがコレクションに追加されるまでは無効にしておきます。

たとえば、`category` フィールドを追加する予定であるとします。新しいスキーマが有効になったときにこのフィールドを含めるようにライターを準備できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"}]}>
<TabItem value='python'>

```python
# Pseudocode
def build_entity(document, use_new_schema=False):
    entity = {
        "id": document["id"],
        "text": document["text"],
        "embedding": document["embedding"],
    }

    if use_new_schema:
        entity["category"] = document["category"]

    return entity
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;

private static JsonObject buildEntity(JsonObject document, boolean useNewSchema) {
    JsonObject entity = new JsonObject();
    entity.add("id", document.get("id"));
    entity.add("text", document.get("text"));
    entity.add("embedding", document.get("embedding"));

    if (useNewSchema) {
        entity.add("category", document.get("category"));
    }

    return entity;
}
```

</TabItem>

<TabItem value='go'>

```go
func buildEntity(document map[string]any, useNewSchema bool) map[string]any {
    entity := map[string]any{
        "id":        document["id"],
        "text":      document["text"],
        "embedding": document["embedding"],
    }

    if useNewSchema {
        entity["category"] = document["category"]
    }

    return entity
}
```

</TabItem>

<TabItem value='rust'>

```rust
fn build_entity(document: serde_json::Value, use_new_schema: bool) -> serde_json::Value {
    let mut entity = serde_json::Map::new();
    entity.insert("id".into(), document["id"].clone());
    entity.insert("text".into(), document["text"].clone());
    entity.insert("embedding".into(), document["embedding"].clone());

    if use_new_schema {
        entity.insert("category".into(), document["category"].clone());
    }

    serde_json::Value::Object(entity)
}
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRow buildEntity(const milvus::EntityRow& document, bool useNewSchema) {
    milvus::EntityRow entity;
    entity["id"] = document.at("id");
    entity["text"] = document.at("text");
    entity["embedding"] = document.at("embedding");

    if (useNewSchema) {
        entity["category"] = document.at("category");
    }

    return entity;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
function buildEntity(document, useNewSchema) {
    const entity = {
        id: document.id,
        text: document.text,
        embedding: document.embedding,
    };

    if (useNewSchema) {
        entity.category = document.category;
    }

    return entity;
}
```

</TabItem>

<TabItem value='csharp'>

```csharp
Dictionary<string, object?> buildEntity(Dictionary<string, object?> document, bool useNewSchema)
{
    var entity = new Dictionary<string, object?>
    {
        ["id"] = document["id"],
        ["text"] = document["text"],
        ["embedding"] = document["embedding"],
    };

    if (useNewSchema)
    {
        entity["category"] = document["category"];
    }

    return entity;
}
```

</TabItem>
</Tabs>

移行が検証された後に新しいフィールドを使用できるように、同じ方法でリーダーを準備します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"}]}>
<TabItem value='python'>

```python
# Pseudocode
def get_output_fields(use_new_schema=False):
    fields = ["id", "text"]

    if use_new_schema:
        fields.append("category")

    return fields
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

private static List<String> getOutputFields(boolean useNewSchema) {
    List<String> fields = new ArrayList<>(Arrays.asList("id", "text"));

    if (useNewSchema) {
        fields.add("category");
    }

    return fields;
}
```

</TabItem>

<TabItem value='go'>

```go
func getOutputFields(useNewSchema bool) []string {
    fields := []string{"id", "text"}

    if useNewSchema {
        fields = append(fields, "category")
    }

    return fields
}
```

</TabItem>

<TabItem value='rust'>

```rust
fn get_output_fields(use_new_schema: bool) -> Vec<&'static str> {
    let mut fields = vec!["id", "text"];

    if use_new_schema {
        fields.push("category");
    }

    fields
}
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<std::string> getOutputFields(bool useNewSchema) {
    std::vector<std::string> fields = {"id", "text"};

    if (useNewSchema) {
        fields.push_back("category");
    }

    return fields;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
function getOutputFields(useNewSchema) {
    const fields = ["id", "text"];

    if (useNewSchema) {
        fields.push("category");
    }

    return fields;
}
```

</TabItem>

<TabItem value='csharp'>

```csharp
List<string> getOutputFields(bool useNewSchema)
{
    var fields = new List<string> { "id", "text" };

    if (useNewSchema)
    {
        fields.Add("category");
    }

    return fields;
}
```

</TabItem>
</Tabs>

この段階では、両方の切り替えを無効にしておきます。新しいフィールドが追加されるまで、本番の読み取りと書き込みでは引き続き既存のスキーマを使用する必要があります。

## ステップ 2: 新しいフィールドを追加する\{#step-2-add-the-new-fields}

更新されたリーダーとライターの準備ができたら、必要なフィールドを既存のコレクションスキーマに追加します。この時点では、新しいアプリケーションパスを無効にしておきます。

次のコードは、NULL を許容する `category` フィールドを追加する例です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType

client.add_collection_field(
    collection_name="documents",
    field_name="category",
    data_type=DataType.VARCHAR,
    max_length=64,
    nullable=True,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("documents")
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(64)
        .isNullable(true)
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

err = client.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("documents",
    entity.NewField().
        WithName("category").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(64).
        WithNullable(true)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

client
    .add_collection_field(
        AddCollectionFieldRequest::builder()
            .collection_name("documents")
            .field(
                FieldSchema::new()
                    .name("category")
                    .data_type(DataType::VarChar)
                    .max_length(64)
                    .nullable(true),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <utility>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->AddCollectionField(milvus::AddCollectionFieldRequest()
    .WithCollectionName("documents")
    .WithField(std::move(milvus::FieldSchema("category", milvus::DataType::VARCHAR).WithMaxLength(64).WithNullable(true))));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

await client.addCollectionField({
    collection_name: "documents",
    field: {
        name: "category",
        data_type: DataType.VarChar,
        max_length: 64,
        nullable: true,
    },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

await client.AddCollectionFieldAsync(new AddCollectionFieldReq
{
    CollectionName = "documents",
    Field = FieldSchema.CreateVarchar("category", 64, nullable: true)
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/add" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "documents",
    "schema": {
        "fieldName": "category",
        "dataType": "VarChar",
        "elementTypeParams": {
            "max_length": 64
        },
        "nullable": true
    }
}'
```

</TabItem>
</Tabs>

フィールドを追加しても変更されるのはコレクションスキーマのみです。既存のエンティティは書き換えられず、移行の後半でフィールドに値が設定されるまで、新しいフィールドには `NULL` が格納されます。

スキーマの変更が成功したら、新しく挿入または更新されたすべてのエンティティが新しいフィールドに値を設定するように、アプリケーションの書き込みの切り替えに進みます。

## ステップ 3: 書き込みを切り替える\{#step-3-switch-writes}

新しいフィールドがコレクションスキーマで利用可能になったら、新しいすべての挿入と全行アップサートでそれらのフィールドに値が設定されるように、更新されたライターを有効にします。

たとえば、先ほど準備した書き込みパスを有効にします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
USE_NEW_SCHEMA = True

entity = build_entity(document, use_new_schema=USE_NEW_SCHEMA)

client.insert(
    collection_name="documents",
    data=[entity],
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.Collections;

boolean USE_NEW_SCHEMA = true;
JsonObject entity = buildEntity(document, USE_NEW_SCHEMA);

client.insert(InsertReq.builder()
        .collectionName("documents")
        .data(Collections.singletonList(entity))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
useNewSchema := true
entity := buildEntity(document, useNewSchema)

_, err = client.Insert(ctx, milvusclient.NewRowBasedInsertOption("documents", entity))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
let use_new_schema = true;
let entity = build_entity(document, use_new_schema);

client
    .insert(
        InsertRequest::builder()
            .collection_name("documents")
            .rows(vec![entity])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
bool USE_NEW_SCHEMA = true;
milvus::EntityRow entity = buildEntity(document, USE_NEW_SCHEMA);

milvus::InsertResponse insert_response;
milvus::InsertRequest insert_request;
insert_request.WithCollectionName("documents");
insert_request.WithRowsData({entity});
auto status = client->Insert(insert_request, insert_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const USE_NEW_SCHEMA = true;
const entity = buildEntity(document, USE_NEW_SCHEMA);

await client.insert({
    collection_name: "documents",
    data: [entity],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
bool USE_NEW_SCHEMA = true;
var entity = buildEntity(document, USE_NEW_SCHEMA);

await client.InsertAsync(new InsertReq
{
    CollectionName = "documents",
    RowsData = new[] { entity }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \\
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \\
--header "Authorization: Bearer ${TOKEN}" \\
--header "Content-Type: application/json" \\
--header "Request-Timeout: 10" \\
-d '{
    "collectionName": "documents",
    "data": [
        {"id": 1001, "text": "sample text", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "tutorial"}
    ]
}'
```

</TabItem>
</Tabs>

全行アップサートの場合は、ペイロードにも新しいフィールドを含めます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.upsert(
    collection_name="documents",
    data=[{
        "id": document["id"],
        "text": document["text"],
        "embedding": document["embedding"],
        "category": document["category"],
    }],
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;
import java.util.Collections;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

JsonObject entity = new JsonObject();
entity.addProperty("id", 1001);
entity.addProperty("text", "example text");
entity.add("embedding", new Gson().toJsonTree(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f}));
entity.addProperty("category", "electronics");

client.upsert(UpsertReq.builder()
        .collectionName("documents")
        .data(Collections.singletonList(entity))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

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

_, err = client.Upsert(ctx, milvusclient.NewRowBasedInsertOption("documents",
    map[string]any{
        "id":        int64(1001),
        "text":      "example text",
        "embedding": []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592},
        "category":  "electronics",
    }))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("documents")
                    .rows(vec![
                        json!({
                            "id": 1001,
                            "text": "example text",
                            "embedding": [0.3580376395471989_f32, -0.6023495712049978_f32, 0.18414012509913835_f32, -0.26286205330961354_f32, 0.9029438446296592_f32],
                            "category": "electronics",
                        }),
                    ])
                    .build()?,
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <vector>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::UpsertResponse upsertResponse;
status = client->Upsert(milvus::UpsertRequest()
    .WithCollectionName("documents")
    .AddRowData({{"id", 1001}, {"text", "example text"}, {"embedding", std::vector<float>{0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F}}, {"category", "electronics"}}), upsertResponse);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

await client.upsert({
    collection_name: "documents",
    data: [{
        id: 1001,
        text: "example text",
        embedding: [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
        category: "electronics",
    }],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Dml;

await client.UpsertAsync(new UpsertReq
{
    CollectionName = "documents",
    RowsData =
    [
        new Dictionary<string, object?> { ["id"] = 1001L, ["text"] = "example text", ["embedding"] = new[] { 0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f }, ["category"] = "electronics" }
    ]
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "documents",
    "data": [
        {
            "id": 1001,
            "text": "example text",
            "embedding": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
            "category": "electronics"
        }
    ]
}'
```

</TabItem>
</Tabs>

バックフィルを開始する前にライターの切り替えを完了します。この時点以降、新しく挿入または更新されたエンティティには新しいフィールドの値がすでに含まれていますが、既存のエンティティはバックフィルによって値が設定されます。この順序により、移行中に行われた書き込みがどちらのパスからも漏れるギャップを防ぎます。

バックフィルが完了し、移行が検証されるまで、本番の読み取りでは既存のフィールドを使用し続けます。

## ステップ 4: 既存のエンティティをバックフィルする\{#step-4-backfill-existing-entities}

すべてのアプリケーションライターが新しいスキーマに切り替わったら、切り替え前に存在していたエンティティの新しいフィールドをバックフィルします。

主キーと新しいフィールドに書き込む値を含むデータファイルを準備します。オンライン移行では、`coalesce` を使用して、アプリケーションによってすでに書き込まれた値を保持しながら、履歴エンティティの欠落値を設定します。

Zilliz Cloud では、データバックフィルジョブを送信します。Zilliz Cloud は、コレクションスナップショット、Spark の実行、バックフィルのコミットをジョブの一部として管理します。

バックフィルを送信する前に、必要に応じて事前チェックを実行し、入力データとフィールドマッピングを検証できます。

次のスニペットは、データバックフィルジョブを送信する方法を示しています。入力の準備、データに対する事前チェックの実行、バックフィルモードの選択、バックフィルジョブの送信、ジョブの監視の詳細については、[データバックフィル](./data-backfill) を参照してください。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request POST \
    --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "Idempotency-Key: schema-evolution-backfill-001" \
    --header "Content-Type: application/json" \
    --data '{
      "description": "Backfill category for existing documents",
      "clusterId": "in-xxxxxxxx",
      "dbName": "default",
      "collectionName": "documents",
      "fields": ["category"],
      "input": {
        "type": "volume",
        "volumeName": "migration-data",
        "path": "schema-evolution/category-backfill.parquet",
        "format": "parquet"
      },
      "columnMapping": {
        "source_id": "id",
        "source_category": "category"
      },
      "mode": "coalesce",
      "resourceSize": "SMALL",
      "timeoutSeconds": 3600
    }'
```

## ステップ 5: 移行を検証する\{#step-5-validate-migration}

バックフィルが完了したら、本番の読み取りを新しいフィールドに切り替える前に、新しいフィールドに値が正しく設定されていることを確認します。

まず、バックフィルによって処理された履歴エンティティと、ライターの切り替え後に挿入または更新されたエンティティの両方を含む、代表的なエンティティセットをクエリします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
results = client.query(
    collection_name="documents",
    filter="id in [1001, 1002, 1003]",
    output_fields=["id", "category"],
)

for result in results:
    print(result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

QueryResp queryResp = client.query(QueryReq.builder()
        .collectionName("documents")
        .filter("id in [1001, 1002, 1003]")
        .outputFields(Arrays.asList("id", "category"))
        .build());

for (QueryResp.QueryResult result : queryResp.getQueryResults()) {
    System.out.println(result.getEntity());
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

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

results, err := client.Query(ctx, milvusclient.NewQueryOption("documents").
    WithFilter("id in [1001, 1002, 1003]").
    WithOutputFields("id", "category"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let results = client
    .query(
        QueryRequest::builder()
            .collection_name("documents")
            .filter("id in [1001, 1002, 1003]")
            .output_fields(["id", "category"])
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
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::QueryResponse queryResponse;
status = client->Query(milvus::QueryRequest()
    .WithCollectionName("documents")
    .WithFilter("id in [1001, 1002, 1003]")
    .WithOutputFields({"id", "category"}), queryResponse);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const results = await client.query({
    collection_name: "documents",
    filter: "id in [1001, 1002, 1003]",
    output_fields: ["id", "category"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

QueryResp results = await client.QueryAsync(new QueryReq
{
    CollectionName = "documents",
    Expression = "id in [1001, 1002, 1003]",
    Parameters = new QueryParameters { OutputFields = { "id", "category" } }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "documents",
    "filter": "id in [1001, 1002, 1003]",
    "outputFields": ["id", "category"]
}'
```

</TabItem>
</Tabs>

以下を確認します。

- 履歴エンティティの新しいフィールドに期待どおりの値が含まれていることを確認します。

- ライターの切り替え後に書き込まれたエンティティにも有効な値が含まれていることを確認します。

- 提供する予定の母集団に、予期しない `NULL` 値や不一致が残っていないことを確認します。

大規模なコレクションでは、少数のサンプルエンティティだけに依存するのではなく、全体的なカバレッジと、代表的なデータセグメントまたはアプリケーションコホートの両方を検証します。

新しいフィールドがアプリケーションの要件を満たしてから、本番の読み取りの切り替えに進みます。

## ステップ 6: 読み取りを切り替える\{#step-6-switch-reads}

移行が検証されたら、新しいフィールドを使用するようにアプリケーションのリーダーを更新します。

たとえば、先ほど準備した読み取りパスを有効にします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
USE_NEW_SCHEMA = True

results = client.query(
    collection_name="documents",
    filter="id in [1001, 1002, 1003]",
    output_fields=get_output_fields(use_new_schema=USE_NEW_SCHEMA),
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

boolean USE_NEW_SCHEMA = true;

QueryResp queryResp = client.query(QueryReq.builder()
        .collectionName("documents")
        .filter("id in [1001, 1002, 1003]")
        .outputFields(getOutputFields(USE_NEW_SCHEMA))
        .build());

for (QueryResp.QueryResult result : queryResp.getQueryResults()) {
    System.out.println(result.getEntity());
}
```

</TabItem>

<TabItem value='go'>

```go
useNewSchema := true

results, err := client.Query(ctx, milvusclient.NewQueryOption("documents").
    WithFilter("id in [1001, 1002, 1003]").
    WithOutputFields(getOutputFields(useNewSchema)...))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let use_new_schema = true;

let results = client
    .query(
        QueryRequest::builder()
            .collection_name("documents")
            .filter("id in [1001, 1002, 1003]")
            .output_fields(get_output_fields(use_new_schema))
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

bool USE_NEW_SCHEMA = true;

milvus::QueryResponse queryResponse;
auto status = client->Query(milvus::QueryRequest()
    .WithCollectionName("documents")
    .WithFilter("id in [1001, 1002, 1003]")
    .WithOutputFields(getOutputFields(USE_NEW_SCHEMA)), queryResponse);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const USE_NEW_SCHEMA = true;

const results = await client.query({
    collection_name: "documents",
    filter: "id in [1001, 1002, 1003]",
    output_fields: getOutputFields(USE_NEW_SCHEMA),
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

bool USE_NEW_SCHEMA = true;
QueryParameters parameters = new QueryParameters();
foreach (var field in getOutputFields(USE_NEW_SCHEMA))
{
    parameters.OutputFields.Add(field);
}

QueryResp results = await client.QueryAsync(new QueryReq
{
    CollectionName = "documents",
    Expression = "id in [1001, 1002, 1003]",
    Parameters = parameters
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "documents",
    "filter": "id in [1001, 1002, 1003]",
    "outputFields": ["id", "text", "category"]
}'
```

</TabItem>
</Tabs>

新しいフィールドが検索動作を変更する場合（新しいベクトルフィールドを別の埋め込みモデルで使用する場合など）は、クエリモデル、対象フィールド、関連する検索構成を含め、読み取りパス全体をまとめて切り替えます。

可能な場合は変更を段階的にロールアウトし、ロールバック期間が終了するまで以前の読み取りパスを利用可能な状態に保ちます。

## 障害処理とロールバック\{#failure-handling-and-rollback}

移行が検証され、ロールバック期間が終了するまで、既存のフィールドと読み取りパスを利用可能な状態に保ちます。問題が発生した場合は、移行の進行を停止し、現在のステージから復旧します。

| **ステージ** | **推奨アクション** |
| --- | --- |
| ライターの切り替えに失敗した場合 | 本番の読み取りでは既存のフィールドを使用し続け、バックフィルを開始する前にライターのロールアウトを完了します。 |
| 事前チェックに失敗した場合 | バックフィルを開始しないでください。ステージングされたデータまたは構成を修正してから、事前チェックを再実行します。 |
| バックフィルに失敗した場合 | 本番の読み取りでは既存のフィールドを使用し続け、問題を修正してバックフィルを再試行します。 |
| 移行の検証に失敗した場合 | 読み取りを切り替えないでください。欠落した値、古い値、または不正確な値を修正してから、再度検証します。 |
| 新しい読み取りパスでリグレッションが発生した場合 | 新しいフィールドとバックフィル済みデータをそのまま保持しながら、本番の読み取りを既存のフィールドに戻します。 |
| 移行が成功した場合 | 合意したロールバック期間が終了するまで既存のフィールドを保持します。新しいパスが安定していることを確認してから、古いフィールド、インデックス、アプリケーションロジックを削除します。 |

新しい埋め込みモデルや検索表現への移行など、検索動作を変更する移行では、可能な場合は読み取りを段階的にロールアウトします。

バックフィルに失敗しても、本番の読み取りでは引き続き既存のフィールドが使用されるため、通常はデータのロールバックは必要ありません。主なロールバックポイントは読み取りの切り替え後であり、最も安全な復旧方法は通常、新しいデータを削除するのではなく、トラフィックを古いフィールドに戻すことです。

## 次のステップ\{#next-steps}

このワークフローを、より具体的なスキーマエボリューションのシナリオの基礎として使用します。次のランブックでは、ベクトル検索アプリケーションでよくある変更に同じ移行シーケンスを適用します。



import DocCardList from '@theme/DocCardList';

<DocCardList />
