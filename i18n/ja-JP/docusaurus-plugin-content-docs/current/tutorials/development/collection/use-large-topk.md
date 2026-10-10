---
title: "Large TopK を使用する | Cloud"
slug: /use-large-topk
sidebar_label: "Large TopK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のコレクションでは、検索またはクエリの結果で最大 16,384 件のエンティティを取得できます。topK の制限を超えてさらに多くのエンティティを取得するには、複雑で時間のかかるイテレーターを使用する代わりに、クエリモードを設定して、1 回の検索またはクエリ結果に Zilliz Cloud が数百万件のエンティティを含められるようにすることができます。 | Cloud"
type: origin
token: RH6MwFlaCig6LRkR6Qec206OnUc
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Large TopK を使用する

Zilliz Cloud のコレクションでは、検索またはクエリの結果で最大 16,384 件のエンティティを取得できます。topK の制限を超えてさらに多くのエンティティを取得するには、複雑で時間のかかるイテレーターを使用する代わりに、クエリモードを設定して、1 回の検索またはクエリ結果に Zilliz Cloud が数百万件のエンティティを含められるようにすることができます。

<Admonition type="info" title="Notes">

この機能は、Milvus v2.6.x と互換性のある Zilliz Cloud クラスターで利用できます。この機能を試したい場合は、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

</Admonition>

## 概要\{#overview}

デフォルトでは、Zilliz Cloud のコレクションは検索またはクエリ操作で最大 topK **16,384** をサポートします。バッチ類似検索やデータマイニングなどのシナリオのように、1 回のリクエストでさらに多くのエンティティを取得する必要がある場合は、コレクションで `query_mode` プロパティを `large_topk` に設定して **Large TopK** モードを有効にできます。これにより、topK の上限が **1,000,000**（100 万）件のエンティティに引き上げられます。

Large TopK を有効にすると、基盤となるインデックス戦略が、デフォルトのインデックスである Auto Index から、**RaBitQ** によるディープ圧縮を備えた **IVF（転置ファイルインデックス）** に変わります。これは、小規模な K のクエリ性能と引き換えに、高い再現率での大規模範囲検索に最適化されています。

## Large TopK を使用する場面\{#when-to-use-large-topk}

Large TopK は、1 回の検索で非常に多くの類似エンティティを取得する必要があるシナリオ向けに設計されています。たとえば、次のような場合です。

- **バッチ類似検索**: 指定したクエリベクトルに対して、類似度の高い上位 100,000 件または 1,000,000 件のアイテムを検索します。

- **データマイニングと分析**: 後続の処理、フィルタリング、またはモデルトレーニング用に大規模な候補セットを抽出します。

- **リグレッションテストの準備**: シミュレーションチーム用のテストコーパスを構築するために、大規模な結果セットを取得します。

topK が小さい（例：top 10 や top 100）対話型の低レイテンシなオンラインクエリには、デフォルトのクエリモードをお勧めします。

## 事前準備とトレードオフ\{#prerequisites-and-trade-offs}

Large TopK を有効にする前に、次のトレードオフに注意してください。

- **Small-K の性能低下**: `large_topk` に切り替えると、小規模な K のクエリ（K < 16,384）は、デフォルトモードと比べてレイテンシが増加し、再現率が低下します。

- **クエリレイテンシ**: Large TopK のクエリは、標準的なクエリよりもレイテンシが大幅に高くなります。topK が 100,000 の場合は数秒、topK が 1,000,000 の場合は数分かかることがあります。

- **リソース使用量**: 1 回の大規模な TopK クエリでは、結果の並べ替えのために数ギガバイトのメモリを消費する可能性があります。Perf クラスターでは、同じクラスター上で実行されている他のクエリに影響を与える可能性があります。

- **オフラインでの利用を推奨**: バッチワークロードには、On-demand Compute データベースの使用を検討してください。データベースはオンデマンド CU を使用し、オンラインサービスには影響しません。

- **インデックスの再構築が必要**: コレクションにすでにベクトルインデックスがある場合は、Large TopK を有効にする前に、既存のインデックスをリリースして削除する必要があります。再構築中は検索を利用できません。

## Large TopK を有効にする\{#enable-large-topk}

### コレクション作成時（推奨）\{#during-collection-creation-recommended}

コレクションで Large TopK が必要になるとわかっている場合は、後から切り替える手間を避けるため、作成時に指定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="your_uri", token="your_token")

schema = client.create_schema(auto_id=False)
schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("scenario_id", DataType.VARCHAR, max_length=64)
schema.add_field("title", DataType.VARCHAR, max_length=128)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=4)

index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_name="vector_idx", index_type="AUTOINDEX", metric_type="COSINE")

client.create_collection(
    collection_name="scenarios_corpus",
    schema=schema,
    index_params=index_params,
    properties={"query_mode": "large_topk"}
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

import java.util.Arrays;
import java.util.Collections;

ConnectConfig config = ConnectConfig.builder()
        .uri("your_uri")
        .token("your_token")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(true).build());
schema.addField(AddFieldReq.builder().fieldName("scenario_id").dataType(DataType.VarChar).maxLength(64).build());
schema.addField(AddFieldReq.builder().fieldName("title").dataType(DataType.VarChar).maxLength(128).build());
schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(4).build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("scenarios_corpus")
        .collectionSchema(schema)
        .indexParams(Arrays.asList(IndexParam.builder()
                .fieldName("vector")
                .indexName("vector_idx")
                .indexType(IndexParam.IndexType.AUTOINDEX)
                .metricType(IndexParam.MetricType.COSINE)
                .build()))
        .properties(Collections.singletonMap("query_mode", "large_topk"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "your_uri",
    APIKey:  "your_token",
})
if err != nil {
    panic(err)
}
defer cli.Close(ctx)

schema := entity.NewSchema().
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
    WithField(entity.NewField().WithName("scenario_id").WithDataType(entity.FieldTypeVarChar).WithMaxLength(64)).
    WithField(entity.NewField().WithName("title").WithDataType(entity.FieldTypeVarChar).WithMaxLength(128)).
    WithField(entity.NewField().WithName("vector").WithDataType(entity.FieldTypeFloatVector).WithDim(4))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("scenarios_corpus", schema).
    WithIndexOptions(milvusclient.NewCreateIndexOption("scenarios_corpus", "vector", index.NewAutoIndex(entity.COSINE)).WithIndexName("vector_idx")).
    WithProperty("query_mode", "large_topk"))
if err != nil {
    panic(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let client = ClientV2::new(&ConnectConfig::new().uri("your_uri").token("your_token")).await?;
let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true))
    .add_field(FieldSchema::new().name("scenario_id").data_type(DataType::VarChar).max_length(64))
    .add_field(FieldSchema::new().name("title").data_type(DataType::VarChar).max_length(128))
    .add_field(FieldSchema::new().name("vector").data_type(DataType::FloatVector).dimension(4));

client.create_collection(
    CreateCollectionRequest::builder()
        .collection_name("scenarios_corpus")
        .schema(schema)
        .index_params(vec![IndexParam::new()
            .field_name("vector")
            .index_name("vector_idx")
            .index_type(IndexType::AutoIndex)
            .metric_type(MetricType::Cosine)])
        .properties(HashMap::from([("query_mode".to_string(), "large_topk".to_string())]))
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <memory>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("your_uri").WithToken("your_token"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}

auto schema = std::make_shared<milvus::CollectionSchema>("scenarios_corpus");
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, false));
schema->AddField(milvus::FieldSchema("scenario_id", milvus::DataType::VARCHAR, "").WithMaxLength(64));
schema->AddField(milvus::FieldSchema("title", milvus::DataType::VARCHAR, "").WithMaxLength(128));
schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR, "").WithDimension(4));

status = client->CreateCollection(milvus::CreateCollectionRequest()
    .WithCollectionName("scenarios_corpus")
    .WithCollectionSchema(schema)
    .WithIndexes({milvus::IndexDesc(
        "vector", "vector_idx", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)})
    .AddProperty("query_mode", "large_topk"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "your_uri", token: "your_token" });

await client.createCollection({
  collection_name: "scenarios_corpus",
  schema: [
    { name: "id", data_type: DataType.Int64, is_primary_key: true },
    { name: "scenario_id", data_type: DataType.VarChar, max_length: 64 },
    { name: "title", data_type: DataType.VarChar, max_length: 128 },
    { name: "vector", data_type: DataType.FloatVector, dim: 4 },
  ],
  index_params: [{ field_name: "vector", index_name: "vector_idx", index_type: "AUTOINDEX", metric_type: "COSINE" }],
  properties: { query_mode: "large_topk" },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="your_uri"
export TOKEN="your_token"

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "scenarios_corpus",
    "schema": {
      "autoID": false,
      "fields": [
        {"fieldName": "id", "dataType": "Int64", "isPrimary": true},
        {"fieldName": "scenario_id", "dataType": "VarChar", "elementTypeParams": {"max_length": 64}},
        {"fieldName": "title", "dataType": "VarChar", "elementTypeParams": {"max_length": 128}},
        {"fieldName": "vector", "dataType": "FloatVector", "elementTypeParams": {"dim": 4}}
      ]
    },
    "indexParams": [{"fieldName": "vector", "indexName": "vector_idx", "indexType": "AUTOINDEX", "metricType": "COSINE"}],
    "properties": {"query_mode": "large_topk"}
  }'
```

</TabItem>
</Tabs>

### 既存のコレクションの場合\{#on-an-existing-collection}

ベクトルインデックスがない既存のコレクションでは、Large TopK を直接有効にできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="your_uri", token="your_token")

# 1. Enable Large TopK
client.alter_collection_properties(
    collection_name="scenarios_corpus",
    properties={"query_mode": "large_topk"}
)

# 2. Create the vector index and load the collection
index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_name="vector_idx", index_type="AUTOINDEX", metric_type="COSINE")
client.create_index(collection_name="scenarios_corpus", index_params=index_params)
client.load_collection(collection_name="scenarios_corpus")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.collection.request.CreateIndexReq;
import io.milvus.v2.service.collection.request.LoadCollectionReq;

import java.util.Arrays;
import java.util.Collections;

ConnectConfig config = ConnectConfig.builder().uri("your_uri").token("your_token").build();
MilvusClientV2 client = new MilvusClientV2(config);

// 1. Enable Large TopK
client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("scenarios_corpus")
        .properties(Collections.singletonMap("query_mode", "large_topk"))
        .build());

// 2. Create the vector index and load the collection
client.createIndex(CreateIndexReq.builder()
        .collectionName("scenarios_corpus")
        .indexParams(Arrays.asList(IndexParam.builder()
                .fieldName("vector")
                .indexName("vector_idx")
                .indexType(IndexParam.IndexType.AUTOINDEX)
                .metricType(IndexParam.MetricType.COSINE)
                .build()))
        .build());
client.loadCollection(LoadCollectionReq.builder()
        .collectionName("scenarios_corpus")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "your_uri", APIKey: "your_token"})
if err != nil {
    panic(err)
}
defer cli.Close(ctx)

// 1. Enable Large TopK
err = cli.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("scenarios_corpus").
    WithProperty("query_mode", "large_topk"))
if err != nil {
    panic(err)
}

// 2. Create the vector index and load the collection
indexTask, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("scenarios_corpus", "vector", index.NewAutoIndex(entity.COSINE)).WithIndexName("vector_idx"))
if err != nil {
    panic(err)
}
if err = indexTask.Await(ctx); err != nil {
    panic(err)
}
loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("scenarios_corpus"))
if err != nil {
    panic(err)
}
if err = loadTask.Await(ctx); err != nil {
    panic(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let client = ClientV2::new(&ConnectConfig::new().uri("your_uri").token("your_token")).await?;

// 1. Enable Large TopK
client.alter_collection_properties(
    AlterCollectionPropertiesRequest::builder()
        .collection_name("scenarios_corpus")
        .properties(HashMap::from([("query_mode".to_string(), "large_topk".to_string())]))
        .build()?,
).await?;

// 2. Create the vector index and load the collection
client.create_index(
    CreateIndexRequest::builder()
        .collection_name("scenarios_corpus")
        .index_param(IndexParam::new().field_name("vector").index_name("vector_idx").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine))
        .build()?,
).await?;
client.load_collection(LoadCollectionRequest::builder().collection_name("scenarios_corpus").build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("your_uri").WithToken("your_token"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}

// 1. Enable Large TopK
status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
    .WithCollectionName("scenarios_corpus")
    .AddProperty("query_mode", "large_topk"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}

// 2. Create the vector index and load the collection
status = client->CreateIndex(milvus::CreateIndexRequest().WithCollectionName("scenarios_corpus").WithIndexes({milvus::IndexDesc(
    "vector", "vector_idx", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)}));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}
status = client->LoadCollection(milvus::LoadCollectionRequest().WithCollectionName("scenarios_corpus"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "your_uri", token: "your_token" });

// 1. Enable Large TopK
await client.alterCollectionProperties({
  collection_name: "scenarios_corpus",
  properties: { query_mode: "large_topk" },
});

// 2. Create the vector index and load the collection
await client.createIndex({
  collection_name: "scenarios_corpus",
  field_name: "vector",
  index_name: "vector_idx",
  index_type: "AUTOINDEX",
  metric_type: "COSINE",
});
await client.loadCollection({ collection_name: "scenarios_corpus" });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="your_uri"
export TOKEN="your_token"

# 1. Enable Large TopK
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus", "properties": {"query_mode": "large_topk"}}'

# 2. Create the vector index and load the collection
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus", "indexParams": [{"fieldName": "vector", "indexName": "vector_idx", "indexType": "AUTOINDEX", "metricType": "COSINE"}]}'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus"}' 
```

</TabItem>
</Tabs>

ベクトルインデックスが**ある**既存のコレクションでは、まずインデックスを削除し、次にモードを有効にし、最後にインデックスを再作成する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="your_uri", token="your_token")

# 1. Release and drop the existing index
client.release_collection(collection_name="scenarios_corpus")
client.drop_index(collection_name="scenarios_corpus", index_name="vector_idx")

# 2. Enable Large TopK
client.alter_collection_properties(
    collection_name="scenarios_corpus",
    properties={"query_mode": "large_topk"}
)

# 3. Recreate the index and load the collection
index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_name="vector_idx", index_type="AUTOINDEX", metric_type="COSINE")
client.create_index(collection_name="scenarios_corpus", index_params=index_params)
client.load_collection(collection_name="scenarios_corpus")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;
import io.milvus.v2.service.index.request.CreateIndexReq;
import io.milvus.v2.service.index.request.DropIndexReq;

import java.util.Arrays;
import java.util.Collections;

ConnectConfig config = ConnectConfig.builder().uri("your_uri").token("your_token").build();
MilvusClientV2 client = new MilvusClientV2(config);

// 1. Release and drop the existing index
client.releaseCollection(ReleaseCollectionReq.builder().collectionName("scenarios_corpus").build());
client.dropIndex(DropIndexReq.builder().collectionName("scenarios_corpus").indexName("vector_idx").build());

// 2. Enable Large TopK
client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("scenarios_corpus")
        .properties(Collections.singletonMap("query_mode", "large_topk"))
        .build());

// 3. Recreate the index and load the collection
client.createIndex(CreateIndexReq.builder()
        .collectionName("scenarios_corpus")
        .indexParams(Arrays.asList(IndexParam.builder()
                .fieldName("vector")
                .indexName("vector_idx")
                .indexType(IndexParam.IndexType.AUTOINDEX)
                .metricType(IndexParam.MetricType.COSINE)
                .build()))
        .build());
client.loadCollection(LoadCollectionReq.builder()
        .collectionName("scenarios_corpus")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "your_uri", APIKey: "your_token"})
if err != nil {
    panic(err)
}
defer cli.Close(ctx)

// 1. Release and drop the existing index
if err := cli.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("scenarios_corpus")); err != nil {
    panic(err)
}
if err := cli.DropIndex(ctx, milvusclient.NewDropIndexOption("scenarios_corpus", "vector_idx")); err != nil {
    panic(err)
}

// 2. Enable Large TopK
if err := cli.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("scenarios_corpus").
    WithProperty("query_mode", "large_topk")); err != nil {
    panic(err)
}

// 3. Recreate the index and load the collection
indexTask, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("scenarios_corpus", "vector", index.NewAutoIndex(entity.COSINE)).WithIndexName("vector_idx"))
if err != nil {
    panic(err)
}
if err = indexTask.Await(ctx); err != nil {
    panic(err)
}
loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("scenarios_corpus"))
if err != nil {
    panic(err)
}
if err = loadTask.Await(ctx); err != nil {
    panic(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let client = ClientV2::new(&ConnectConfig::new().uri("your_uri").token("your_token")).await?;

// 1. Release and drop the existing index
client.release_collection(ReleaseCollectionRequest::builder().collection_name("scenarios_corpus").build()?).await?;
client.drop_index(DropIndexRequest::builder().collection_name("scenarios_corpus").index_name("vector_idx").build()?).await?;

// 2. Enable Large TopK
client.alter_collection_properties(
    AlterCollectionPropertiesRequest::builder()
        .collection_name("scenarios_corpus")
        .properties(HashMap::from([("query_mode".to_string(), "large_topk".to_string())]))
        .build()?,
).await?;

// 3. Recreate the index and load the collection
client.create_index(
    CreateIndexRequest::builder()
        .collection_name("scenarios_corpus")
        .index_param(IndexParam::new().field_name("vector").index_name("vector_idx").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine))
        .build()?,
).await?;
client.load_collection(LoadCollectionRequest::builder().collection_name("scenarios_corpus").build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("your_uri").WithToken("your_token"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}

// 1. Release and drop the existing index
status = client->ReleaseCollection(milvus::ReleaseCollectionRequest().WithCollectionName("scenarios_corpus"));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }
status = client->DropIndex(milvus::DropIndexRequest().WithCollectionName("scenarios_corpus").WithIndexName("vector_idx"));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }

// 2. Enable Large TopK
status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
    .WithCollectionName("scenarios_corpus").AddProperty("query_mode", "large_topk"));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }

// 3. Recreate the index and load the collection
status = client->CreateIndex(milvus::CreateIndexRequest().WithCollectionName("scenarios_corpus").WithIndexes({milvus::IndexDesc(
    "vector", "vector_idx", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)}));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}
status = client->LoadCollection(milvus::LoadCollectionRequest().WithCollectionName("scenarios_corpus"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "your_uri", token: "your_token" });

// 1. Release and drop the existing index
await client.releaseCollection({ collection_name: "scenarios_corpus" });
await client.dropIndex({ collection_name: "scenarios_corpus", index_name: "vector_idx" });

// 2. Enable Large TopK
await client.alterCollectionProperties({
  collection_name: "scenarios_corpus",
  properties: { query_mode: "large_topk" },
});

// 3. Recreate the index and load the collection
await client.createIndex({
  collection_name: "scenarios_corpus",
  field_name: "vector",
  index_name: "vector_idx",
  index_type: "AUTOINDEX",
  metric_type: "COSINE",
});
await client.loadCollection({ collection_name: "scenarios_corpus" });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="your_uri"
export TOKEN="your_token"

# 1. Release and drop the existing index
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/release" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus"}'

curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/drop" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus", "indexName": "vector_idx"}'

# 2. Enable Large TopK
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus", "properties": {"query_mode": "large_topk"}}'

# 3. Recreate the index and load the collection
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus", "indexParams": [{"fieldName": "vector", "indexName": "vector_idx", "indexType": "AUTOINDEX", "metricType": "COSINE"}]}'

curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus"}' 
```

</TabItem>
</Tabs>

### 現在のクエリモードを確認する\{#check-current-query-mode}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="your_uri", token="your_token")
info = client.describe_collection(collection_name="scenarios_corpus")
query_mode = info["properties"].get("query_mode")  # None means default mode
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;

ConnectConfig config = ConnectConfig.builder().uri("your_uri").token("your_token").build();
MilvusClientV2 client = new MilvusClientV2(config);

DescribeCollectionResp info = client.describeCollection(DescribeCollectionReq.builder().collectionName("scenarios_corpus").build());
String queryMode = info.getProperties().get("query_mode"); // null means default mode
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "your_uri", APIKey: "your_token"})
if err != nil {
    panic(err)
}
defer cli.Close(ctx)

info, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("scenarios_corpus"))
if err != nil {
    panic(err)
}
queryMode := info.Properties["query_mode"] // empty string means default mode
_ = queryMode
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("your_uri").token("your_token")).await?;

let info = client
    .describe_collection(DescribeCollectionRequest::builder().collection_name("scenarios_corpus").build()?)
    .await?;
let query_mode = info.description().get_properties().get("query_mode"); // None means default mode
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("your_uri").WithToken("your_token"));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }

milvus::DescribeCollectionResponse info;
status = client->DescribeCollection(
    milvus::DescribeCollectionRequest().WithCollectionName("scenarios_corpus"), info);
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }

auto item = info.Desc().Properties().find("query_mode");
bool hasMode = item != info.Desc().Properties().end();
std::string queryMode = hasMode ? item->second : "";
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "your_uri", token: "your_token" });
const info = await client.describeCollection({ collection_name: "scenarios_corpus" });
const properties = Object.fromEntries((info.properties ?? []).map(({key, value}) => [key, value]));
const queryMode = properties.query_mode; // undefined means default mode
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="your_uri"
export TOKEN="your_token"

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/describe" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus"}' 
```

</TabItem>
</Tabs>

### Large TopK を無効にする\{#disable-large-topk}

デフォルトのクエリモードに戻すには、`query_mode` プロパティを削除します。この場合も、先に既存のインデックスをリリースして削除する必要があることに注意してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="your_uri", token="your_token")

# 1. Release and drop the existing index
client.release_collection(collection_name="scenarios_corpus")
client.drop_index(collection_name="scenarios_corpus", index_name="vector_idx")

# 2. Drop query_mode to return to the default mode
client.drop_collection_properties(
    collection_name="scenarios_corpus",
    property_keys=["query_mode"]
)

# 3. Recreate the index and load the collection
index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_name="vector_idx", index_type="AUTOINDEX", metric_type="COSINE")
client.create_index(collection_name="scenarios_corpus", index_params=index_params)
client.load_collection(collection_name="scenarios_corpus")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;
import io.milvus.v2.service.index.request.CreateIndexReq;
import io.milvus.v2.service.index.request.DropIndexReq;

import java.util.Arrays;

ConnectConfig config = ConnectConfig.builder().uri("your_uri").token("your_token").build();
MilvusClientV2 client = new MilvusClientV2(config);

// 1. Release and drop the existing index
client.releaseCollection(ReleaseCollectionReq.builder().collectionName("scenarios_corpus").build());
client.dropIndex(DropIndexReq.builder().collectionName("scenarios_corpus").indexName("vector_idx").build());

// 2. Drop query_mode to return to the default mode
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("scenarios_corpus")
        .propertyKeys(Arrays.asList("query_mode"))
        .build());

// 3. Recreate the index and load the collection
client.createIndex(CreateIndexReq.builder()
        .collectionName("scenarios_corpus")
        .indexParams(Arrays.asList(IndexParam.builder()
                .fieldName("vector")
                .indexName("vector_idx")
                .indexType(IndexParam.IndexType.AUTOINDEX)
                .metricType(IndexParam.MetricType.COSINE)
                .build()))
        .build());
client.loadCollection(LoadCollectionReq.builder()
        .collectionName("scenarios_corpus")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "your_uri", APIKey: "your_token"})
if err != nil {
    panic(err)
}
defer cli.Close(ctx)

// 1. Release and drop the existing index
if err := cli.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("scenarios_corpus")); err != nil {
    panic(err)
}
if err := cli.DropIndex(ctx, milvusclient.NewDropIndexOption("scenarios_corpus", "vector_idx")); err != nil {
    panic(err)
}

// 2. Drop query_mode to return to the default mode
if err := cli.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("scenarios_corpus", "query_mode")); err != nil {
    panic(err)
}

// 3. Recreate the index and load the collection
indexTask, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("scenarios_corpus", "vector", index.NewAutoIndex(entity.COSINE)).WithIndexName("vector_idx"))
if err != nil {
    panic(err)
}
if err = indexTask.Await(ctx); err != nil {
    panic(err)
}
loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("scenarios_corpus"))
if err != nil {
    panic(err)
}
if err = loadTask.Await(ctx); err != nil {
    panic(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("your_uri").token("your_token")).await?;

// 1. Release and drop the existing index
client.release_collection(ReleaseCollectionRequest::builder().collection_name("scenarios_corpus").build()?).await?;
client.drop_index(DropIndexRequest::builder().collection_name("scenarios_corpus").index_name("vector_idx").build()?).await?;

// 2. Drop query_mode to return to the default mode
client.drop_collection_properties(
    DropCollectionPropertiesRequest::builder()
        .collection_name("scenarios_corpus")
        .property_keys(["query_mode"])
        .build()?,
).await?;

// 3. Recreate the index and load the collection
client.create_index(
    CreateIndexRequest::builder()
        .collection_name("scenarios_corpus")
        .index_param(IndexParam::new().field_name("vector").index_name("vector_idx").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine))
        .build()?,
).await?;
client.load_collection(LoadCollectionRequest::builder().collection_name("scenarios_corpus").build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("your_uri").WithToken("your_token"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}

// 1. Release and drop the existing index
status = client->ReleaseCollection(milvus::ReleaseCollectionRequest().WithCollectionName("scenarios_corpus"));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }
status = client->DropIndex(milvus::DropIndexRequest().WithCollectionName("scenarios_corpus").WithIndexName("vector_idx"));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }

// 2. Drop query_mode to return to the default mode
status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
    .WithCollectionName("scenarios_corpus").AddPropertyKey("query_mode"));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }

// 3. Recreate the index and load the collection
status = client->CreateIndex(milvus::CreateIndexRequest().WithCollectionName("scenarios_corpus").WithIndexes({milvus::IndexDesc(
    "vector", "vector_idx", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)}));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}
status = client->LoadCollection(milvus::LoadCollectionRequest().WithCollectionName("scenarios_corpus"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
    return 1;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "your_uri", token: "your_token" });

// 1. Release and drop the existing index
await client.releaseCollection({ collection_name: "scenarios_corpus" });
await client.dropIndex({ collection_name: "scenarios_corpus", index_name: "vector_idx" });

// 2. Drop query_mode to return to the default mode
await client.dropCollectionProperties({
  collection_name: "scenarios_corpus",
  properties: ["query_mode"],
});

// 3. Recreate the index and load the collection
await client.createIndex({
  collection_name: "scenarios_corpus",
  field_name: "vector",
  index_name: "vector_idx",
  index_type: "AUTOINDEX",
  metric_type: "COSINE",
});
await client.loadCollection({ collection_name: "scenarios_corpus" });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="your_uri"
export TOKEN="your_token"

# 1. Release and drop the existing index
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/release" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus"}'

curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/drop" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus", "indexName": "vector_idx"}'

# 2. Drop query_mode to return to the default mode
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus", "propertyKeys": ["query_mode"]}'

# 3. Recreate the index and load the collection
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus", "indexParams": [{"fieldName": "vector", "indexName": "vector_idx", "indexType": "AUTOINDEX", "metricType": "COSINE"}]}'

curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" \
  --data '{"collectionName": "scenarios_corpus"}' 
```

</TabItem>
</Tabs>

## Large TopK 検索を実行する\{#perform-a-large-topk-search}

Large TopK を有効にしたら、標準の `search` メソッドに大きな `limit` 値を指定して使用します。

### オンライン検索（Serving クラスター）\{#online-search-serving-cluster}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="your_uri", token="your_token")
query_vector = [0.1, 0.2, 0.3, 0.4]

results = client.search(
    collection_name="scenarios_serving",
    data=[query_vector],
    limit=500000
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;

ConnectConfig config = ConnectConfig.builder().uri("your_uri").token("your_token").build();
MilvusClientV2 client = new MilvusClientV2(config);

float[] queryVector = {0.1f, 0.2f, 0.3f, 0.4f};

SearchResp results = client.search(SearchReq.builder()
        .collectionName("scenarios_serving")
        .data(Arrays.asList(new FloatVec(queryVector)))
        .topK(500000)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "your_uri", APIKey: "your_token"})
if err != nil {
    panic(err)
}
defer cli.Close(ctx)

queryVector := entity.FloatVector([]float32{0.1, 0.2, 0.3, 0.4})
resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "scenarios_serving", 500000, []entity.Vector{queryVector}))
if err != nil {
    panic(err)
}
_ = resultSets
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("your_uri").token("your_token")).await?;

let query_vector = vec![0.1, 0.2, 0.3, 0.4];
let results = client
    .search(
        SearchRequest::builder()
            .collection_name("scenarios_serving")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(500000)
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
auto status = client->Connect(milvus::ConnectParam("your_uri").WithToken("your_token"));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }

milvus::SearchResponse results;
status = client->Search(
    milvus::SearchRequest().WithCollectionName("scenarios_serving").WithLimit(500000)
        .WithAnnsField("vector").AddFloatVector({0.1f, 0.2f, 0.3f, 0.4f}), results);
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "your_uri", token: "your_token" });
const queryVector = [0.1, 0.2, 0.3, 0.4];

const results = await client.search({
  collection_name: "scenarios_serving",
  data: [queryVector],
  limit: 500000,
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="your_uri"
export TOKEN="your_token"

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "scenarios_serving",
    "data": [[0.1, 0.2, 0.3, 0.4]],
    "annsField": "vector",
    "limit": 500000
  }' 
```

</TabItem>
</Tabs>

### オフライン検索（On-demand Compute）\{#offline-search-on-demand-compute}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="your_uri", token="your_token")
query_vector = [0.1, 0.2, 0.3, 0.4]

results = client.search(
    collection_name="scenarios_corpus",
    data=[query_vector],
    limit=500000
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;

ConnectConfig config = ConnectConfig.builder().uri("your_uri").token("your_token").build();
MilvusClientV2 client = new MilvusClientV2(config);

float[] queryVector = {0.1f, 0.2f, 0.3f, 0.4f};

SearchResp results = client.search(SearchReq.builder()
        .collectionName("scenarios_corpus")
        .data(Arrays.asList(new FloatVec(queryVector)))
        .topK(500000)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "your_uri", APIKey: "your_token"})
if err != nil {
    panic(err)
}
defer cli.Close(ctx)

queryVector := entity.FloatVector([]float32{0.1, 0.2, 0.3, 0.4})
resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "scenarios_corpus", 500000, []entity.Vector{queryVector}))
if err != nil {
    panic(err)
}
_ = resultSets
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("your_uri").token("your_token")).await?;

let query_vector = vec![0.1, 0.2, 0.3, 0.4];
let results = client
    .search(
        SearchRequest::builder()
            .collection_name("scenarios_corpus")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(500000)
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
auto status = client->Connect(milvus::ConnectParam("your_uri").WithToken("your_token"));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }

milvus::SearchResponse results;
status = client->Search(
    milvus::SearchRequest().WithCollectionName("scenarios_corpus").WithLimit(500000)
        .WithAnnsField("vector").AddFloatVector({0.1f, 0.2f, 0.3f, 0.4f}), results);
if (!status.IsOk()) { std::cout << status.Message() << std::endl; return 1; }
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "your_uri", token: "your_token" });
const queryVector = [0.1, 0.2, 0.3, 0.4];

const results = await client.search({
  collection_name: "scenarios_corpus",
  data: [queryVector],
  limit: 500000,
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="your_uri"
export TOKEN="your_token"

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "scenarios_corpus",
    "data": [[0.1, 0.2, 0.3, 0.4]],
    "annsField": "vector",
    "limit": 500000
  }' 
```

</TabItem>
</Tabs>

## 検索結果をエクスポートする\{#export-search-results}

Large TopK の結果専用のエクスポート API はありません。既存の機能を組み合わせて、結果を Managed Volume に書き込むことができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import pyarrow as pa
import pyarrow.parquet as pq

# Configure a Zilliz Cloud Managed Volume client as volume_file_manager.
writer = None
try:
    for i, qvec in enumerate(query_vectors):
        results = client.search(
            collection_name="scenarios_corpus",
            data=[qvec],
            limit=100000,
            output_fields=["scenario_id", "title"]
        )

        rows = [
            {
                "query_id": i,
                "rank": j,
                "scenario_id": hit["entity"].get("scenario_id"),
                "title": hit["entity"].get("title")
            }
            for j, hit in enumerate(results[0])
        ]
        table = pa.Table.from_pylist(rows)

        if writer is None:
            writer = pq.ParquetWriter("/tmp/results.parquet", table.schema)
        writer.write_table(table)
finally:
    if writer is not None:
        writer.close()

volume_file_manager.upload_file_to_volume(
    source_file_path="/tmp/results.parquet",
    target_volume_path="results/batch.parquet"
)
```

</TabItem>

<TabItem value='java'>

```java
Note: Zilliz Cloud Managed Volume upload is not available in milvus-sdk-java as of v3.0.10.
```

</TabItem>

<TabItem value='go'>

```go
// Note: Zilliz Cloud Managed Volume upload is not available in the Go SDK as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: Zilliz Cloud Managed Volume upload is not available in milvus-sdk-rust as of v3.0.2.
```

</TabItem>

<TabItem value='c++'>

```c++
// Note: Zilliz Cloud Managed Volume upload is not available in milvus-sdk-cpp as of v3.0.3.
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Note: Zilliz Cloud Managed Volume upload is not available in the Node.js SDK as of v3.0.5.
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: Zilliz Cloud Managed Volume upload has no Milvus RESTful endpoint as of v3.0.x.
```

</TabItem>
</Tabs>

## パフォーマンスの目安\{#performance-expectations}

次の表に、Large TopK クエリのパフォーマンス特性をまとめます。

| メトリクス | デフォルトモード | Large TopK モード |
| --- | --- | --- |
| topK の上限 | 16,384 | 1,000,000 |
| Small-K のレイテンシ | ミリ秒 | より高い（低下） |
| Large-K のレイテンシ | 未サポート | 数秒から数分 |
| クエリごとのメモリ | 少ない | 最大数 GB |
| 同時実行数 | 高い | 制限あり（キューイング） |
| 最適な用途 | オンラインでの対話 | バッチ、データマイニング |

Zilliz Cloud は、リソースの枯渇を防ぐために Large TopK クエリに同時実行制御を適用します。同時実行数の上限を超えたリクエストはキューに入れられ、リソースが利用可能になったときに処理されます。

## 制限事項\{#limitations}

- クエリモードを切り替えるには、ベクトルインデックスを再構築する必要があります。再構築中は、そのコレクションで検索を利用できません。

- Large TopK はコレクションレベルの設定です。コレクション上のすべてのインデックスが影響を受けます。

- 3つのクラスタータイプ（Performance-optimized、Capacity-optimized、Tiered Storage）はすべて Large TopK をサポートしています。

## FAQ\{#faq}

**Q: 頻繁に切り替えることはできますか？**

技術的には可能ですが、お勧めしません。切り替えのたびにインデックスのリリース、削除、再作成が必要で、その間は検索を利用できません。オンデマンドクラスターでは、再構築のたびにインデックス構築 CU の料金も発生します。
