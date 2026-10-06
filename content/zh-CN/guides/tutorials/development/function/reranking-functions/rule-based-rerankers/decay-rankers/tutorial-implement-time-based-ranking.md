---
title: "教程：实现基于时间的排序 | Cloud"
slug: /tutorial-implement-time-based-ranking
sidebar_label: "教程：实现基于时间的排序"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在许多搜索应用中，内容的时效性与相关性同样重要。新闻文章、产品列表、社交媒体帖子和研究论文都受益于能平衡语义相关性与时效性的排名系统。本教程将展示如何使用 Decay Ranker 在 Zilliz Cloud 中实现基于时间的排名。 | Cloud"
type: origin
token: Poidwz97ZiNIRDkvM9Xc68ELnGb
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 教程：实现基于时间的排序

在许多搜索应用中，内容的时效性与相关性同样重要。新闻文章、产品列表、社交媒体帖子和研究论文都受益于能平衡语义相关性与时效性的排名系统。本教程将展示如何使用 Decay Ranker 在 Zilliz Cloud 中实现基于时间的排名。

## 了解 Decay Ranker\{#understand-decay-rankers}

Decay Ranker 允许您根据相对于参考点的数值（如时间戳）来提升或降低文档的权重。对于基于时间的排序，这意味着即使新文档和旧文档的语义相关性相似，新文档也能获得比旧文档更高的分数。

Zilliz Cloud 支持三种类型的 Decay Ranker：

- **高斯衰减** （`gauss`）：一种钟形曲线，提供平滑、渐进的衰减

- **指数衰减**（`exp`）：为强烈强调近期内容创建更陡峭的初始衰减

- **线性衰减** （`linear`）：一种可预测且易于理解的直线衰减

每个 Ranker 都有不同的特性，使其适用于各种用例。如需更多信息，请参考[Decay Ranker 概述](./decay-ranker-oveview)。

## 构建一个时间感知搜索系统\{#build-a-time-aware-search-system}

我们将创建一个新闻文章搜索系统，展示如何基于相关性和时间对内容进行有效排序。让我们从实现开始：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import datetime
import matplotlib.pyplot as plt
import numpy as np
from pymilvus import (
    MilvusClient,
    DataType,
    Function,
    FunctionType,
    AnnSearchRequest,
)

# Create connection to Milvus
milvus_client = MilvusClient("YOUR_CLUSTER_ENDPOINT")

# Define collection name
collection_name = "news_articles_tutorial"

# Clean up any existing collection with the same name
milvus_client.drop_collection(collection_name)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionReq;

String collectionName = "news_articles_tutorial";
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());
client.dropCollection(DropCollectionReq.builder().collectionName(collectionName).build());
```

</TabItem>

<TabItem value='go'>

```go
ctx := context.Background()
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}

collectionName := "news_articles_tutorial"
_ = client.DropCollection(ctx, milvusclient.NewDropCollectionOption(collectionName))
```

</TabItem>

<TabItem value='rust'>

```rust
let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");
let client = ClientV2::new(&config).await?;

let collection_name = "news_articles_tutorial";
client.drop_collection(DropCollectionRequest::builder().collection_name(collection_name).build()?).await.ok();
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string collection_name = "news_articles_tutorial";
status = client->DropCollection(milvus::DropCollectionRequest().WithCollectionName(collection_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });
const collection_name = "news_articles_tutorial";

await client.dropCollection({ collection_name });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{"collectionName": "news_articles_tutorial"}' 
```

</TabItem>
</Tabs>

## 步骤1：设计 Schema\{#step-1-design-the-schema}

对于基于时间的搜索，我们需要将发布时间戳与内容一起存储：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create schema with fields for content and temporal information
schema = milvus_client.create_schema(enable_dynamic_field=False, auto_id=True)
schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("headline", DataType.VARCHAR, max_length=200, enable_analyzer=True)
schema.add_field("content", DataType.VARCHAR, max_length=2000, enable_analyzer=True)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1024)  # For dense embeddings
schema.add_field("sparse_vector", DataType.SPARSE_FLOAT_VECTOR)  # For sparse (BM25) search
schema.add_field("publish_date", DataType.INT64)  # Timestamp for decay ranking
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(true).autoID(true).build());
schema.addField(AddFieldReq.builder().fieldName("headline").dataType(DataType.VarChar).maxLength(200).enableAnalyzer(true).build());
schema.addField(AddFieldReq.builder().fieldName("content").dataType(DataType.VarChar).maxLength(2000).enableAnalyzer(true).build());
schema.addField(AddFieldReq.builder().fieldName("dense").dataType(DataType.FloatVector).dimension(1024).build());
schema.addField(AddFieldReq.builder().fieldName("sparse_vector").dataType(DataType.SparseFloatVector).build());
schema.addField(AddFieldReq.builder().fieldName("publish_date").dataType(DataType.Int64).build());
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

schema := entity.NewSchema().
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true).WithIsAutoID(true)).
    WithField(entity.NewField().WithName("headline").WithDataType(entity.FieldTypeVarChar).WithMaxLength(200).WithEnableAnalyzer(true)).
    WithField(entity.NewField().WithName("content").WithDataType(entity.FieldTypeVarChar).WithMaxLength(2000).WithEnableAnalyzer(true)).
    WithField(entity.NewField().WithName("dense").WithDataType(entity.FieldTypeFloatVector).WithDim(1024)).
    WithField(entity.NewField().WithName("sparse_vector").WithDataType(entity.FieldTypeSparseVector)).
    WithField(entity.NewField().WithName("publish_date").WithDataType(entity.FieldTypeInt64))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(true))
    .add_field(FieldSchema::new().name("headline").data_type(DataType::VarChar).max_length(200).enable_analyzer(true))
    .add_field(FieldSchema::new().name("content").data_type(DataType::VarChar).max_length(2000).enable_analyzer(true))
    .add_field(FieldSchema::new().name("dense").data_type(DataType::FloatVector).dimension(1024))
    .add_field(FieldSchema::new().name("sparse_vector").data_type(DataType::SparseFloatVector))
    .add_field(FieldSchema::new().name("publish_date").data_type(DataType::Int64));
```

</TabItem>

<TabItem value='c++'>

```c++
auto schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64).WithPrimaryKey(true).WithAutoID(true));
schema->AddField(milvus::FieldSchema("headline", milvus::DataType::VARCHAR).WithMaxLength(200).EnableAnalyzer(true));
schema->AddField(milvus::FieldSchema("content", milvus::DataType::VARCHAR).WithMaxLength(2000).EnableAnalyzer(true));
schema->AddField(milvus::FieldSchema("dense", milvus::DataType::FLOAT_VECTOR).WithDimension(1024));
schema->AddField(milvus::FieldSchema("sparse_vector", milvus::DataType::SPARSE_FLOAT_VECTOR));
schema->AddField(milvus::FieldSchema("publish_date", milvus::DataType::INT64));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

const fields = [
  { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: true },
  { name: "headline", data_type: DataType.VarChar, max_length: 200, enable_analyzer: true },
  { name: "content", data_type: DataType.VarChar, max_length: 2000, enable_analyzer: true },
  { name: "dense", data_type: DataType.FloatVector, dim: 1024 },
  { name: "sparse_vector", data_type: DataType.SparseFloatVector },
  { name: "publish_date", data_type: DataType.Int64 },
];
```

</TabItem>

<TabItem value='bash'>

```bash
fields='[
  {"fieldName": "id", "dataType": "Int64", "isPrimary": true},
  {"fieldName": "headline", "dataType": "VarChar", "elementTypeParams": {"max_length": 200, "enable_analyzer": true}},
  {"fieldName": "content", "dataType": "VarChar", "elementTypeParams": {"max_length": 2000, "enable_analyzer": true}},
  {"fieldName": "dense", "dataType": "FloatVector", "elementTypeParams": {"dim": 1024}},
  {"fieldName": "sparse_vector", "dataType": "SparseFloatVector"},
  {"fieldName": "publish_date", "dataType": "Int64"}
]' 
```

</TabItem>
</Tabs>

## 步骤2：设置嵌入函数\{#step-2-set-up-embedding-functions}

我们将配置密集（语义）和稀疏（关键词）嵌入函数：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create embedding function for semantic search
text_embedding_function = Function(
    name="siliconflow_embedding",
    function_type=FunctionType.TEXTEMBEDDING,
    input_field_names=["content"],
    output_field_names=["dense"],
    params={
        "provider": "siliconflow",
        "model_name": "BAAI/bge-large-en-v1.5",
        "credential": "your-api-key"
    }
)
schema.add_function(text_embedding_function)

# Create BM25 function for keyword search
bm25_function = Function(
    name="bm25",
    input_field_names=["content"],
    output_field_names=["sparse_vector"],
    function_type=FunctionType.BM25,
)
schema.add_function(bm25_function)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.Collections;

schema.addFunction(CreateCollectionReq.Function.builder()
        .name("siliconflow_embedding")
        .functionType(FunctionType.TEXTEMBEDDING)
        .inputFieldNames(Collections.singletonList("content"))
        .outputFieldNames(Collections.singletonList("dense"))
        .param("provider", "siliconflow")
        .param("model_name", "BAAI/bge-large-en-v1.5")
        .param("credential", "your-api-key")
        .build());

schema.addFunction(CreateCollectionReq.Function.builder()
        .name("bm25")
        .functionType(FunctionType.BM25)
        .inputFieldNames(Collections.singletonList("content"))
        .outputFieldNames(Collections.singletonList("sparse_vector"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
textEmbeddingFunction := entity.NewFunction().
    WithName("siliconflow_embedding").
    WithType(entity.FunctionTypeTextEmbedding).
    WithInputFields("content").
    WithOutputFields("dense").
    WithParam("provider", "siliconflow").
    WithParam("model_name", "BAAI/bge-large-en-v1.5").
    WithParam("credential", "your-api-key")

schema = schema.WithFunction(textEmbeddingFunction)

bm25Function := entity.NewFunction().
    WithName("bm25").
    WithType(entity.FunctionTypeBM25).
    WithInputFields("content").
    WithOutputFields("sparse_vector")

schema = schema.WithFunction(bm25Function)
```

</TabItem>

<TabItem value='rust'>

```rust
use std::collections::HashMap;

let schema = schema.add_function(
    Function::new()
        .name("siliconflow_embedding")
        .function_type(FunctionType::TextEmbedding)
        .input_fields(vec!["content"])
        .output_fields(vec!["dense"])
        .param("provider", "siliconflow")
        .param("model_name", "BAAI/bge-large-en-v1.5")
        .param("credential", "your-api-key"),
);

let schema = schema.add_function(
    Function::new()
        .name("bm25")
        .function_type(FunctionType::Bm25)
        .input_fields(vec!["content"])
        .output_fields(vec!["sparse_vector"]),
);
```

</TabItem>

<TabItem value='c++'>

```c++
auto embedding_function = std::make_shared<milvus::Function>("siliconflow_embedding", milvus::FunctionType::TEXTEMBEDDING);
embedding_function->AddInputFieldName("content");
embedding_function->AddOutputFieldName("dense");
embedding_function->AddParam("provider", "siliconflow");
embedding_function->AddParam("model_name", "BAAI/bge-large-en-v1.5");
embedding_function->AddParam("credential", "your-api-key");
schema->AddFunction(embedding_function);

auto bm25_function = std::make_shared<milvus::Function>("bm25", milvus::FunctionType::BM25);
bm25_function->AddInputFieldName("content");
bm25_function->AddOutputFieldName("sparse_vector");
schema->AddFunction(bm25_function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const functions = [
  {
    name: "siliconflow_embedding",
    type: FunctionType.TEXTEMBEDDING,
    input_field_names: ["content"],
    output_field_names: ["dense"],
    params: { provider: "siliconflow", model_name: "BAAI/bge-large-en-v1.5", credential: "your-api-key" },
  },
  {
    name: "bm25",
    type: FunctionType.BM25,
    input_field_names: ["content"],
    output_field_names: ["sparse_vector"],
    params: {},
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
functions='[
  {
    "name": "siliconflow_embedding",
    "type": "TextEmbedding",
    "inputFieldNames": ["content"],
    "outputFieldNames": ["dense"],
    "params": {"provider": "siliconflow", "model_name": "BAAI/bge-large-en-v1.5", "credential": "your-api-key"}
  },
  {
    "name": "bm25",
    "type": "BM25",
    "inputFieldNames": ["content"],
    "outputFieldNames": ["sparse_vector"]
  }
]' 
```

</TabItem>
</Tabs>

## 步骤3：配置索引参数\{#step-3-configure-index-parameters}

让我们为快速向量搜索设置适当的索引参数：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set up indexes for fast search
index_params = milvus_client.prepare_index_params()

# Dense vector index
index_params.add_index(field_name="dense", index_type="AUTOINDEX", metric_type="L2")

# Sparse vector index
index_params.add_index(
    field_name="sparse_vector",
    index_name="sparse_inverted_index",
    index_type="AUTOINDEX",
    metric_type="BM25",
)

# Create the collection with our schema and indexes
milvus_client.create_collection(
    collection_name,
    schema=schema,
    index_params=index_params,
    consistency_level="Strong"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.Arrays;

IndexParam denseIndex = IndexParam.builder()
        .fieldName("dense")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build();

IndexParam sparseIndex = IndexParam.builder()
        .fieldName("sparse_vector")
        .indexName("sparse_inverted_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.BM25)
        .build();

client.createCollection(CreateCollectionReq.builder()
        .collectionName(collectionName)
        .collectionSchema(schema)
        .indexParams(Arrays.asList(denseIndex, sparseIndex))
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
)

denseIndex := milvusclient.NewCreateIndexOption(collectionName, "dense", index.NewAutoIndex(entity.L2)).
    WithIndexName("dense")

sparseIndex := milvusclient.NewCreateIndexOption(collectionName, "sparse_vector", index.NewAutoIndex(entity.BM25)).
    WithIndexName("sparse_inverted_index")

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption(collectionName, schema).
    WithIndexOptions(denseIndex, sparseIndex).
    WithConsistencyLevel(entity.ClStrong))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
let index_params = vec![
    IndexParam::new().field_name("dense").index_type(IndexType::AutoIndex).metric_type(MetricType::L2),
    IndexParam::new().field_name("sparse_vector").index_name("sparse_inverted_index").index_type(IndexType::AutoIndex).metric_type(MetricType::Bm25),
];

client.create_collection(CreateCollectionRequest::builder()
    .collection_name(collection_name)
    .schema(schema)
    .index_params(index_params)
    .consistency_level(ConsistencyLevel::Strong)
    .build()?)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc dense_index("dense", "dense", milvus::IndexType::AUTOINDEX, milvus::MetricType::L2);
milvus::IndexDesc sparse_index("sparse_vector", "sparse_inverted_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::BM25);

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                     .WithCollectionName(collection_name)
                                     .WithCollectionSchema(schema)
                                     .WithConsistencyLevel(milvus::ConsistencyLevel::STRONG));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; }

status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName(collection_name)
                                 .AddIndex(std::move(dense_index))
                                 .AddIndex(std::move(sparse_index)));
if (!status.IsOk()) { std::cout << status.Message() << std::endl; }
```

</TabItem>

<TabItem value='javascript'>

```javascript
const denseIndex = {
  field_name: "dense",
  index_type: IndexType.AUTOINDEX,
  metric_type: MetricType.L2,
};

const sparseIndex = {
  field_name: "sparse_vector",
  index_name: "sparse_inverted_index",
  index_type: IndexType.AUTOINDEX,
  metric_type: MetricType.BM25,
};

await client.createCollection({
  collection_name,
  fields,
  functions,
  index_params: [denseIndex, sparseIndex],
  consistency_level: "Strong",
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "news_articles_tutorial",
    "schema": {
        "fields": [
            {"fieldName": "id", "dataType": "Int64", "isPrimary": true},
            {"fieldName": "headline", "dataType": "VarChar", "elementTypeParams": {"max_length": 200, "enable_analyzer": true}},
            {"fieldName": "content", "dataType": "VarChar", "elementTypeParams": {"max_length": 2000, "enable_analyzer": true}},
            {"fieldName": "dense", "dataType": "FloatVector", "elementTypeParams": {"dim": 1024}},
            {"fieldName": "sparse_vector", "dataType": "SparseFloatVector"},
            {"fieldName": "publish_date", "dataType": "Int64"}
        ],
        "functions": [
            {"name": "siliconflow_embedding", "type": "TextEmbedding", "inputFieldNames": ["content"], "outputFieldNames": ["dense"], "params": {"provider": "siliconflow", "model_name": "BAAI/bge-large-en-v1.5", "credential": "your-api-key"}},
            {"name": "bm25", "type": "BM25", "inputFieldNames": ["content"], "outputFieldNames": ["sparse_vector"]}
        ],
        "autoID": true
    },
    "indexParams": [
        {"fieldName": "dense", "indexType": "AUTOINDEX", "metricType": "L2"},
        {"fieldName": "sparse_vector", "indexName": "sparse_inverted_index", "indexType": "AUTOINDEX", "metricType": "BM25"}
    ],
    "consistencyLevel": "Strong"
}' 
```

</TabItem>
</Tabs>

## 步骤4：准备样本数据\{#step-4-prepare-sample-data}

在本教程中，我们将创建一组具有不同发布日期的新闻文章。请注意，我们如何纳入了内容几乎相同但日期不同的文章对，以清晰展示衰减排名效果：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Get current time
current_time = int(datetime.datetime.now().timestamp())
current_date = datetime.datetime.fromtimestamp(current_time)
print(f"Current time: {current_date.strftime('%Y-%m-%d %H:%M:%S')}")

# Sample news articles spanning different dates
articles = [
    {
        "headline": "AI Breakthrough Enables Medical Diagnosis Advancement",
        "content": "Researchers announced a major breakthrough in AI-based medical diagnostics, enabling faster and more accurate detection of rare diseases.",
        "publish_date": int((current_date - datetime.timedelta(days=120)).timestamp())  # ~4 months ago
    },
    {
        "headline": "Tech Giants Compete in New AI Race",
        "content": "Major technology companies are investing billions in a new race to develop the most advanced artificial intelligence systems.",
        "publish_date": int((current_date - datetime.timedelta(days=60)).timestamp())  # ~2 months ago
    },
    {
        "headline": "AI Ethics Guidelines Released by International Body",
        "content": "A consortium of international organizations has released new guidelines addressing ethical concerns in artificial intelligence development and deployment.",
        "publish_date": int((current_date - datetime.timedelta(days=30)).timestamp())  # 1 month ago
    },
    {
        "headline": "Latest Deep Learning Models Show Remarkable Progress",
        "content": "The newest generation of deep learning models demonstrates unprecedented capabilities in language understanding and generation.",
        "publish_date": int((current_date - datetime.timedelta(days=15)).timestamp())  # 15 days ago
    },
    # Articles with identical content but different dates
    {
        "headline": "AI Research Advancements Published in January",
        "content": "Breakthrough research in artificial intelligence shows remarkable advancements in multiple domains.",
        "publish_date": int((current_date - datetime.timedelta(days=90)).timestamp())  # ~3 months ago
    },
    {
        "headline": "New AI Research Results Released This Week",
        "content": "Breakthrough research in artificial intelligence shows remarkable advancements in multiple domains.",
        "publish_date": int((current_date - datetime.timedelta(days=5)).timestamp())  # Very recent - 5 days ago
    },
    {
        "headline": "AI Development Updates Released Yesterday",
        "content": "Recent developments in artificial intelligence research are showing promising results across various applications.",
        "publish_date": int((current_date - datetime.timedelta(days=1)).timestamp())  # Just yesterday
    },
]

# Insert articles into the collection
milvus_client.insert(collection_name, articles)
print(f"Inserted {len(articles)} articles into the collection")
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.ArrayList;
import java.util.List;

long currentTime = System.currentTimeMillis() / 1000;

List<JsonObject> data = new ArrayList<>();
JsonObject a1 = new JsonObject();
a1.addProperty("headline", "AI Breakthrough Enables Medical Diagnosis Advancement");
a1.addProperty("content", "Researchers announced a major breakthrough in AI-based medical diagnostics, enabling faster and more accurate detection of rare diseases.");
a1.addProperty("publish_date", currentTime - 120L * 24 * 60 * 60);
data.add(a1);
// ... add the other sample articles the same way

client.insert(InsertReq.builder()
        .collectionName(collectionName)
        .data(data)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
currentTime := time.Now().Unix()

articles := []map[string]any{
    {
        "headline":     "AI Breakthrough Enables Medical Diagnosis Advancement",
        "content":      "Researchers announced a major breakthrough in AI-based medical diagnostics, enabling faster and more accurate detection of rare diseases.",
        "publish_date": currentTime - 120*24*60*60,
    },
    // ... add the other sample articles the same way
}

_, err = client.Insert(ctx, milvusclient.NewRowBasedInsertOption(collectionName, articles))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use chrono::Utc;

let current_time = Utc::now().timestamp();

let articles = vec![
    json!({"headline": "AI Breakthrough Enables Medical Diagnosis Advancement", "content": "Researchers announced a major breakthrough in AI-based medical diagnostics, enabling faster and more accurate detection of rare diseases.", "publish_date": current_time - 120*24*60*60}),
    // ... add the other sample articles the same way
];

let insert_req = InsertRequest::builder()
    .collection_name(collection_name)
    .rows(articles)
    .build()?;
client.insert(insert_req).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <ctime>

auto current_time = std::time(nullptr);

milvus::EntityRows rows;
milvus::EntityRow a1{
    {"headline", "AI Breakthrough Enables Medical Diagnosis Advancement"},
    {"content", "Researchers announced a major breakthrough in AI-based medical diagnostics, enabling faster and more accurate detection of rare diseases."},
    {"publish_date", (int64_t)current_time - 120 * 24 * 60 * 60},
};
rows.emplace_back(std::move(a1));
// ... add the other sample articles the same way

milvus::InsertResponse ir;
status = client->Insert(milvus::InsertRequest().WithCollectionName(collection_name).WithRowsData(std::move(rows)), ir);
if (!status.IsOk()) { std::cout << status.Message() << std::endl; }
```

</TabItem>

<TabItem value='javascript'>

```javascript
const current_time = Math.floor(Date.now() / 1000);

const data = [
  {
    headline: "AI Breakthrough Enables Medical Diagnosis Advancement",
    content: "Researchers announced a major breakthrough in AI-based medical diagnostics, enabling faster and more accurate detection of rare diseases.",
    publish_date: current_time - 120 * 24 * 60 * 60,
  },
  // ... add the other sample articles the same way
];

await client.insert({ collection_name, data });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "news_articles_tutorial",
    "data": [
        {"headline": "AI Breakthrough Enables Medical Diagnosis Advancement", "content": "Researchers announced a major breakthrough in AI-based medical diagnostics, enabling faster and more accurate detection of rare diseases.", "publish_date": "<unix timestamp of ~120 days ago>"}
    ]
}' 
```

</TabItem>
</Tabs>

## 步骤5：配置不同的 Decay Ranker\{#step-5-configure-different-decay-rankers}

现在，让我们创建三个不同的 Decay Ranker，每个排序器都有不同的参数，以突出它们的差异：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Use current time as reference point
print(f"Using current time as reference point")

# Create a Gaussian decay ranker
gaussian_ranker = Function(
    name="time_decay_gaussian",
    input_field_names=["publish_date"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "decay",
        "function": "gauss",           # Gaussian/bell curve decay
        "origin": current_time,        # Current time as reference point
        "offset": 7 * 24 * 60 * 60,    # One week (full relevance)
        "decay": 0.5,                  # Articles from two weeks ago have half relevance 
        "scale": 14 * 24 * 60 * 60     # Two weeks scale parameter
    }
)

# Create an exponential decay ranker with different parameters
exponential_ranker = Function(
    name="time_decay_exponential",
    input_field_names=["publish_date"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "decay",
        "function": "exp",             # Exponential decay
        "origin": current_time,        # Current time as reference point
        "offset": 3 * 24 * 60 * 60,    # Shorter offset (3 days vs 7 days)
        "decay": 0.3,                  # Steeper decay (0.3 vs 0.5) 
        "scale": 10 * 24 * 60 * 60     # Different scale (10 days vs 14 days)
    }
)

# Create a linear decay ranker
linear_ranker = Function(
    name="time_decay_linear",
    input_field_names=["publish_date"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "decay",
        "function": "linear",          # Linear decay
        "origin": current_time,        # Current time as reference point
        "offset": 7 * 24 * 60 * 60,    # One week (full relevance)
        "decay": 0.5,                  # Articles from two weeks ago have half relevance
        "scale": 14 * 24 * 60 * 60     # Two weeks scale parameter
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;
import java.util.Collections;

long currentTime = System.currentTimeMillis() / 1000;

DecayRanker gaussianRanker = DecayRanker.builder()
        .name("time_decay_gaussian")
        .inputFieldNames(Collections.singletonList("publish_date"))
        .function("gauss")
        .origin(currentTime)
        .offset(7L * 24 * 60 * 60)
        .decay(0.5)
        .scale(14L * 24 * 60 * 60)
        .build();

DecayRanker exponentialRanker = DecayRanker.builder()
        .name("time_decay_exponential")
        .inputFieldNames(Collections.singletonList("publish_date"))
        .function("exp")
        .origin(currentTime)
        .offset(3L * 24 * 60 * 60)
        .decay(0.3)
        .scale(10L * 24 * 60 * 60)
        .build();

DecayRanker linearRanker = DecayRanker.builder()
        .name("time_decay_linear")
        .inputFieldNames(Collections.singletonList("publish_date"))
        .function("linear")
        .origin(currentTime)
        .offset(7L * 24 * 60 * 60)
        .decay(0.5)
        .scale(14L * 24 * 60 * 60)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

currentTime := time.Now().Unix()

gaussianRanker := entity.NewFunction().
    WithName("time_decay_gaussian").
    WithType(entity.FunctionTypeRerank).
    WithInputFields("publish_date").
    WithParam("reranker", "decay").
    WithParam("function", "gauss").
    WithParam("origin", fmt.Sprintf("%d", currentTime)).
    WithParam("offset", "604800").
    WithParam("decay", "0.5").
    WithParam("scale", "1209600")

exponentialRanker := entity.NewFunction().
    WithName("time_decay_exponential").
    WithType(entity.FunctionTypeRerank).
    WithInputFields("publish_date").
    WithParam("reranker", "decay").
    WithParam("function", "exp").
    WithParam("origin", fmt.Sprintf("%d", currentTime)).
    WithParam("offset", "259200").
    WithParam("decay", "0.3").
    WithParam("scale", "864000")

linearRanker := entity.NewFunction().
    WithName("time_decay_linear").
    WithType(entity.FunctionTypeRerank).
    WithInputFields("publish_date").
    WithParam("reranker", "decay").
    WithParam("function", "linear").
    WithParam("origin", fmt.Sprintf("%d", currentTime)).
    WithParam("offset", "604800").
    WithParam("decay", "0.5").
    WithParam("scale", "1209600")
```

</TabItem>

<TabItem value='rust'>

```rust
use chrono::Utc;

let current_time = Utc::now().timestamp();

let gaussian_ranker = Function::new()
    .name("time_decay_gaussian")
    .function_type(FunctionType::Rerank)
    .input_fields(vec!["publish_date"])
    .param("reranker", "decay")
    .param("function", "gauss")
    .param("origin", current_time.to_string())
    .param("offset", "604800")
    .param("decay", "0.5")
    .param("scale", "1209600");

let exponential_ranker = Function::new()
    .name("time_decay_exponential")
    .function_type(FunctionType::Rerank)
    .input_fields(vec!["publish_date"])
    .param("reranker", "decay")
    .param("function", "exp")
    .param("origin", current_time.to_string())
    .param("offset", "259200")
    .param("decay", "0.3")
    .param("scale", "864000");

let linear_ranker = Function::new()
    .name("time_decay_linear")
    .function_type(FunctionType::Rerank)
    .input_fields(vec!["publish_date"])
    .param("reranker", "decay")
    .param("function", "linear")
    .param("origin", current_time.to_string())
    .param("offset", "604800")
    .param("decay", "0.5")
    .param("scale", "1209600");
```

</TabItem>

<TabItem value='c++'>

```c++
#include <ctime>

auto current_time = std::time(nullptr);

auto gaussian_ranker = std::make_shared<milvus::DecayRerank>("time_decay_gaussian");
gaussian_ranker->AddInputFieldName("publish_date");
gaussian_ranker->SetFunction("gauss");
gaussian_ranker->SetOrigin(current_time);
gaussian_ranker->SetOffset(7 * 24 * 60 * 60);
gaussian_ranker->SetDecay(0.5);
gaussian_ranker->SetScale(14 * 24 * 60 * 60);

auto exponential_ranker = std::make_shared<milvus::DecayRerank>("time_decay_exponential");
exponential_ranker->AddInputFieldName("publish_date");
exponential_ranker->SetFunction("exp");
exponential_ranker->SetOrigin(current_time);
exponential_ranker->SetOffset(3 * 24 * 60 * 60);
exponential_ranker->SetDecay(0.3);
exponential_ranker->SetScale(10 * 24 * 60 * 60);

auto linear_ranker = std::make_shared<milvus::DecayRerank>("time_decay_linear");
linear_ranker->AddInputFieldName("publish_date");
linear_ranker->SetFunction("linear");
linear_ranker->SetOrigin(current_time);
linear_ranker->SetOffset(7 * 24 * 60 * 60);
linear_ranker->SetDecay(0.5);
linear_ranker->SetScale(14 * 24 * 60 * 60);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const current_time = Math.floor(Date.now() / 1000);

const gaussian_ranker = {
  name: "time_decay_gaussian",
  input_field_names: ["publish_date"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay", function: "gauss", origin: current_time,
    offset: 7 * 24 * 60 * 60, decay: 0.5, scale: 14 * 24 * 60 * 60,
  },
};

const exponential_ranker = {
  name: "time_decay_exponential",
  input_field_names: ["publish_date"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay", function: "exp", origin: current_time,
    offset: 3 * 24 * 60 * 60, decay: 0.3, scale: 10 * 24 * 60 * 60,
  },
};

const linear_ranker = {
  name: "time_decay_linear",
  input_field_names: ["publish_date"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay", function: "linear", origin: current_time,
    offset: 7 * 24 * 60 * 60, decay: 0.5, scale: 14 * 24 * 60 * 60,
  },
};
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: REST API run_analyzer / search rankers use the "type": "Rerank" function object.
gaussian_ranker='{
  "name": "time_decay_gaussian",
  "type": "Rerank",
  "inputFieldNames": ["publish_date"],
  "params": {"reranker": "decay", "function": "gauss", "origin": "<current unix timestamp>", "offset": 604800, "decay": 0.5, "scale": 1209600}
}' 
```

</TabItem>
</Tabs>

在前面的代码中：

- `reranker`：对于基于时间的衰减函数，设置为 `decay`

- `function`：衰减函数的类型（`gauss`、`exp` 或 `linear`）

- `origin`：参考点（通常为当前时间）

- `offset`：文档保持完全相关性的时间段

- `scale`：控制相关性在偏移量之外降低的速度

- `decay`：偏移量+比例下的衰减因子（例如，0.5表示相关性减半）

请注意，我们已使用不同的参数配置了指数排序器，以展示如何针对不同的行为调整这些函数。

## 步骤6：可视化 Decay Ranker\{#step-6-visualize-the-decay-rankers}

在进行搜索之前，让我们先直观地比较一下这些配置不同的 Decay Ranker 的表现：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Visualize the decay functions with different parameters
days = np.linspace(0, 90, 100)
# Gaussian: offset=7, scale=14, decay=0.5
gaussian_values = [1.0 if d <= 7 else (0.5 ** ((d - 7) / 14)) for d in days]
# Exponential: offset=3, scale=10, decay=0.3
exponential_values = [1.0 if d <= 3 else (0.3 ** ((d - 3) / 10)) for d in days]
# Linear: offset=7, scale=14, decay=0.5
linear_values = [1.0 if d <= 7 else max(0, 1.0 - ((d - 7) / 14) * 0.5) for d in days]

plt.figure(figsize=(10, 6))
plt.plot(days, gaussian_values, label='Gaussian (offset=7, scale=14, decay=0.5)')
plt.plot(days, exponential_values, label='Exponential (offset=3, scale=10, decay=0.3)')
plt.plot(days, linear_values, label='Linear (offset=7, scale=14, decay=0.5)')
plt.axhline(y=0.5, color='gray', linestyle='--', alpha=0.5, label='Half relevance')
plt.xlabel('Days ago')
plt.ylabel('Relevance factor')
plt.title('Decay Functions Comparison')
plt.legend()
plt.grid(True)
plt.savefig('decay_functions.png')
plt.close()

# Print numerical representation
print("\n=== TIME DECAY EFFECT VISUALIZATION ===")
print("Days ago | Gaussian | Exponential | Linear")
print("-----------------------------------------")
for days in [0, 3, 7, 10, 14, 21, 30, 60, 90]:
    # Calculate decay factors based on the parameters in our rankers
    gaussian_decay = 1.0 if days <= 7 else (0.5 ** ((days - 7) / 14))
    exponential_decay = 1.0 if days <= 3 else (0.3 ** ((days - 3) / 10))
    linear_decay = 1.0 if days <= 7 else max(0, 1.0 - ((days - 7) / 14) * 0.5)
    
    print(f"{days:2d} days | {gaussian_decay:.4f}   | {exponential_decay:.4f}     | {linear_decay:.4f}")
```

</TabItem>

<TabItem value='java'>

```java
// Note: This visualization step uses Python matplotlib and is not applicable to milvus-sdk-java.
```

</TabItem>

<TabItem value='go'>

```go
// Note: This visualization step uses Python matplotlib and is not applicable to the Go SDK.
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: This visualization step uses Python matplotlib and is not applicable to milvus-sdk-rust.
```

</TabItem>

<TabItem value='c++'>

```c++
// Note: This visualization step uses Python matplotlib and is not applicable to milvus-sdk-cpp.
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Note: This visualization step uses Python matplotlib and is not applicable to the Node.js SDK.
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: This visualization step uses Python matplotlib and is not applicable to the REST API.
```

</TabItem>
</Tabs>

预期输出：

```plaintext
=== TIME DECAY EFFECT VISUALIZATION ===
Days ago | Gaussian | Exponential | Linear
-----------------------------------------
 0 days | 1.0000   | 1.0000     | 1.0000
 3 days | 1.0000   | 1.0000     | 1.0000
 7 days | 1.0000   | 0.6178     | 1.0000
10 days | 0.8620   | 0.4305     | 0.8929
14 days | 0.7071   | 0.2660     | 0.7500
21 days | 0.5000   | 0.1145     | 0.5000
30 days | 0.3202   | 0.0387     | 0.1786
60 days | 0.0725   | 0.0010     | 0.0000
90 days | 0.0164   | 0.0000     | 0.0000
```

## 步骤7：用于结果显示的辅助函数\{#step-7-helper-function-for-results-display}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Helper function to format search results with dates and scores
def print_search_results(results, title):
    print(f"\n=== {title} ===")
    for i, hit in enumerate(results[0]):
        publish_date = datetime.datetime.fromtimestamp(hit.get('publish_date'))
        days_from_now = (current_time - hit.get('publish_date')) / (24 * 60 * 60)
        
        print(f"{i+1}. {hit.get('headline')}")
        print(f"   Published: {publish_date.strftime('%Y-%m-%d')} ({int(days_from_now)} days ago)")
        print(f"   Score: {hit.score:.4f}")
        print()
```

</TabItem>

<TabItem value='java'>

```java
private static void printSearchResults(SearchResp resp, String title) {
    System.out.println("\n=== " + title + " ===");
    int rank = 1;
    for (SearchResp.SearchResult hit : resp.getSearchResults().get(0)) {
        System.out.println((rank++) + ". " + hit.getEntity().get("headline"));
        System.out.println("   Score: " + hit.getScore());
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func printSearchResults(results []milvusclient.ResultSet, title string) {
    fmt.Printf("\n=== %s ===\n", title)
    for i, rs := range results {
        for j := 0; j < rs.ResultCount; j++ {
            fmt.Printf("%d. %v\n", i+1, rs.Scores[j])
        }
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
fn print_search_results(results: &[SingleResult], title: &str) {
    println!("\n=== {} ===", title);
    for hit in results {
        println!("Score: {:?}", hit.scores());
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
void PrintSearchResults(const milvus::SearchResponse& resp, const std::string& title) {
    std::cout << "\n=== " << title << " ===" << std::endl;
    for (const auto& result : resp.Results().Results()) {
        std::cout << "Score: " << result.Score() << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
function printSearchResults(results, title) {
  console.log(`
=== ${title} ===`);
  results.forEach((hit, i) => {
    console.log(`${i + 1}. ${hit.headline}`);
    console.log(`   Score: ${hit.score}`);
  });
}
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: result display is handled directly by the curl response; see the search steps below.
```

</TabItem>
</Tabs>

## 步骤8：比较标准搜索与基于衰减的搜索\{#step-8-compare-standard-vs-decay-based-search}

现在，让我们运行一个搜索查询，并比较有衰减排名和无衰减排名的结果：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define our search query
query = "artificial intelligence advancements"

# 1. Search without decay ranking (purely based on semantic relevance)
standard_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,  # Get all our articles
    output_fields=["headline", "content", "publish_date"],
    consistency_level="Strong"
)
print_search_results(standard_results, "SEARCH RESULTS WITHOUT DECAY RANKING")

# Store original scores for later comparison
original_scores = {}
for hit in standard_results[0]:
    original_scores[hit.get('headline')] = hit.score

# 2. Search with each decay function
# Gaussian decay
gaussian_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,
    output_fields=["headline", "content", "publish_date"],
    ranker=gaussian_ranker,
    consistency_level="Strong"
)
print_search_results(gaussian_results, "SEARCH RESULTS WITH GAUSSIAN DECAY RANKING")

# Exponential decay
exponential_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,
    output_fields=["headline", "content", "publish_date"],
    ranker=exponential_ranker,
    consistency_level="Strong"
)
print_search_results(exponential_results, "SEARCH RESULTS WITH EXPONENTIAL DECAY RANKING")

# Linear decay
linear_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,
    output_fields=["headline", "content", "publish_date"],
    ranker=linear_ranker,
    consistency_level="Strong"
)
print_search_results(linear_results, "SEARCH RESULTS WITH LINEAR DECAY RANKING")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;

String query = "artificial intelligence advancements";

// 1. Search without decay ranking
SearchResp standard = client.search(SearchReq.builder()
        .collectionName(collectionName)
        .data(Collections.singletonList(new EmbeddedText(query)))
        .annsField("dense")
        .limit(7)
        .outputFields(Arrays.asList("headline", "content", "publish_date"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());

// 2. Search with Gaussian decay
SearchResp gaussian = client.search(SearchReq.builder()
        .collectionName(collectionName)
        .data(Collections.singletonList(new EmbeddedText(query)))
        .annsField("dense")
        .limit(7)
        .outputFields(Arrays.asList("headline", "content", "publish_date"))
        .functionScore(FunctionScore.builder().addFunction(gaussianRanker).build())
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());

// 3. Search with exponential decay
SearchResp exponential = client.search(SearchReq.builder()
        .collectionName(collectionName)
        .data(Collections.singletonList(new EmbeddedText(query)))
        .annsField("dense")
        .limit(7)
        .outputFields(Arrays.asList("headline", "content", "publish_date"))
        .functionScore(FunctionScore.builder().addFunction(exponentialRanker).build())
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());

// 4. Search with linear decay
SearchResp linear = client.search(SearchReq.builder()
        .collectionName(collectionName)
        .data(Collections.singletonList(new EmbeddedText(query)))
        .annsField("dense")
        .limit(7)
        .outputFields(Arrays.asList("headline", "content", "publish_date"))
        .functionScore(FunctionScore.builder().addFunction(linearRanker).build())
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
query := "artificial intelligence advancements"

// 1. Search without decay ranking
standard, err := client.Search(ctx, milvusclient.NewSearchOption(collectionName, 7, []entity.Vector{entity.Text(query)}).
    WithANNSField("dense").
    WithOutputFields("headline", "content", "publish_date").
    WithConsistencyLevel(entity.ClStrong))
if err != nil { log.Fatal(err) }

// 2. Search with Gaussian decay
gaussian, err := client.Search(ctx, milvusclient.NewSearchOption(collectionName, 7, []entity.Vector{entity.Text(query)}).
    WithANNSField("dense").
    WithOutputFields("headline", "content", "publish_date").
    WithFunctionReranker(gaussianRanker).
    WithConsistencyLevel(entity.ClStrong))
if err != nil { log.Fatal(err) }

// 3. Search with exponential decay
exponential, err := client.Search(ctx, milvusclient.NewSearchOption(collectionName, 7, []entity.Vector{entity.Text(query)}).
    WithANNSField("dense").
    WithOutputFields("headline", "content", "publish_date").
    WithFunctionReranker(exponentialRanker).
    WithConsistencyLevel(entity.ClStrong))
if err != nil { log.Fatal(err) }

// 4. Search with linear decay
linear, err := client.Search(ctx, milvusclient.NewSearchOption(collectionName, 7, []entity.Vector{entity.Text(query)}).
    WithANNSField("dense").
    WithOutputFields("headline", "content", "publish_date").
    WithFunctionReranker(linearRanker).
    WithConsistencyLevel(entity.ClStrong))
if err != nil { log.Fatal(err) }
```

</TabItem>

<TabItem value='rust'>

```rust
let query = "artificial intelligence advancements";

let search_req = |ranker: Function| {
    SearchRequest::builder()
        .collection_name(collection_name)
        .vector_field("dense")
        .vectors(SearchVectors::EmbeddedText(vec![query.to_string()]))
        .limit(7)
        .output_fields(vec!["headline", "content", "publish_date"])
        .rerank(FunctionScore::new().add_function(ranker))
        .consistency_level(ConsistencyLevel::Strong)
        .build()
};

let standard = client.search(SearchRequest::builder()
    .collection_name(collection_name)
    .vector_field("dense")
    .vectors(SearchVectors::EmbeddedText(vec![query.to_string()]))
    .limit(7)
    .output_fields(vec!["headline", "content", "publish_date"])
    .consistency_level(ConsistencyLevel::Strong)
    .build()?)
.await?;

let gaussian = client.search(search_req(gaussian_ranker.clone())?).await?;
let exponential = client.search(search_req(exponential_ranker.clone())?).await?;
let linear = client.search(search_req(linear_ranker.clone())?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::string query = "artificial intelligence advancements";

auto build_req = [&](const milvus::FunctionPtr& ranker) {
    return milvus::SearchRequest()
        .WithCollectionName(collection_name)
        .WithAnnsField("dense")
        .AddEmbeddedText(query)
        .WithLimit(7)
        .AddOutputField("headline")
        .AddOutputField("content")
        .AddOutputField("publish_date")
        .WithConsistencyLevel(milvus::ConsistencyLevel::STRONG)
        .WithRerank(std::make_shared<milvus::FunctionScore>());
};

milvus::SearchResponse standard, gaussian, exponential, linear;
status = client->Search(build_req(nullptr), standard);
milvus::SearchResponse g_resp, e_resp, l_resp;
status = client->Search(build_req(gaussian_ranker).WithRerank(MakeFunctionScore(gaussian_ranker)), g_resp);
status = client->Search(build_req(exponential_ranker).WithRerank(MakeFunctionScore(exponential_ranker)), e_resp);
status = client->Search(build_req(linear_ranker).WithRerank(MakeFunctionScore(linear_ranker)), l_resp);
if (!status.IsOk()) { std::cout << status.Message() << std::endl; }
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query = "artificial intelligence advancements";

// 1. Search without decay ranking
const standard = await client.search({
  collection_name, anns_field: "dense", data: [query], limit: 7,
  output_fields: ["headline", "content", "publish_date"], consistency_level: "Strong",
});

// 2. Search with Gaussian decay
const gaussian = await client.search({
  collection_name, anns_field: "dense", data: [query], limit: 7,
  output_fields: ["headline", "content", "publish_date"], rerank: gaussian_ranker, consistency_level: "Strong",
});

// 3. Search with exponential decay
const exponential = await client.search({
  collection_name, anns_field: "dense", data: [query], limit: 7,
  output_fields: ["headline", "content", "publish_date"], rerank: exponential_ranker, consistency_level: "Strong",
});

// 4. Search with linear decay
const linear = await client.search({
  collection_name, anns_field: "dense", data: [query], limit: 7,
  output_fields: ["headline", "content", "publish_date"], rerank: linear_ranker, consistency_level: "Strong",
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# 1. Search without decay ranking
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "news_articles_tutorial",
    "annsField": "dense",
    "data": ["artificial intelligence advancements"],
    "limit": 7,
    "outputFields": ["headline", "content", "publish_date"],
    "consistencyLevel": "Strong"
}'

# 2. Search with Gaussian decay (add "functionScore" with a Rerank function as shown in Step 5)
```

</TabItem>
</Tabs>

预期输出：

```plaintext
=== SEARCH RESULTS WITHOUT DECAY RANKING ===
1. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

2. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.4315

3. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

4. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.6671

5. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.6674

6. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.7279

7. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.7661

=== SEARCH RESULTS WITH GAUSSIAN DECAY RANKING ===
1. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.5322

2. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

3. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.1180

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0000

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== SEARCH RESULTS WITH EXPONENTIAL DECAY RANKING ===
1. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

2. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.3392

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.1574

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.0297

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0007

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== SEARCH RESULTS WITH LINEAR DECAY RANKING ===
1. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.4767

2. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

3. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.3831

4. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

5. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.3640

6. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.3335

7. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.2158
```

## 步骤9：了解得分计算\{#step-9-understand-score-calculation}

让我们来详细分析一下最终得分是如何通过将原始相关性与衰减因子相结合来计算的：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add a detailed breakdown for the first 3 results from Gaussian decay
print("\n=== SCORE CALCULATION BREAKDOWN (GAUSSIAN DECAY) ===")
for item in gaussian_results[0][:3]:
    headline = item.get('headline')
    publish_date = datetime.datetime.fromtimestamp(item.get('publish_date'))
    days_ago = (current_time - item.get('publish_date')) / (24 * 60 * 60)
    
    # Get the original score
    original_score = original_scores.get(headline, 0)
    
    # Calculate decay factor
    decay_factor = 1.0 if days_ago <= 7 else (0.5 ** ((days_ago - 7) / 14))
    
    # Show breakdown
    print(f"Item: {headline}")
    print(f"  Published: {publish_date.strftime('%Y-%m-%d')} ({int(days_ago)} days ago)")
    print(f"  Original relevance score: {original_score:.4f}")
    print(f"  Decay factor (Gaussian): {decay_factor:.4f}")
    print(f"  Expected final score = Original × Decay: {original_score * decay_factor:.4f}")
    print(f"  Actual final score: {item.score:.4f}")
    print()
```

</TabItem>

<TabItem value='java'>

```java
// Decay factor calculation (Gaussian): 1.0 within offset, then 0.5^((days-offset)/scale)
long daysAgo = (currentTime - publishDate) / (24L * 60 * 60);
double decayFactor = daysAgo <= 7 ? 1.0 : Math.pow(0.5, (daysAgo - 7) / 14.0);
double expectedScore = originalScore * decayFactor;
System.out.println("Expected final score = Original x Decay: " + expectedScore);
```

</TabItem>

<TabItem value='go'>

```go
daysAgo := (currentTime - publishDate) / (24 * 60 * 60)
decayFactor := 1.0
if daysAgo > 7 {
    decayFactor = math.Pow(0.5, float64(daysAgo-7)/14.0)
}
expectedScore := originalScore * decayFactor
fmt.Printf("Expected final score = Original x Decay: %.4f\n", expectedScore)
```

</TabItem>

<TabItem value='rust'>

```rust
let days_ago = (current_time - publish_date) / (24 * 60 * 60);
let decay_factor = if days_ago <= 7 { 1.0 } else { 0.5f64.powf((days_ago - 7) as f64 / 14.0) };
let expected_score = original_score * decay_factor;
println!("Expected final score = Original x Decay: {:.4}", expected_score);
```

</TabItem>

<TabItem value='c++'>

```c++
int64_t days_ago = (current_time - publish_date) / (24 * 60 * 60);
double decay_factor = days_ago <= 7 ? 1.0 : std::pow(0.5, (days_ago - 7) / 14.0);
double expected_score = original_score * decay_factor;
std::cout << "Expected final score = Original x Decay: " << expected_score << std::endl;
```

</TabItem>

<TabItem value='javascript'>

```javascript
const days_ago = (current_time - publish_date) / (24 * 60 * 60);
const decay_factor = days_ago <= 7 ? 1.0 : Math.pow(0.5, (days_ago - 7) / 14);
const expected_score = original_score * decay_factor;
console.log(`Expected final score = Original x Decay: ${expected_score.toFixed(4)}`);
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: score-calculation breakdown is shown directly in the response; see the decay formula in the doc.
```

</TabItem>
</Tabs>

预期输出：

```plaintext
=== SCORE CALCULATION BREAKDOWN (GAUSSIAN DECAY) ===
Item: Latest Deep Learning Models Show Remarkable Progress
  Published: 2025-04-30 (15 days ago)
  Original relevance score: 0.6674
  Decay factor (Gaussian): 0.6730
  Expected final score = Original × Decay: 0.4491
  Actual final score: 0.5322

Item: New AI Research Results Released This Week
  Published: 2025-05-10 (5 days ago)
  Original relevance score: 0.4316
  Decay factor (Gaussian): 1.0000
  Expected final score = Original × Decay: 0.4316
  Actual final score: 0.4316

Item: AI Development Updates Released Yesterday
  Published: 2025-05-14 (1 days ago)
  Original relevance score: 0.3670
  Decay factor (Gaussian): 1.0000
  Expected final score = Original × Decay: 0.3670
  Actual final score: 0.3670
```

## 步骤10：带时间衰减的混合搜索\{#step-10-hybrid-search-with-time-decay}

对于更复杂的场景，我们可以使用混合搜索来结合密集（语义）和稀疏（关键词）向量：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set up hybrid search (combining dense and sparse vectors)
dense_search = AnnSearchRequest(
    data=[query],
    anns_field="dense",  # Search dense vectors
    param={},
    limit=7
)

sparse_search = AnnSearchRequest(
    data=[query],
    anns_field="sparse_vector",  # Search sparse vectors (BM25)
    param={},
    limit=7
)

# Execute hybrid search with each decay function
# Gaussian decay
hybrid_gaussian_results = milvus_client.hybrid_search(
    collection_name,
    [dense_search, sparse_search],
    ranker=gaussian_ranker,
    limit=7,
    output_fields=["headline", "content", "publish_date"]
)
print_search_results(hybrid_gaussian_results, "HYBRID SEARCH RESULTS WITH GAUSSIAN DECAY RANKING")

# Exponential decay
hybrid_exponential_results = milvus_client.hybrid_search(
    collection_name,
    [dense_search, sparse_search],
    ranker=exponential_ranker,
    limit=7,
    output_fields=["headline", "content", "publish_date"]
)
print_search_results(hybrid_exponential_results, "HYBRID SEARCH RESULTS WITH EXPONENTIAL DECAY RANKING")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import java.util.Arrays;

HybridSearchReq hybridReq = HybridSearchReq.builder()
        .collectionName(collectionName)
        .searchRequests(Arrays.asList(
                AnnSearchReq.builder().vectorFieldName("dense").limit(7)
                        .vectors(Collections.singletonList(new EmbeddedText(query))).build(),
                AnnSearchReq.builder().vectorFieldName("sparse_vector").limit(7)
                        .vectors(Collections.singletonList(new EmbeddedText(query))).build()))
        .functionScore(FunctionScore.builder().addFunction(gaussianRanker).build())
        .limit(7)
        .outFields(Arrays.asList("headline", "content", "publish_date"))
        .build();
SearchResp hybridResp = client.hybridSearch(hybridReq);
```

</TabItem>

<TabItem value='go'>

```go
hybrid, err := client.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
    collectionName, 7,
    milvusclient.NewAnnRequest("dense", 7, entity.Text(query)),
    milvusclient.NewAnnRequest("sparse_vector", 7, entity.Text(query)),
).WithFunctionRerankers(gaussianRanker).
    WithOutputFields("headline", "content", "publish_date").
    WithConsistencyLevel(entity.ClStrong))
if err != nil { log.Fatal(err) }
```

</TabItem>

<TabItem value='rust'>

```rust
let hybrid_req = HybridSearchRequest::builder()
    .collection_name(collection_name)
    .sub_requests(vec![
        SubSearchRequest::builder()
            .vector_field("dense")
            .vectors(SearchVectors::EmbeddedText(vec![query.to_string()]))
            .limit(7)
            .build()?,
        SubSearchRequest::builder()
            .vector_field("sparse_vector")
            .vectors(SearchVectors::EmbeddedText(vec![query.to_string()]))
            .limit(7)
            .build()?,
    ])
    .rerank(FunctionScore::new().add_function(gaussian_ranker))
    .limit(7)
    .output_fields(vec!["headline", "content", "publish_date"])
    .build()?;

let hybrid = client.hybrid_search(hybrid_req).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto function_score = std::make_shared<milvus::FunctionScore>();
function_score->AddFunction(gaussian_ranker);

milvus::SearchResponse response;
status = client->HybridSearch(milvus::HybridSearchRequest()
                                  .WithCollectionName(collection_name)
                                  .AddSubRequest(milvus::SubSearchRequest()
                                                     .WithVectorFieldName("dense")
                                                     .AddEmbeddedText(query)
                                                     .WithLimit(7))
                                  .AddSubRequest(milvus::SubSearchRequest()
                                                     .WithVectorFieldName("sparse_vector")
                                                     .AddEmbeddedText(query)
                                                     .WithLimit(7))
                                  .WithRerank(function_score)
                                  .WithLimit(7)
                                  .AddOutputField("headline")
                                  .AddOutputField("content")
                                  .AddOutputField("publish_date"),
                              response);
if (!status.IsOk()) { std::cout << status.Message() << std::endl; }
```

</TabItem>

<TabItem value='javascript'>

```javascript
const hybrid = await client.hybridSearch({
  collection_name,
  data: [
    { anns_field: "dense", data: [query], limit: 7 },
    { anns_field: "sparse_vector", data: [query], limit: 7 },
  ],
  rerank: gaussian_ranker,
  limit: 7,
  output_fields: ["headline", "content", "publish_date"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/advanced_search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "news_articles_tutorial",
    "data": [
        {"annsField": "dense", "data": ["artificial intelligence advancements"], "limit": 7},
        {"annsField": "sparse_vector", "data": ["artificial intelligence advancements"], "limit": 7}
    ],
    "limit": 7,
    "outputFields": ["headline", "content", "publish_date"],
    "functionScore": {
        "functions": [
            {"name": "time_decay_gaussian", "type": "Rerank", "inputFieldNames": ["publish_date"], "params": {"reranker": "decay", "function": "gauss", "origin": "<current unix timestamp>", "offset": 604800, "decay": 0.5, "scale": 1209600}}
        ]
    }
}' 
```

</TabItem>
</Tabs>

预期输出：

```plaintext
=== HYBRID SEARCH RESULTS WITH GAUSSIAN DECAY RANKING ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 2.1467

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7926

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.5322

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.1180

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0000

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== HYBRID SEARCH RESULTS WITH EXPONENTIAL DECAY RANKING ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 1.6873

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7926

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.1574

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.0297

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0007

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0001

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000
```

## 步骤11：尝试不同的参数值\{#step-11-experiment-with-different-parameter-values}

让我们看看调整尺度参数如何影响高斯衰减函数：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create variations of the Gaussian decay function with different scale parameters
print("\n=== PARAMETER VARIATION EXPERIMENT: SCALE ===")
for scale_days in [7, 14, 30]:
    scaled_ranker = Function(
        name=f"time_decay_gaussian_{scale_days}",
        input_field_names=["publish_date"],
        function_type=FunctionType.RERANK,
        params={
            "reranker": "decay",
            "function": "gauss",
            "origin": current_time,
            "offset": 7 * 24 * 60 * 60,  # Fixed offset of 7 days
            "decay": 0.5,                # Fixed decay of 0.5
            "scale": scale_days * 24 * 60 * 60  # Variable scale
        }
    )
    
    # Get results
    scale_results = milvus_client.search(
        collection_name,
        data=[query],
        anns_field="dense",
        limit=7,
        output_fields=["headline", "content", "publish_date"],
        ranker=scaled_ranker,
        consistency_level="Strong"
    )
    
    print_search_results(scale_results, f"SEARCH WITH GAUSSIAN DECAY (SCALE = {scale_days} DAYS)")
```

</TabItem>

<TabItem value='java'>

```java
for (int scaleDays : new int[]{7, 14, 30}) {
    DecayRanker scaledRanker = DecayRanker.builder()
            .name("time_decay_gaussian_" + scaleDays)
            .inputFieldNames(Collections.singletonList("publish_date"))
            .function("gauss")
            .origin(currentTime)
            .offset(7L * 24 * 60 * 60)
            .decay(0.5)
            .scale(scaleDays * 24L * 60 * 60)
            .build();
    SearchResp resp = client.search(SearchReq.builder()
            .collectionName(collectionName)
            .data(Collections.singletonList(new EmbeddedText(query)))
            .annsField("dense")
            .limit(7)
            .outputFields(Arrays.asList("headline", "publish_date"))
            .functionScore(FunctionScore.builder().addFunction(scaledRanker).build())
            .build());
    System.out.println("scale = " + scaleDays + " days, hits = " + resp.getSearchResults().get(0).size());
}
```

</TabItem>

<TabItem value='go'>

```go
for _, scaleDays := range []int{7, 14, 30} {
    scaledRanker := entity.NewFunction().
        WithName(fmt.Sprintf("time_decay_gaussian_%d", scaleDays)).
        WithType(entity.FunctionTypeRerank).
        WithInputFields("publish_date").
        WithParam("reranker", "decay").
        WithParam("function", "gauss").
        WithParam("origin", fmt.Sprintf("%d", currentTime)).
        WithParam("offset", "604800").
        WithParam("decay", "0.5").
        WithParam("scale", fmt.Sprintf("%d", scaleDays*24*60*60))

    results, err := client.Search(ctx, milvusclient.NewSearchOption(collectionName, 7, []entity.Vector{entity.Text(query)}).
        WithANNSField("dense").
        WithOutputFields("headline", "publish_date").
        WithFunctionReranker(scaledRanker))
    if err != nil { log.Fatal(err) }
    fmt.Printf("scale = %d days, hits = %d\n", scaleDays, results[0].ResultCount)
}
```

</TabItem>

<TabItem value='rust'>

```rust
for scale_days in [7, 14, 30] {
    let scaled_ranker = Function::new()
        .name(format!("time_decay_gaussian_{}", scale_days))
        .function_type(FunctionType::Rerank)
        .input_fields(vec!["publish_date"])
        .param("reranker", "decay")
        .param("function", "gauss")
        .param("origin", current_time.to_string())
        .param("offset", "604800")
        .param("decay", "0.5")
        .param("scale", (scale_days * 24 * 60 * 60).to_string());

    let res = client.search(SearchRequest::builder()
        .collection_name(collection_name)
        .vector_field("dense")
        .vectors(SearchVectors::EmbeddedText(vec![query.to_string()]))
        .limit(7)
        .output_fields(vec!["headline", "publish_date"])
        .rerank(FunctionScore::new().add_function(scaled_ranker))
        .build()?)
    .await?;
    println!("scale = {} days, hits = {:?}", scale_days, res.results());
}
```

</TabItem>

<TabItem value='c++'>

```c++
for (int scale_days : {7, 14, 30}) {
    auto scaled_ranker = std::make_shared<milvus::DecayRerank>("time_decay_gaussian_" + std::to_string(scale_days));
    scaled_ranker->AddInputFieldName("publish_date");
    scaled_ranker->SetFunction("gauss");
    scaled_ranker->SetOrigin(current_time);
    scaled_ranker->SetOffset(7 * 24 * 60 * 60);
    scaled_ranker->SetDecay(0.5);
    scaled_ranker->SetScale(scale_days * 24 * 60 * 60);

    auto fs = std::make_shared<milvus::FunctionScore>();
    fs->AddFunction(scaled_ranker);

    milvus::SearchResponse response;
    status = client->Search(milvus::SearchRequest()
                                .WithCollectionName(collection_name)
                                .WithAnnsField("dense")
                                .AddEmbeddedText(query)
                                .WithLimit(7)
                                .AddOutputField("headline")
                                .AddOutputField("publish_date")
                                .WithRerank(fs),
                            response);
    if (!status.IsOk()) { std::cout << status.Message() << std::endl; }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
for (const scale_days of [7, 14, 30]) {
  const scaled_ranker = {
    name: `time_decay_gaussian_${scale_days}`,
    input_field_names: ["publish_date"],
    type: FunctionType.RERANK,
    params: {
      reranker: "decay", function: "gauss", origin: current_time,
      offset: 7 * 24 * 60 * 60, decay: 0.5, scale: scale_days * 24 * 60 * 60,
    },
  };
  const res = await client.search({
    collection_name, anns_field: "dense", data: [query], limit: 7,
    output_fields: ["headline", "publish_date"], rerank: scaled_ranker,
  });
  console.log(`scale = ${scale_days} days, hits: ${res.results.length}`);
}
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: run the Step 5 search curl with different "scale" values in the Rerank params.
```

</TabItem>
</Tabs>

预期输出：

```plaintext
=== PARAMETER VARIATION EXPERIMENT: SCALE ===

=== SEARCH WITH GAUSSIAN DECAY (SCALE = 7 DAYS) ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.2699

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.0004

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0000

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== SEARCH WITH GAUSSIAN DECAY (SCALE = 14 DAYS) ===
1. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.5322

2. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

3. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

4. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.1180

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0000

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000

=== SEARCH WITH GAUSSIAN DECAY (SCALE = 30 DAYS) ===
1. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.6353

2. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.5097

3. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.4316

4. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.3670

5. Tech Giants Compete in New AI Race
   Published: 2025-03-16 (60 days ago)
   Score: 0.0767

6. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0021

7. AI Breakthrough Enables Medical Diagnosis Advancement
   Published: 2025-01-15 (120 days ago)
   Score: 0.0000
```

## 步骤12：使用不同查询进行测试\{#step-12-testing-with-different-queries}

让我们看看衰减排名在不同搜索查询下的表现如何：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Try different queries with Gaussian decay
for test_query in ["machine learning", "neural networks", "ethics in AI"]:
    print(f"\n=== TESTING QUERY: '{test_query}' WITH GAUSSIAN DECAY ===")
    test_results = milvus_client.search(
        collection_name,
        data=[test_query],
        anns_field="dense",
        limit=4,
        output_fields=["headline", "content", "publish_date"],
        ranker=gaussian_ranker,
        consistency_level="Strong"
    )
    print_search_results(test_results, f"TOP 4 RESULTS FOR '{test_query}'")
```

</TabItem>

<TabItem value='java'>

```java
for (String testQuery : Arrays.asList("machine learning", "neural networks", "ethics in AI")) {
    SearchResp resp = client.search(SearchReq.builder()
            .collectionName(collectionName)
            .data(Collections.singletonList(new EmbeddedText(testQuery)))
            .annsField("dense")
            .limit(4)
            .outputFields(Arrays.asList("headline", "publish_date"))
            .functionScore(FunctionScore.builder().addFunction(gaussianRanker).build())
            .build());
    System.out.println("TOP 4 RESULTS FOR '" + testQuery + "'");
    for (SearchResp.SearchResult hit : resp.getSearchResults().get(0)) {
        System.out.println(hit.getEntity().get("headline") + " (score=" + hit.getScore() + ")");
    }
}
```

</TabItem>

<TabItem value='go'>

```go
for _, testQuery := range []string{"machine learning", "neural networks", "ethics in AI"} {
    results, err := client.Search(ctx, milvusclient.NewSearchOption(collectionName, 4, []entity.Vector{entity.Text(testQuery)}).
        WithANNSField("dense").
        WithOutputFields("headline", "publish_date").
        WithFunctionReranker(gaussianRanker))
    if err != nil { log.Fatal(err) }
    fmt.Printf("TOP 4 RESULTS FOR '%s'\n", testQuery)
    for _, rs := range results {
        fmt.Printf("hits=%d\n", rs.ResultCount)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
for test_query in ["machine learning", "neural networks", "ethics in AI"] {
    let res = client.search(SearchRequest::builder()
        .collection_name(collection_name)
        .vector_field("dense")
        .vectors(SearchVectors::EmbeddedText(vec![test_query.to_string()]))
        .limit(4)
        .output_fields(vec!["headline", "publish_date"])
        .rerank(FunctionScore::new().add_function(gaussian_ranker.clone()))
        .build()?)
    .await?;
    println!("TOP 4 RESULTS FOR '{}': {:?}", test_query, res.results());
}
```

</TabItem>

<TabItem value='c++'>

```c++
for (const std::string& test_query : {"machine learning", "neural networks", "ethics in AI"}) {
    auto fs = std::make_shared<milvus::FunctionScore>();
    fs->AddFunction(gaussian_ranker);

    milvus::SearchResponse response;
    status = client->Search(milvus::SearchRequest()
                                .WithCollectionName(collection_name)
                                .WithAnnsField("dense")
                                .AddEmbeddedText(test_query)
                                .WithLimit(4)
                                .AddOutputField("headline")
                                .AddOutputField("publish_date")
                                .WithRerank(fs),
                            response);
    if (!status.IsOk()) { std::cout << status.Message() << std::endl; }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
for (const test_query of ["machine learning", "neural networks", "ethics in AI"]) {
  const res = await client.search({
    collection_name, anns_field: "dense", data: [test_query], limit: 4,
    output_fields: ["headline", "publish_date"], rerank: gaussian_ranker,
  });
  console.log(`TOP 4 RESULTS FOR '${test_query}':`, res.results.length);
}
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: run the Step 5 search curl with different "data" query texts.
```

</TabItem>
</Tabs>

预期输出：

```plaintext
=== TESTING QUERY: 'machine learning' WITH GAUSSIAN DECAY ===

=== TOP 4 RESULTS FOR 'machine learning' ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.8208

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7287

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.6633

4. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

=== TESTING QUERY: 'neural networks' WITH GAUSSIAN DECAY ===

=== TOP 4 RESULTS FOR 'neural networks' ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.8509

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7574

3. Latest Deep Learning Models Show Remarkable Progress
   Published: 2025-04-30 (15 days ago)
   Score: 0.6364

4. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000

=== TESTING QUERY: 'ethics in AI' WITH GAUSSIAN DECAY ===

=== TOP 4 RESULTS FOR 'ethics in AI' ===
1. New AI Research Results Released This Week
   Published: 2025-05-10 (5 days ago)
   Score: 0.7977

2. AI Development Updates Released Yesterday
   Published: 2025-05-14 (1 days ago)
   Score: 0.7322

3. AI Ethics Guidelines Released by International Body
   Published: 2025-04-15 (30 days ago)
   Score: 0.0814

4. AI Research Advancements Published in January
   Published: 2025-02-14 (90 days ago)
   Score: 0.0000
```

## 结论\{#conclusion}

在 Zilliz Cloud 中使用衰减函数进行基于时间的排序，提供了一种强大的方式来平衡语义相关性和时效性。通过配置适当的衰减函数和参数，您可以创建既能突出新内容又能兼顾语义相关性的搜索体验。

这种方法对以下方面特别有价值：

- 新闻和媒体平台

- 电子商务产品列表

- 社交媒体内容源

- 知识库和留档系统

- 研究论文资料库

通过理解衰减函数背后的数学原理，并尝试不同的参数，你可以微调你的搜索系统，从而为你的特定用例在相关性和新鲜度之间实现最佳平衡。