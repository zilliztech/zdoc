---
title: "スキーマ進化 | Cloud"
slug: /schema-evolution
sidebar_label: "スキーマ進化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマ進化を使用すると、既存のコレクションを再構築したり、本番トラフィックを停止したりすることなく、フィールドを追加できます。ただし、フィールドを追加しても変更されるのはコレクションのスキーマのみです。既存のエンティティには新しいフィールドの値が自動的に設定されませんが、移行中も新規および更新されたエンティティが到着し続ける可能性があります。 | Cloud"
type: origin
token: P5q7wCCk5i3rlEkceyjcQMi0nSc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマ進化

スキーマ進化を使用すると、既存のコレクションを再構築したり、本番トラフィックを停止したりすることなく、フィールドを追加できます。ただし、フィールドを追加しても変更されるのはコレクションのスキーマのみです。既存のエンティティには新しいフィールドの値が自動的に設定されませんが、移行中も新規および更新されたエンティティが到着し続ける可能性があります。

本記事では、スキーマ進化の一般的な手順を説明します。

## ワークフローを理解する\{#understand-the-workflow}

稼働中のコレクションのスキーマを安全に進化させるには、連携した手順に従ってください。

![OQbQwegIUhOoBXbDgfAcMfw0n5e](https://zdoc-images.s3.us-west-2.amazonaws.com/OQbQwegIUhOoBXbDgfAcMfw0n5e.png)

上記のシーケンスで示すように、移行フロー全体は次のとおりです。

1. **[リーダーとライターを準備する](./schema-evolution#step-1-prepare-readers-and-writers).** 

    アプリケーションが新しいフィールドへの書き込みと読み取りに対応できるようにします。

1. **[新しいフィールドを追加する](./schema-evolution#step-2-add-the-new-fields).** 

    コレクションのスキーマに必要なフィールドを追加します。 

1. **[書き込みを切り替える](./schema-evolution#step-3-switch-writes).** 

    新規および更新されたすべてのエンティティに新しいフィールドの値が設定されるようにします。 

1. **[既存のエンティティをバックフィルする](./schema-evolution#step-4-backfill-existing-entities).** 

    履歴データに新しいフィールドの値を設定します。 

1. **[移行を検証する](./schema-evolution#step-5-validate-migration).** 

    履歴エンティティと新しく書き込まれたエンティティの両方に、期待どおりの値が含まれていることを確認します。 

1. **[読み取りを切り替える](./schema-evolution#step-6-switch-reads).** 

    本番の読み取りで新しいフィールドの使用を開始します。

順序が重要です。バックフィルを開始する前にアプリケーションの書き込みを切り替えることで、移行中に作成または更新されたエンティティに新しいフィールドの値がすでに含まれるようになります。バックフィルが完了したら、読み取りを新しいフィールドに切り替える前に、履歴データと新しく書き込まれたデータの両方を検証します。

## 事前準備\{#before-you-start}

稼働中のコレクションのスキーマを進化させる前に、以下を満たしていることを確認してください。

- アプリケーションを更新して、新しいフィールドの読み取りと書き込みに対応できること。

- 既存のエンティティの新しいフィールドに設定するために必要なソースデータが利用可能であること。

- 各ソースレコードをプライマリキーで既存のエンティティと照合できること。

- 移行が検証されるまで、既存のフィールドが引き続き利用可能であること。

## ステップ 1: リーダーとライターを準備する\{#step-1-prepare-readers-and-writers}

コレクションのスキーマを変更する前に、アプリケーションが新しいフィールドの読み取りと書き込みに対応できるように準備します。これらの変更は構成またはフィーチャーフラグで制御される状態でデプロイしますが、新しいフィールドがコレクションに追加されるまでは無効にしておきます。

たとえば、`category` フィールドを追加する予定であるとします。新しいスキーマが有効になったときにこのフィールドを含めるようにライターを準備できます。

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

同様にリーダーも準備し、移行が検証された後に新しいフィールドを読み取れるようにします。

```python
# Pseudocode
def get_output_fields(use_new_schema=False):
    fields = ["id", "text"]

    if use_new_schema:
        fields.append("category")

    return fields
```

この段階では、両方のスイッチを無効にしておきます。新しいフィールドが追加されるまで、本番の読み取りと書き込みは既存のスキーマを引き続き使用する必要があります。

## ステップ 2: 新しいフィールドを追加する\{#step-2-add-the-new-fields}

更新されたリーダーとライターの準備ができたら、既存のコレクションのスキーマに必要なフィールドを追加します。この時点では、新しいアプリケーションの経路は無効にしておきます。

たとえば、次のコードは NULL を許可する `category` フィールドを追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

フィールドを追加しても変更されるのはコレクションのスキーマのみです。既存のエンティティは書き換えられず、移行の後半でフィールドが設定されるまで、新しいフィールドには `NULL` が入っています。

スキーマの変更が成功したら、新しく挿入または更新されたすべてのエンティティに新しいフィールドの値が設定されるように、アプリケーションの書き込みの切り替えに進みます。

## ステップ 3: 書き込みを切り替える\{#step-3-switch-writes}

新しいフィールドがコレクションのスキーマで利用可能になったら、更新されたライターを有効にして、新しい挿入と全行アップサートのすべてでこれらのフィールドに値が設定されるようにします。

たとえば、以前に準備したライターの経路を有効にします。

```python
USE_NEW_SCHEMA = True

entity = build_entity(document, use_new_schema=USE_NEW_SCHEMA)

client.insert(
    collection_name="documents",
    data=[entity],
)
```

全行アップサートの場合は、ペイロードにも新しいフィールドを含めます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

バックフィルを開始する前にライターの切り替えを完了します。この時点以降、新しく挿入または更新されたエンティティには新しいフィールドの値がすでに含まれ、既存のエンティティはバックフィルによって値が設定されます。この順序により、移行中に行われた書き込みがどちらの経路からも漏れるというギャップを防ぎます。

バックフィルが完了して移行が検証されるまで、本番の読み取りは既存のフィールドを使用し続けます。

## ステップ 4: 既存のエンティティをバックフィルする\{#step-4-backfill-existing-entities}

すべてのアプリケーションのライターが新しいスキーマに切り替わったら、切り替え前に存在していたエンティティの新しいフィールドをバックフィルします。

プライマリキーと、新しいフィールドに書き込む値を含むデータファイルを準備します。オンライン移行の場合は、`coalesce` を使用して、アプリケーションによってすでに書き込まれた値を保持しつつ、履歴エンティティで欠落している値を設定します。

Zilliz Cloud では、データバックフィルジョブを送信します。Zilliz Cloud は、ジョブの一部としてコレクションのスナップショット、Spark の実行、バックフィルのコミットを管理します。

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

バックフィルが完了したら、本番の読み取りを新しいフィールドに切り替える前に、新しいフィールドが正しく設定されていることを確認します。

まず、バックフィルで処理された履歴エンティティと、ライターの切り替え後に挿入または更新されたエンティティの両方を含む、代表的なエンティティのセットをクエリします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

- 履歴エンティティの新しいフィールドに、期待どおりの値が含まれています。

- ライターの切り替え後に書き込まれたエンティティにも、有効な値が含まれています。

- 提供する予定のデータに、予期しない `NULL` 値や不一致が残っていません。

大規模なコレクションの場合は、少数のサンプルエンティティだけに頼るのではなく、全体的なカバレッジと、代表的なデータセグメントまたはアプリケーションコホートの両方を検証します。

新しいフィールドがアプリケーションの要件を満たしてからはじめて、本番の読み取りの切り替えに進みます。

## ステップ 6: 読み取りを切り替える\{#step-6-switch-reads}

移行が検証されたら、アプリケーションのリーダーを更新して新しいフィールドを使用するようにします。

たとえば、以前に準備したリーダーの経路を有効にします。

```python
USE_NEW_SCHEMA = True

results = client.query(
    collection_name="documents",
    filter="id in [1001, 1002, 1003]",
    output_fields=get_output_fields(use_new_schema=USE_NEW_SCHEMA),
)
```

新しいフィールドによって検索動作が変わる場合（たとえば、新しいベクトルフィールドを別の埋め込みモデルで使用する場合）は、クエリモデル、ターゲットフィールド、関連する検索構成など、読み取り経路全体をまとめて切り替えます。

可能な場合は変更を段階的に展開し、ロールバック期間が終了するまで以前の読み取り経路を利用可能にしておきます。

## 障害対応とロールバック\{#failure-handling-and-rollback}

移行が検証され、ロールバック期間が終了するまで、既存のフィールドと読み取り経路を利用可能にしておきます。問題が発生した場合は、移行の進行を止め、現在の段階から復旧します。

| **段階** | **推奨される対応** |
| --- | --- |
| ライターの切り替えが失敗した場合 | 本番の読み取りは既存のフィールドのままにし、バックフィルを開始する前にライターの展開を完了します。 |
| 事前チェックが失敗した場合 | バックフィルを開始しません。ステージングされたデータまたは構成を修正してから、事前チェックを再度実行します。 |
| バックフィルが失敗した場合 | 本番の読み取りは既存のフィールドのままにし、問題を修正してバックフィルを再試行します。 |
| 検証が失敗した場合 | 読み取りを切り替えません。欠落している値、古い値、正しくない値を修正してから、再度検証します。 |
| 新しい読み取り経路が劣化した場合 | 新しいフィールドとバックフィル済みデータをそのまま維持しつつ、本番の読み取りを既存のフィールドに戻します。 |
| 移行が成功した場合 | 合意されたロールバック期間の間は既存のフィールドを維持します。新しい経路が安定してからはじめて、古いフィールド、インデックス、アプリケーションロジックを削除します。 |

新しい埋め込みモデルや検索表現への移行など、検索動作が変わる移行では、可能な場合は読み取りを段階的に展開します。

バックフィルの失敗は通常、データのロールバックを必要としません。本番の読み取りが引き続き既存のフィールドを使用するためです。主なロールバックポイントは読み取りを切り替えた後であり、そこでは通常、新しいデータを削除するよりも、トラフィックを古いフィールドに戻すのが最も安全な復旧方法です。

## 次のステップ\{#next-steps}

このワークフローを、より具体的なスキーマ進化のシナリオの基礎として使用します。次のランブックでは、ベクトル検索アプリケーションでよくある変更に同じ移行手順を適用します。



import DocCardList from '@theme/DocCardList';

<DocCardList />
