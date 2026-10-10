---
title: "コレクション TTL の設定 | Cloud"
slug: /set-collection-ttl
sidebar_label: "TTL"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、Time-to-Live（TTL）ポリシーを通じてエンティティを自動的に期限切れにできます。期限切れになったエンティティは、クエリおよび検索結果にすぐに表示されなくなり、通常は 24 時間以内に実行される次回の Compaction サイクルでストレージから物理的に削除されます。 | Cloud"
type: origin
token: GthGwnrpEiGpClkV5JXcgWUgn8c
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクション TTL の設定

Zilliz Cloud では、**Time-to-Live（TTL）**ポリシーを通じてエンティティを自動的に期限切れにできます。期限切れになったエンティティは、クエリおよび検索結果にすぐに表示されなくなり、通常は 24 時間以内に実行される次回の Compaction サイクルでストレージから物理的に削除されます。

TTL モードには次の 2 つがあります。

- **コレクションレベル TTL** — すべてのエンティティで共有される 1 つの保持期間で、`collection.ttl.seconds` プロパティを通じて設定します。

- **エンティティレベル TTL** — 各エンティティが専用の `TIMESTAMPTZ` フィールドに独自の絶対有効期限を持ち、`ttl_field` プロパティを通じて TTL フィールドとしてマークされます。

<Admonition type="info" title="Notes">

この機能はマネージドコレクションにのみ適用されます。

</Admonition>

## 制限\{#limits}

- 2 つの TTL モードは相互に排他的です。1 つのコレクションに `collection.ttl.seconds` と `ttl_field` の両方を同時に設定することはできません。切り替えるには、[2 つのモード間の移行](./set-collection-ttl#migrate-between-the-two-modes)を参照してください。

- コレクションレベル TTL は、コレクション全体に 1 つの保持期間を適用します。単一の行に異なる有効期間が必要な場合は、エンティティレベル TTL を使用します。

- エンティティレベル TTL のフィールドは `TIMESTAMPTZ` である必要があります。その他の型は拒否されます。

- TTL フィールドはコレクションごとに 1 つです。スキーマには複数の `TIMESTAMPTZ` フィールドを含めることができますが、`ttl_field` で指定できるのは 1 つだけです。

- `ttl_field` を削除しても、期限切れのエンティティが再び表示されることはありません。期限切れのエンティティを復元するには、`NULL` または将来の有効期限タイムスタンプを指定して upsert します。

## 概要\{#overview}

<details>

<summary>展開</summary>

### TTL を使用する場合\{#when-to-use-ttl}

保持が **ポリシー** である場合、TTL は適切なツールです。つまり、特定のエンティティがいずれ削除されることを事前に把握しており、cron ジョブを作成しなくてもクラスターにそれを強制したい場合です。

一般的なシナリオは次のとおりです。

- **時間枠で区切られたデータセット。** ログ、メトリクス、イベント、または有効期間の短い特徴キャッシュの直近 N 日分のみを保持します。

- **マルチテナントコレクション。** 同じコレクション内で、テナントごとに異なる保持期間を持ちます。

- **レコード単位の保持ポリシー。** IoT パイプライン、ドキュメントストア、または MLOps 特徴ストアにおけるドキュメント単位の有効期間です。

- **ホットデータとコールドデータの混在。** 同じコレクション内で、有効期間の短いエンティティと長期的なエンティティが共存します。

- **コンプライアンスに基づく有効期限。** 各レコードが独自の「削除期限」を持つ、GDPR スタイルのデータ最小化です。

- **ビジネス時刻に基づく有効期限。** エンティティは、特定の絶対的な時点（キャンペーンの終了、セッションの失効）までの間だけ有効なレコードを表します。

<Admonition type="info" title="Notes">

期限切れのエンティティは、検索結果やクエリ結果に表示されません。ただし、通常は 24 時間以内に実行される次回のデータ Compaction までストレージに残ることがあります。

</Admonition>

### TTL モード\{#ttl-modes}

2 つのモードは、異なる保持の課題に答えます。

- **コレクションレベル TTL** は、すべてのエンティティに単一の保持期間を適用します。各エンティティは `insert_ts + ttl_seconds` で期限切れになります。

- **エンティティレベル TTL** では、各エンティティが独自の絶対有効期限を `TIMESTAMPTZ` フィールドに保存できます。そのフィールドの値が `NULL` の場合、エンティティが期限切れになることはありません。

コレクションは一度に **1 つ** のモードを使用します。2 つのモードは相互に排他的です。切り替えは複数の手順を伴う操作です。詳細は、「2 つのモード間の移行」を参照してください。

モードを選択するには、この表を使用します。

| **現在の状況** | **使用するモード** |
| --- | --- |
| コレクション内のすべてのエンティティが同じ保持期間に従う必要がある | コレクションレベル TTL |
| 保持が「挿入時点から N 秒間保持する」である | コレクションレベル TTL |
| 同じコレクション内の異なるエンティティに異なる有効期間が必要（テナント単位、hot/cold, ドキュメント単位） | エンティティレベル TTL |
| 保持が絶対的な実時間（たとえば 2027-01-01T00:00:00Z）である | エンティティレベル TTL |
| 保持が挿入タイムスタンプではなくビジネスタイムスタンプによって決まる | エンティティレベル TTL |
| 挿入後にエンティティの有効期間を更新または延長したい | エンティティレベル TTL |
| 一部のエンティティは期限切れにせず、それ以外は期限切れにしたい | エンティティレベル TTL（期限切れにしないものには NULL を使用） |

</details>

## コレクションレベル TTL を設定する\{#set-collection-level-ttl}

コレクション内のすべてのエンティティが同じ保持期間に従う必要がある場合は、コレクションレベル TTL を使用します。

### 新しいコレクションで有効にする\{#enable-on-a-new-collection}

作成時に `properties` マップを通じて `collection.ttl.seconds`（整数、秒単位）を渡します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=128)

index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector", index_type="AUTOINDEX", metric_type="COSINE"
)

client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params,
    # highlight-start
    properties={
        "collection.ttl.seconds": 1209600  # 14 days
    },
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64)
        .isPrimaryKey(true).autoID(false).build());
schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector)
        .dimension(128).build());

IndexParam indexParam = IndexParam.builder().fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE).build();

// highlight-start
Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "1209600"); // 14 days

client.createCollection(CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(Collections.singletonList(indexParam))
        .properties(properties)
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema().WithDynamicFieldEnabled(false).
        WithField(entity.NewField().WithName("id").WithIsAutoID(false).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
        WithField(entity.NewField().WithName("vector").WithDataType(entity.FieldTypeFloatVector).WithDim(128))

indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption("my_collection", "vector", index.NewAutoIndex(entity.COSINE)),
}

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
    WithIndexOptions(indexOptions...).
    WithProperty(common.CollectionTTLConfigKey, 1209600)) // TTL in seconds
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let schema = CollectionSchema::new()
    .enable_dynamic_field(false)
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(false))
    .add_field(FieldSchema::new().name("vector").data_type(DataType::FloatVector).dimension(128));

let index_params = vec![
    IndexParam::new().field_name("vector").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine),
];

client.create_collection(CreateCollectionRequest::builder()
    .collection_name("my_collection")
    .schema(schema)
    .index_params(index_params)
    .properties(std::collections::HashMap::from([("collection.ttl.seconds".to_string(), "1209600".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, false));
schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(128));

std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("vector", "vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)};

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                      .WithCollectionName("my_collection")
                                      .WithCollectionSchema(schema)
                                      .WithIndexes(std::move(indexes))
                                      .AddProperty(milvus::COLLECTION_TTL_SECONDS, "1209600"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.createCollection({
  collection_name: "my_collection",
  fields: [
    { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: false },
    { name: "vector", data_type: DataType.FloatVector, dim: 128 },
  ],
  index_params: [
    { field_name: "vector", index_type: "AUTOINDEX", metric_type: "COSINE" },
  ],
  // highlight-start
  properties: {
    "collection.ttl.seconds": 1209600, // 14 days
  },
  // highlight-end
});
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": false,
        "enableDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "128"
                }
            }
        ]
    }'

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "COSINE",
            "indexName": "vector",
            "indexType": "AUTOINDEX"
        }
    ]'

export params='{
    "ttlSeconds": "1209600"
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### 既存のコレクションで有効にする\{#enable-on-an-existing-collection}

すでに使用中のコレクションに TTL を適用するには、`properties` マップに `collection.ttl.seconds` を指定して `alter_collection_properties` を呼び出します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assumes "my_collection" was created earlier without TTL
schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=128)

index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector", index_type="AUTOINDEX", metric_type="COSINE"
)

if not client.has_collection("my_collection"):
    client.create_collection(
        collection_name="my_collection",
        schema=schema,
        index_params=index_params,
    )

# highlight-start
client.alter_collection_properties(
    collection_name="my_collection",
    properties={"collection.ttl.seconds": 1209600},
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.HasCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// Assumes "my_collection" was created earlier without TTL.
if (!client.hasCollection(HasCollectionReq.builder().collectionName("my_collection").build())) {
    CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
    schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64)
            .isPrimaryKey(true).autoID(false).build());
    schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector)
            .dimension(128).build());
    IndexParam indexParam = IndexParam.builder().fieldName("vector")
            .indexType(IndexParam.IndexType.AUTOINDEX)
            .metricType(IndexParam.MetricType.COSINE).build();
    client.createCollection(CreateCollectionReq.builder()
            .collectionName("my_collection")
            .collectionSchema(schema)
            .indexParams(Collections.singletonList(indexParam))
            .build());
}

// highlight-start
Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "1209600");

client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// Assumes "my_collection" was created earlier without TTL.
exists, err := client.HasCollection(ctx, milvusclient.NewHasCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
if !exists {
    schema := entity.NewSchema().WithDynamicFieldEnabled(false).
            WithField(entity.NewField().WithName("id").WithIsAutoID(false).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
            WithField(entity.NewField().WithName("vector").WithDataType(entity.FieldTypeFloatVector).WithDim(128))
    indexOptions := []milvusclient.CreateIndexOption{
        milvusclient.NewCreateIndexOption("my_collection", "vector", index.NewAutoIndex(entity.COSINE)),
    }
    err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOptions...))
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
}

err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty(common.CollectionTTLConfigKey, 1209600))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let has = client.has_collection(HasCollectionRequest::builder()
    .collection_name("my_collection")
    .build()?).await?;
if !has.exists() {
    let schema = CollectionSchema::new()
        .enable_dynamic_field(false)
        .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(false))
        .add_field(FieldSchema::new().name("vector").data_type(DataType::FloatVector).dimension(128));
    let index_params = vec![
        IndexParam::new().field_name("vector").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine),
    ];
    client.create_collection(CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .index_params(index_params)
        .build()?).await?;
}

client.alter_collection_properties(AlterCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .properties(std::collections::HashMap::from([("collection.ttl.seconds".to_string(), "1209600".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

milvus::HasCollectionResponse has_response;
status = client->HasCollection(milvus::HasCollectionRequest()
                                   .WithCollectionName("my_collection"),
                               has_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
if (!has_response.Has()) {
    milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
    schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, false));
    schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(128));
    std::vector<milvus::IndexDesc> indexes = {
        milvus::IndexDesc("vector", "vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)};
    status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("my_collection")
                                          .WithCollectionSchema(schema)
                                          .WithIndexes(std::move(indexes)));
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
}

status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                               .WithCollectionName("my_collection")
                                               .AddProperty(milvus::COLLECTION_TTL_SECONDS, "1209600"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// Assumes "my_collection" was created earlier without TTL.
if (!(await client.hasCollection({ collection_name: "my_collection" })).value) {
  await client.createCollection({
    collection_name: "my_collection",
    fields: [
      { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: false },
      { name: "vector", data_type: DataType.FloatVector, dim: 128 },
    ],
    index_params: [
      { field_name: "vector", index_type: "AUTOINDEX", metric_type: "COSINE" },
    ],
  });
}

// highlight-start
await client.alterCollectionProperties({
  collection_name: "my_collection",
  properties: { "collection.ttl.seconds": 1209600 },
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": false,
        "enableDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "128"
                }
            }
        ]
    }'

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "COSINE",
            "indexName": "vector",
            "indexType": "AUTOINDEX"
        }
    ]'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Assumes "my_collection" was created earlier without TTL.
if ! curl --silent --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\"
}" | grep -q '"has":true'; then
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
fi

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"collection.ttl.seconds\": \"1209600\"
    }
}"
```

</TabItem>
</Tabs>

### TTL 設定を削除する\{#drop-the-ttl-setting}

コレクション内のデータを無期限に保持することにした場合は、そのコレクションから TTL 設定を削除するだけで済みます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=["collection.ttl.seconds"],
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// highlight-start
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("collection.ttl.seconds"))
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", common.CollectionTTLConfigKey))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

client.drop_collection_properties(DropCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .property_key("collection.ttl.seconds")
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
                                              .WithCollectionName("my_collection")
                                              .AddPropertyKey(milvus::COLLECTION_TTL_SECONDS));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// highlight-start
await client.dropCollectionProperties({
  collection_name: "my_collection",
  properties: ["collection.ttl.seconds"],
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"propertyKeys\": [
        \"collection.ttl.seconds\"
    ]
}"
```

</TabItem>
</Tabs>

## エンティティレベル TTL を設定する | ONDEMAND\{#set-entity-level-ttl}

エンティティレベル TTL では、各エンティティが独自の絶対有効期限を持つことができます。この時刻は、スキーマで宣言する専用の `TIMESTAMPTZ` 列に保存され、`ttl_field` コレクションプロパティを通じてその列を TTL フィールドとしてマークします。

### 新しいコレクションで有効にする\{#enable-on-a-new-collection}

作成時にエンティティレベル TTL を有効にするには、同じ `create_collection` 呼び出しで 2 つの追加を行います。スキーマ内の `TIMESTAMPTZ` フィールドと、そのフィールドを指す `ttl_field` プロパティです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(enable_dynamic_field=False)
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
# highlight-next-line
schema.add_field("expire_at", DataType.TIMESTAMPTZ, nullable=True)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=128)

index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_type="AUTOINDEX",
                       metric_type="COSINE")

client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params,
    # highlight-next-line
    properties={"ttl_field": "expire_at"},
)
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64)
        .isPrimaryKey(true).autoID(false).build());
// highlight-next-line
schema.addField(AddFieldReq.builder().fieldName("expire_at").dataType(DataType.Timestamptz)
        .isNullable(true).build());
schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector)
        .dimension(128).build());

IndexParam indexParam = IndexParam.builder().fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE).build();

// highlight-next-line
Map<String, String> properties = new HashMap<>();
// highlight-next-line
properties.put("ttl_field", "expire_at");

client.createCollection(CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(Collections.singletonList(indexParam))
        .properties(properties)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema().WithDynamicFieldEnabled(false).
        WithField(entity.NewField().WithName("id").WithIsAutoID(false).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
        WithField(entity.NewField().WithName("expire_at").WithDataType(entity.FieldTypeTimestamptz).WithNullable(true)).
        WithField(entity.NewField().WithName("vector").WithDataType(entity.FieldTypeFloatVector).WithDim(128))

indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption("my_collection", "vector", index.NewAutoIndex(entity.COSINE)),
}

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
    WithIndexOptions(indexOptions...).
    WithProperty("ttl_field", "expire_at"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let schema = CollectionSchema::new()
    .enable_dynamic_field(false)
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(false))
    .add_field(FieldSchema::new().name("expire_at").data_type(DataType::Timestamptz).nullable(true))
    .add_field(FieldSchema::new().name("vector").data_type(DataType::FloatVector).dimension(128));

let index_params = vec![
    IndexParam::new().field_name("vector").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine),
];

client.create_collection(CreateCollectionRequest::builder()
    .collection_name("my_collection")
    .schema(schema)
    .index_params(index_params)
    .properties(std::collections::HashMap::from([("ttl_field".to_string(), "expire_at".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, false));
schema->AddField(milvus::FieldSchema("expire_at", milvus::DataType::TIMESTAMPTZ).WithNullable(true));
schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(128));

std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("vector", "vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)};

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                      .WithCollectionName("my_collection")
                                      .WithCollectionSchema(schema)
                                      .WithIndexes(std::move(indexes))
                                      .AddProperty("ttl_field", "expire_at"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.createCollection({
  collection_name: "my_collection",
  fields: [
    { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: false },
    // highlight-next-line
    { name: "expire_at", data_type: DataType.Timestamptz, nullable: true },
    { name: "vector", data_type: DataType.FloatVector, dim: 128 },
  ],
  index_params: [
    { field_name: "vector", index_type: "AUTOINDEX", metric_type: "COSINE" },
  ],
  // highlight-next-line
  properties: { ttl_field: "expire_at" },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": false,
        "enableDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "expire_at",
                "dataType": "Timestamptz",
                "nullable": true
            },
            {
                "fieldName": "vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "128"
                }
            }
        ]
    }'

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "COSINE",
            "indexName": "vector",
            "indexType": "AUTOINDEX"
        }
    ]'

export params='{
    "ttlField": "expire_at"
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

コレクションを作成したら、[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) のタイムスタンプ文字列を使用してエンティティを挿入します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import random
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assumes "my_collection" was created earlier with `ttl_field`: "expire_at"
# highlight-start
rows = [
    # Never expires
    {"id": 1, "expire_at": None,
     "vector": [random.random() for _ in range(128)]},
    # Expires at 2026-12-31 UTC midnight
    {"id": 2, "expire_at": "2026-12-31T00:00:00Z",
     "vector": [random.random() for _ in range(128)]},
    # Shanghai local time — normalized to UTC internally
    {"id": 3, "expire_at": "2027-01-01T00:00:00+08:00",
     "vector": [random.random() for _ in range(128)]},
]

client.insert("my_collection", rows)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.google.gson.Gson;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.InsertReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// Assumes "my_collection" was created earlier with `ttl_field`: "expire_at".
Gson gson = new Gson();
Random rng = new Random();

List<Float> vector = new ArrayList<>();
for (int i = 0; i < 128; i++) vector.add(rng.nextFloat());

// highlight-start
List<JsonObject> rows = new ArrayList<>();

// Never expires
JsonObject r1 = new JsonObject();
r1.addProperty("id", 1);
r1.add("expire_at", JsonNull.INSTANCE);
r1.add("vector", gson.toJsonTree(vector));
rows.add(r1);

// Expires at 2026-12-31 UTC midnight
JsonObject r2 = new JsonObject();
r2.addProperty("id", 2);
r2.addProperty("expire_at", "2026-12-31T00:00:00Z");
r2.add("vector", gson.toJsonTree(vector));
rows.add(r2);

// Shanghai local time — normalized to UTC internally
JsonObject r3 = new JsonObject();
r3.addProperty("id", 3);
r3.addProperty("expire_at", "2027-01-01T00:00:00+08:00");
r3.add("vector", gson.toJsonTree(vector));
rows.add(r3);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "math/rand"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// Assumes "my_collection" was created earlier with `ttl_field`: "expire_at".
vector1 := make([]float32, 128)
vector2 := make([]float32, 128)
vector3 := make([]float32, 128)
for i := range vector1 {
    vector1[i] = rand.Float32()
    vector2[i] = rand.Float32()
    vector3[i] = rand.Float32()
}

expireAt, err := column.NewNullableColumnTimestamptzIsoString("expire_at",
    []string{"2026-12-31T00:00:00Z", "2027-01-01T00:00:00+08:00"},
    []bool{false, true, true})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection",
    column.NewColumnInt64("id", []int64{1, 2, 3}),
    expireAt,
    column.NewColumnFloatVector("vector", 128, [][]float32{vector1, vector2, vector3}),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let vector: Vec<f32> = (0..128).map(|_| rand::random::<f32>()).collect();
client.insert(InsertRequest::builder()
    .collection_name("my_collection")
    .rows(vec![
        serde_json::json!({"id": 1, "expire_at": serde_json::Value::Null, "vector": vector.clone()}),
        serde_json::json!({"id": 2, "expire_at": "2026-12-31T00:00:00Z", "vector": vector.clone()}),
        serde_json::json!({"id": 3, "expire_at": "2027-01-01T00:00:00+08:00", "vector": vector.clone()}),
    ])
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <cstdlib>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

std::vector<float> vector(128);
for (auto& v : vector) {
    v = static_cast<float>(rand()) / RAND_MAX;
}
milvus::EntityRows rows;
rows.push_back({{"id", 1}, {"expire_at", nullptr}, {"vector", vector}});
rows.push_back({{"id", 2}, {"expire_at", "2026-12-31T00:00:00Z"}, {"vector", vector}});
rows.push_back({{"id", 3}, {"expire_at", "2027-01-01T00:00:00+08:00"}, {"vector", vector}});

milvus::InsertResponse response;
status = client->Insert(milvus::InsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(rows)),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

const vector = Array.from({ length: 128 }, () => Math.random());

// Assumes "my_collection" was created earlier with `ttl_field`: "expire_at".
// highlight-start
await client.insert({
  collection_name: "my_collection",
  data: [
    // Never expires
    { id: 1, expire_at: null, vector },
    // Expires at 2026-12-31 UTC midnight
    { id: 2, expire_at: "2026-12-31T00:00:00Z", vector },
    // Shanghai local time — normalized to UTC internally
    { id: 3, expire_at: "2027-01-01T00:00:00+08:00", vector },
  ],
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 1, \"expire_at\": null, \"vector\": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]},
        {\"id\": 2, \"expire_at\": \"2026-12-31T00:00:00Z\", \"vector\": [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6]},
        {\"id\": 3, \"expire_at\": \"2027-01-01T00:00:00+08:00\", \"vector\": [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]}
    ]
}"
```

</TabItem>
</Tabs>

すべてのクエリとベクトル検索で、サーバーが TTL フィルターを自動的に挿入します。フィルターを自分で作成する必要はなく、期限切れのエンティティが結果に表示されることもありません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.load_collection("my_collection")

# highlight-start
# Expired rows are filtered out automatically
results = client.query(
    collection_name="my_collection",
    filter="id >= 0",
    output_fields=["id", "expire_at"],
    limit=10,
)
print(results)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build());

// highlight-start
// Expired rows are filtered out automatically
QueryResp results = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("id >= 0")
        .outputFields(Arrays.asList("id", "expire_at"))
        .limit(10L)
        .build());
System.out.println(results.getQueryResults());
// highlight-end
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
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

_, err = client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Expired rows are filtered out automatically
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("id >= 0").
    WithOutputFields("id", "expire_at").
    WithLimit(10))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(resultSet.GetColumn("id"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

client.load_collection(LoadCollectionRequest::builder()
    .collection_name("my_collection")
    .build()?).await?;

let results = client.query(QueryRequest::builder()
    .collection_name("my_collection")
    .filter("id >= 0")
    .output_fields(["id", "expire_at"])
    .limit(10)
    .build()?).await?;
println!("{:?}", results);
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

status = client->LoadCollection(milvus::LoadCollectionRequest()
                                    .WithCollectionName("my_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::QueryResponse response;
status = client->Query(milvus::QueryRequest()
                           .WithCollectionName("my_collection")
                           .WithFilter("id >= 0")
                           .WithOutputFields({"id", "expire_at"})
                           .WithLimit(10),
                       response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
milvus::EntityRows rows;
response.Results().OutputRows(rows);
std::cout << rows.size() << " rows" << std::endl;
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.loadCollection({ collection_name: "my_collection" });

// highlight-start
// Expired rows are filtered out automatically
const results = await client.query({
  collection_name: "my_collection",
  filter: "id >= 0",
  output_fields: ["id", "expire_at"],
  limit: 10,
});
console.log(results.data);
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\"
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"filter\": \"id >= 0\",
    \"outputFields\": [\"id\", \"expire_at\"],
    \"limit\": 10
}"
```

</TabItem>
</Tabs>

同じ自動フィルターは `client.search()` にも適用されます。

Compaction によってエンティティが物理的に削除される前にその有効期間を延長するには、より遅い有効期限タイムスタンプまたは `None` を指定して upsert し、エンティティをクエリ可能なセットに戻します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import random
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.upsert("my_collection", [
    {"id": 2,
     "vector": [random.random() for _ in range(128)],
     "expire_at": "2028-01-01T00:00:00Z"},
])
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

Gson gson = new Gson();
Random rng = new Random();
List<Float> vector = new ArrayList<>();
for (int i = 0; i < 128; i++) vector.add(rng.nextFloat());

// highlight-start
JsonObject row = new JsonObject();
row.addProperty("id", 2);
row.add("vector", gson.toJsonTree(vector));
row.addProperty("expire_at", "2028-01-01T00:00:00Z");

client.upsert(UpsertReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(row))
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "math/rand"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

vector := make([]float32, 128)
for i := range vector {
    vector[i] = rand.Float32()
}

_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection",
    column.NewColumnInt64("id", []int64{2}),
    column.NewColumnFloatVector("vector", 128, [][]float32{vector}),
    column.NewColumnTimestamptzIsoString("expire_at", []string{"2028-01-01T00:00:00Z"}),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let vector: Vec<f32> = (0..128).map(|_| rand::random::<f32>()).collect();
client.upsert(UpsertRequest::builder()
    .insert(InsertRequest::builder()
        .collection_name("my_collection")
        .rows(vec![
            serde_json::json!({"id": 2, "vector": vector, "expire_at": "2028-01-01T00:00:00Z"}),
        ])
        .build()?)
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <cstdlib>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

std::vector<float> vector(128);
for (auto& v : vector) {
    v = static_cast<float>(rand()) / RAND_MAX;
}
milvus::EntityRows rows;
rows.push_back({{"id", 2}, {"vector", vector}, {"expire_at", "2028-01-01T00:00:00Z"}});

milvus::UpsertResponse response;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(rows)),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

const vector = Array.from({ length: 128 }, () => Math.random());

// highlight-start
await client.upsert({
  collection_name: "my_collection",
  data: [
    { id: 2, vector, expire_at: "2028-01-01T00:00:00Z" },
  ],
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 2, \"vector\": [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8], \"expire_at\": \"2028-01-01T00:00:00Z\"}
    ]
}"
```

</TabItem>
</Tabs>

### 既存のコレクションで有効にする\{#enable-on-an-existing-collection}

コレクションがすでに存在し、`collection.ttl.seconds` が設定されていない場合は、`add_collection_field` で `TIMESTAMPTZ` 列を追加し、`alter_collection_properties` でその列を TTL フィールドとしてマークします。必要に応じて、履歴行を upsert して有効期限タイムスタンプをバックフィルします。バックフィルしない行は `NULL` のままになり、期限切れになることはありません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import random
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
# Step 1 — add a TIMESTAMPTZ column to the schema
client.add_collection_field(
    collection_name="my_collection",
    field_name="expire_at",
    data_type=DataType.TIMESTAMPTZ,
    nullable=True,
)

# Step 2 — mark the new column as the TTL field
client.alter_collection_properties(
    collection_name="my_collection",
    properties={"ttl_field": "expire_at"},
)

# Step 3 (optional) — backfill expiration timestamps for historical rows
client.upsert("my_collection", [
    {"id": 1,
     "vector": [random.random() for _ in range(128)],
     "expire_at": "2026-12-31T00:00:00Z"},
])
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.vector.request.UpsertReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// highlight-start
// Step 1 — add a TIMESTAMPTZ column to the schema
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("expire_at")
        .dataType(DataType.Timestamptz)
        .isNullable(true)
        .build());

// Step 2 — mark the new column as the TTL field
Map<String, String> properties = new HashMap<>();
properties.put("ttl_field", "expire_at");
client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build());

// Step 3 (optional) — backfill expiration timestamps for historical rows
Gson gson = new Gson();
Random rng = new Random();
List<Float> vector = new ArrayList<>();
for (int i = 0; i < 128; i++) vector.add(rng.nextFloat());

JsonObject row = new JsonObject();
row.addProperty("id", 1);
row.add("vector", gson.toJsonTree(vector));
row.addProperty("expire_at", "2026-12-31T00:00:00Z");

client.upsert(UpsertReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(row))
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "math/rand"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// Step 1 — add a TIMESTAMPTZ column to the schema
err = client.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("my_collection",
    entity.NewField().WithName("expire_at").WithDataType(entity.FieldTypeTimestamptz).WithNullable(true)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 2 — mark the new column as the TTL field
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty("ttl_field", "expire_at"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 3 (optional) — backfill expiration timestamps for historical rows
vector := make([]float32, 128)
for i := range vector {
    vector[i] = rand.Float32()
}
_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection",
    column.NewColumnInt64("id", []int64{1}),
    column.NewColumnFloatVector("vector", 128, [][]float32{vector}),
    column.NewColumnTimestamptzIsoString("expire_at", []string{"2026-12-31T00:00:00Z"}),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

// Step 1 — add a TIMESTAMPTZ column to the schema
client.add_collection_field(AddCollectionFieldRequest::builder()
    .collection_name("my_collection")
    .field(FieldSchema::new().name("expire_at").data_type(DataType::Timestamptz).nullable(true))
    .build()?).await?;

// Step 2 — mark the new column as the TTL field
client.alter_collection_properties(AlterCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .properties(std::collections::HashMap::from([("ttl_field".to_string(), "expire_at".to_string())]))
    .build()?).await?;

// Step 3 (optional) — backfill expiration timestamps for historical rows
let vector: Vec<f32> = (0..128).map(|_| rand::random::<f32>()).collect();
client.upsert(UpsertRequest::builder()
    .insert(InsertRequest::builder()
        .collection_name("my_collection")
        .rows(vec![
            serde_json::json!({"id": 1, "vector": vector, "expire_at": "2026-12-31T00:00:00Z"}),
        ])
        .build()?)
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <cstdlib>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

// Step 1 — add a TIMESTAMPTZ column to the schema
status = client->AddCollectionField(milvus::AddCollectionFieldRequest()
                                        .WithCollectionName("my_collection")
                                        .WithField(std::move(milvus::FieldSchema("expire_at", milvus::DataType::TIMESTAMPTZ).WithNullable(true))));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 2 — mark the new column as the TTL field
status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                               .WithCollectionName("my_collection")
                                               .AddProperty("ttl_field", "expire_at"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 3 (optional) — backfill expiration timestamps for historical rows
std::vector<float> vector(128);
for (auto& v : vector) {
    v = static_cast<float>(rand()) / RAND_MAX;
}
milvus::EntityRows rows;
rows.push_back({{"id", 1}, {"vector", vector}, {"expire_at", "2026-12-31T00:00:00Z"}});
milvus::UpsertResponse response;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(rows)),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

const vector = Array.from({ length: 128 }, () => Math.random());

// highlight-start
// Step 1 — add a TIMESTAMPTZ column to the schema
await client.addCollectionField({
  collection_name: "my_collection",
  field: { name: "expire_at", data_type: DataType.Timestamptz, nullable: true },
});

// Step 2 — mark the new column as the TTL field
await client.alterCollectionProperties({
  collection_name: "my_collection",
  properties: { ttl_field: "expire_at" },
});

// Step 3 (optional) — backfill expiration timestamps for historical rows
await client.upsert({
  collection_name: "my_collection",
  data: [
    { id: 1, vector, expire_at: "2026-12-31T00:00:00Z" },
  ],
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Step 1 — add a TIMESTAMPTZ column to the schema
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/add" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"schema\": {
        \"fieldName\": \"expire_at\",
        \"dataType\": \"Timestamptz\",
        \"nullable\": true
    }
}"

# Step 2 — mark the new column as the TTL field
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"ttl_field\": \"expire_at\"
    }
}"
# Step 3 (optional) — backfill expiration timestamps for historical rows
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 1, \"vector\": [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9], \"expire_at\": \"2026-12-31T00:00:00Z\"}
    ]
}"
```

</TabItem>
</Tabs>

### TTL 設定を削除する\{#drop-the-ttl-setting}

エンティティ単位の有効期限を停止するには、`property_keys` に `ttl_field` を指定して `drop_collection_properties` を呼び出します。`TIMESTAMPTZ` 列自体はスキーマに残ります。通常のフィールドと同様に引き続きクエリできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=["ttl_field"],
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// highlight-start
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("ttl_field"))
        .build());
// highlight-end
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
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", "ttl_field"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

client.drop_collection_properties(DropCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .property_key("ttl_field")
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
                                              .WithCollectionName("my_collection")
                                              .AddPropertyKey("ttl_field"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// highlight-start
await client.dropCollectionProperties({
  collection_name: "my_collection",
  properties: ["ttl_field"],
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"propertyKeys\": [
        \"ttl_field\"
    ]
}"
```

</TabItem>
</Tabs>

`ttl_field` を削除すると、今後のクエリに対する自動フィルターが無効になりますが、すでに期限切れになったエンティティが自動的に再び表示されることはありません。以前に期限切れになったエンティティを表示するには、`None` または将来の有効期限タイムスタンプを指定して upsert します。これが、同じロードセッション内で期限切れの行へのアクセスを復元する唯一の方法です。

## 2 つのモード間の移行 | PRIVATE\{#migrate-between-the-two-modes}

2 つの TTL モードは相互に排他的であるため、切り替えは複数の手順を伴う操作です。

### コレクションレベル TTL からエンティティレベル TTL に切り替える\{#switch-from-collection-level-to-entity-level-ttl}

コレクションが `collection.ttl.seconds` で作成されており、エンティティ単位の有効期限に切り替える場合は、次の 4 つの手順に従います。手順 1 を省略すると、手順 3 が `collection TTL is already set, cannot be set ttl field` で失敗します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import random
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assumes "my_collection" already exists with `collection.ttl.seconds` set.
# highlight-start
# Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=["collection.ttl.seconds"],
)

# Step 2 — add a TIMESTAMPTZ column to the schema
client.add_collection_field(
    collection_name="my_collection",
    field_name="expire_at",
    data_type=DataType.TIMESTAMPTZ,
    nullable=True,
)

# Step 3 — set the ttl_field property on the column you just added
client.alter_collection_properties(
    collection_name="my_collection",
    properties={"ttl_field": "expire_at"},
)

# Step 4 (optional) — backfill expiration timestamps for historical entities
client.upsert("my_collection", [
    {"id": 1,
     "vector": [random.random() for _ in range(128)],
     "expire_at": "2026-12-31T00:00:00Z"},
])
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;
import io.milvus.v2.service.vector.request.UpsertReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// Assumes "my_collection" already exists with `collection.ttl.seconds` set.
// highlight-start
// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("collection.ttl.seconds"))
        .build());

// Step 2 — add a TIMESTAMPTZ column to the schema
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("expire_at")
        .dataType(DataType.Timestamptz)
        .isNullable(true)
        .build());

// Step 3 — set the ttl_field property on the column you just added
Map<String, String> ttlField = new HashMap<>();
ttlField.put("ttl_field", "expire_at");
client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .properties(ttlField)
        .build());

// Step 4 (optional) — backfill expiration timestamps for historical entities
Gson gson = new Gson();
Random rng = new Random();
List<Float> vector = new ArrayList<>();
for (int i = 0; i < 128; i++) vector.add(rng.nextFloat());

JsonObject row = new JsonObject();
row.addProperty("id", 1);
row.add("vector", gson.toJsonTree(vector));
row.addProperty("expire_at", "2026-12-31T00:00:00Z");

client.upsert(UpsertReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(row))
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "math/rand"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", "collection.ttl.seconds"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 2 — add a TIMESTAMPTZ column to the schema
err = client.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("my_collection",
    entity.NewField().WithName("expire_at").WithDataType(entity.FieldTypeTimestamptz).WithNullable(true)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 3 — set the ttl_field property on the column you just added
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty("ttl_field", "expire_at"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 4 (optional) — backfill expiration timestamps for historical entities
vector := make([]float32, 128)
for i := range vector {
    vector[i] = rand.Float32()
}
_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection",
    column.NewColumnInt64("id", []int64{1}),
    column.NewColumnFloatVector("vector", 128, [][]float32{vector}),
    column.NewColumnTimestamptzIsoString("expire_at", []string{"2026-12-31T00:00:00Z"}),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
client.drop_collection_properties(DropCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .property_key("collection.ttl.seconds")
    .build()?).await?;

// Step 2 — add a TIMESTAMPTZ column to the schema
client.add_collection_field(AddCollectionFieldRequest::builder()
    .collection_name("my_collection")
    .field(FieldSchema::new().name("expire_at").data_type(DataType::Timestamptz).nullable(true))
    .build()?).await?;

// Step 3 — set the ttl_field property on the column you just added
client.alter_collection_properties(AlterCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .properties(std::collections::HashMap::from([("ttl_field".to_string(), "expire_at".to_string())]))
    .build()?).await?;

// Step 4 (optional) — backfill expiration timestamps for historical entities
let vector: Vec<f32> = (0..128).map(|_| rand::random::<f32>()).collect();
client.upsert(UpsertRequest::builder()
    .insert(InsertRequest::builder()
        .collection_name("my_collection")
        .rows(vec![
            serde_json::json!({"id": 1, "vector": vector, "expire_at": "2026-12-31T00:00:00Z"}),
        ])
        .build()?)
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <cstdlib>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
                                              .WithCollectionName("my_collection")
                                              .AddPropertyKey("collection.ttl.seconds"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 2 — add a TIMESTAMPTZ column to the schema
status = client->AddCollectionField(milvus::AddCollectionFieldRequest()
                                        .WithCollectionName("my_collection")
                                        .WithField(std::move(milvus::FieldSchema("expire_at", milvus::DataType::TIMESTAMPTZ).WithNullable(true))));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 3 — set the ttl_field property on the column you just added
status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                               .WithCollectionName("my_collection")
                                               .AddProperty("ttl_field", "expire_at"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 4 (optional) — backfill expiration timestamps for historical entities
std::vector<float> vector(128);
for (auto& v : vector) {
    v = static_cast<float>(rand()) / RAND_MAX;
}
milvus::EntityRows rows;
rows.push_back({{"id", 1}, {"vector", vector}, {"expire_at", "2026-12-31T00:00:00Z"}});
milvus::UpsertResponse response;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(rows)),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// Assumes "my_collection" already exists with `collection.ttl.seconds` set.
// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
await client.dropCollectionProperties({
  collection_name: "my_collection",
  properties: ["collection.ttl.seconds"],
});

// Step 2 — add a TIMESTAMPTZ column to the schema
await client.addCollectionField({
  collection_name: "my_collection",
  field: { name: "expire_at", data_type: DataType.Timestamptz, nullable: true },
});

// Step 3 — set the ttl_field property on the column you just added
await client.alterCollectionProperties({
  collection_name: "my_collection",
  properties: { ttl_field: "expire_at" },
});

// Step 4 (optional) — backfill expiration timestamps for historical entities
const vector = Array.from({ length: 128 }, () => Math.random());
await client.upsert({
  collection_name: "my_collection",
  data: [
    { id: 1, vector, expire_at: "2026-12-31T00:00:00Z" },
  ],
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"propertyKeys\": [
        \"collection.ttl.seconds\"
    ]
}"

# Step 2 — add a TIMESTAMPTZ column to the schema
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/add" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"schema\": {
        \"fieldName\": \"expire_at\",
        \"dataType\": \"Timestamptz\",
        \"nullable\": true
    }
}"

# Step 3 — set the ttl_field property on the column you just added
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"ttl_field\": \"expire_at\"
    }
}"

# Step 4 (optional) — backfill expiration timestamps for historical entities
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 1, \"vector\": [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8], \"expire_at\": \"2026-12-31T00:00:00Z\"}
    ]
}"
```

</TabItem>
</Tabs>

`expire_at` をバックフィルしない履歴エンティティは、その列が `NULL` になり、期限切れにならないことを意味します。有限の有効期間を持つべき行だけをバックフィルします。

### エンティティレベル TTL からコレクションレベル TTL に切り替える\{#switch-from-entity-level-to-collection-level-ttl}

逆方向に移行するには、`ttl_field` を削除し、`collection.ttl.seconds` を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assumes "my_collection" already exists with `ttl_field` set.
# highlight-start
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=["ttl_field"],
)
client.alter_collection_properties(
    collection_name="my_collection",
    properties={"collection.ttl.seconds": 1209600},  # 14 days
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// Assumes "my_collection" already exists with `ttl_field` set.
// highlight-start
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("ttl_field"))
        .build());

Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "1209600"); // 14 days
client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", "ttl_field"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty(common.CollectionTTLConfigKey, 1209600)) // 14 days
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

client.drop_collection_properties(DropCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .property_key("ttl_field")
    .build()?).await?;

client.alter_collection_properties(AlterCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .properties(std::collections::HashMap::from([("collection.ttl.seconds".to_string(), "1209600".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
                                              .WithCollectionName("my_collection")
                                              .AddPropertyKey("ttl_field"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                               .WithCollectionName("my_collection")
                                               .AddProperty(milvus::COLLECTION_TTL_SECONDS, "1209600")); // 14 days
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// Assumes "my_collection" already exists with `ttl_field` set.
await client.dropCollectionProperties({
  collection_name: "my_collection",
  properties: ["ttl_field"],
});

await client.alterCollectionProperties({
  collection_name: "my_collection",
  properties: { "collection.ttl.seconds": 1209600 }, // 14 days
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Step 1 — drop the ttl_field property (mandatory; the two modes are mutually exclusive)
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"propertyKeys\": [
        \"ttl_field\"
    ]
}"

# Step 2 — set a collection-level TTL for all entities
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"collection.ttl.seconds\": \"1209600\"
    }
}"
```

</TabItem>
</Tabs>

## FAQ\{#faqs}

### TTL 設定によってデータが期限切れになるのはいつですか？\{#when-does-data-expire-due-to-ttl-settings}

現在、データは挿入または upsert された時点に基づいて期限切れになります。期限切れのデータは検索結果に表示されません。詳細については、[例](./set-collection-ttl) を参照してください。

### 期限切れのデータが物理的に削除されるのはいつですか？\{#when-will-the-expired-data-be-physically-deleted}

データは期限切れになると、検索結果に含まれなくなります。ただし、実際に物理的に削除されるのは、クラスターの Compaction ポリシーに従って、次回のシステム Compaction が実行された後です。

期限切れになった直後にデータを削除する必要がある場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us/requests/new)ください。

### CU 容量が減少するのはいつですか？\{#when-will-the-cu-capacity-decrease}

クラスターの CU 容量は、メモリ使用量とストレージ使用量のいずれか大きい方です。ストレージ使用量が適用される場合は、期限切れのデータが物理的に削除された後に、Zilliz Cloud コンソールで CU 容量の減少を確認できます。

