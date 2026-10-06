---
title: "Use Large TopK | Cloud"
slug: /use-large-topk
sidebar_label: "Large TopK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A Zilliz Cloud collection allows you to retrieve up to 16,384 entities in a search or query result. To retrieve more entities beyond the topK limit, you can set the query mode to allow Zilliz Cloud to include millions of entities in a single search or query result, instead of using complex and time-consuming iterators. | Cloud"
type: origin
token: RH6MwFlaCig6LRkR6Qec206OnUc
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use Large TopK

A Zilliz Cloud collection allows you to retrieve up to 16,384 entities in a search or query result. To retrieve more entities beyond the topK limit, you can set the query mode to allow Zilliz Cloud to include millions of entities in a single search or query result, instead of using complex and time-consuming iterators.

<Admonition type="info" title="Notes">

This feature is available for Zilliz Cloud clusters that are compatible with Milvus v2.6.x. If you would like to try this feature, please [get in touch with us](https://support.zilliz.com/hc/en-us).

</Admonition>

## Overview\{#overview}

By default, a Zilliz Cloud collection supports a maximum topK of **16,384** in search or query operations. When you need to retrieve more entities in a single request, such as batch similarity search or data mining scenarios, you can enable the **Large TopK** mode by setting the `query_mode` property to `large_topk` on your collection. This raises the topK limit to **1,000,000** (one million) entities.

Enabling Large TopK changes the underlying index strategy from the default Auto Index to **IVF (Inverted File Index)** with **RaBitQ** deep compression, which is optimized for high-recall, large-range retrieval at the cost of small-K query performance.

## When to use Large TopK\{#when-to-use-large-topk}

Large TopK is designed for scenarios where you need to retrieve a very large number of similar entities in a single search, such as:

- **Batch similarity search**: Find the top 100,000 or 1,000,000 most similar items for a given query vector.

- **Data mining and analysis**: Extract large candidate sets for downstream processing, filtering, or model training.

- **Regression testing preparation**: Retrieve large result sets to build test corpora for simulation teams.

For interactive, latency-sensitive online queries with small topK (e.g., top 10 or top 100), the default query mode is recommended.

## Prerequisites and trade-offs\{#prerequisites-and-trade-offs}

Before enabling Large TopK, be aware of the following trade-offs:

- **Small-K performance degradation**: After switching to `large_topk`, small-K queries (K < 16,384) will experience increased latency and reduced recall compared to the default mode.

- **Query latency**: Large TopK queries have significantly higher latency than standard queries. A topK of 100,000 may take several seconds, and a topK of 1,000,000 may take minutes.

- **Resource usage**: A single large TopK query can consume several gigabytes of memory for result sorting. On Perf clusters, this may affect other queries running on the same cluster.

- **Offline preference**: For batch workloads, consider using an On-demand Compute database. Databases use on-demand CUs and do not affect online services.

- **Index rebuild required**: If your collection already has a vector index, you must release and drop the existing index before enabling Large TopK. Search will be unavailable during the rebuild.

## Enable Large TopK\{#enable-large-topk}

### During collection creation (recommended)\{#during-collection-creation-recommended}

If you know your collection will require Large TopK, specify it at creation time to avoid the cost of switching later:

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

### On an existing collection\{#on-an-existing-collection}

For an existing collection without a vector index, you can enable Large TopK directly:

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

For an existing collection **with** a vector index, you must first drop the index, then enable the mode, and finally recreate the index:

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

### Check current query mode\{#check-current-query-mode}

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

### Disable Large TopK\{#disable-large-topk}

To return to the default query mode, drop the `query_mode` property. Note that this also requires releasing and dropping the existing index first:

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

## Perform a Large TopK search\{#perform-a-large-topk-search}

Once Large TopK is enabled, use the standard `search` method with a large `limit` value:

### Online search (Serving Cluster)\{#online-search-serving-cluster}

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

### Offline search (On-demand Compute)\{#offline-search-on-demand-compute}

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

## Export search results\{#export-search-results}

There is no dedicated export API for Large TopK results. You can compose existing capabilities to write results to a Managed Volume:

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

## Performance expectations\{#performance-expectations}

The following table summarizes the performance characteristics of Large TopK queries:

| Metric | Default mode | Large TopK mode |
| --- | --- | --- |
| TopK limit | 16,384 | 1,000,000 |
| Small-K latency | Milliseconds | Higher (degraded) |
| Large-K latency | Not supported | Seconds to minutes |
| Memory per query | Low | Up to several GB |
| Concurrency | High | Limited (queued) |
| Best for | Online interaction | Batch, data mining |

Zilliz Cloud applies concurrency control to Large TopK queries to prevent resource exhaustion. Requests that exceed the concurrency limit are queued and processed when resources become available.

## Limitations\{#limitations}

- Switching query modes requires rebuilding the vector index. During the rebuild, search is unavailable for the collection.

- Large TopK is a collection-level setting. All indexes on the collection are affected.

- Three cluster types (Performance-optimized, Capacity-optimized, and Tiered Storage) all support Large TopK.

## FAQ\{#faq}

**Q: Can I switch back and forth frequently?**

Technically, yes, but it is not recommended. Each switch requires releasing, dropping, and recreating the index, during which search is unavailable. In an on-demand cluster, each rebuild also incurs Index Build CU charges.