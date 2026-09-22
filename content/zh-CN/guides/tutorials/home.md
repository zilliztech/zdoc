---
title: "首页 | Cloud"
slug: /home
sidebar_label: "首页"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "此页为 Zilliz Cloud 开发者中心的首页。 | Cloud"
type: origin
token: KXgEwDH8yifWxukkXXFctMdLnpg
sidebar_position: 1
displayed_sidebar: default
keywords: 
  - zilliz
  - 向量 Database
  - 开始使用
  - 开发者中心
  - 首页
  - 主页

hide_title: true
hide_table_of_contents: true
---

import Admonition from '@theme/Admonition';



import Hero from '@site/src/components/Hero';


import Bars from '@site/src/components/Bars';


import Blocks from '@site/src/components/Blocks';


import Cards from '@site/src/components/Cards';


import Stories from '@site/src/components/Stories';





<Hero>

# 自信构建，为您的 AI 应用注入强劲动力\{#build-with-confidence-and-supercharge-your-ai-applications}

Zilliz Cloud 提供完全托管的 Milvus 服务，在兼顾安全的前提下简化向量检索应用的部署与扩缩容。

## 基础向量搜索\{#basic-vector-search}

执行近似最近邻（ANN）搜索，找出与您的查询向量最相似的向量。[了解更多](./single-vector-search)。

```json
// Dataset: 3 items with vectors and color metadata
// Search target: Find top 3 most similar items to query vector
[
    {
        "id": 0,
        "vector": [0.358, -0.602, 0.184, -0.263, 0.903],
        "color": "pink_8682"
    },
    {
        "id": 1,
        "vector": [0.199, 0.060, 0.698, 0.261, 0.839],
        "color": "red_7025"
    },
    {
        "id": 2,
        "vector": [0.437, -0.560, 0.646, 0.789, 0.208],
        "color": "orange_6781"
    }
]
```

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Query vector to search for similar items
query_vector = [0.358, -0.602, 0.184, -0.263, 0.903]

res = client.search(
    collection_name="my_collection",
    data=[query_vector],
    anns_field="vector",  # Field to search on
    limit=3,  # Return top 3 results
    search_params={"metric_type": "IP"}  # Inner Product similarity
)

for hits in res:
    for hit in hits:
        print(f"ID: {hit['id']}, Distance: {hit['distance']}")
```

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

FloatVec queryVector = new FloatVec(new float[]{0.358f, -0.602f, 0.184f, -0.263f, 0.903f});
SearchReq searchReq = SearchReq.builder()
    .collectionName("my_collection")
    .data(Collections.singletonList(queryVector))
    .annsField("vector")
    .topK(3)
    .build();

SearchResp searchResp = client.search(searchReq);
```

```go
import (
    "context"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx := context.Background()
client, _ := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})

queryVector := []float32{0.358, -0.602, 0.184, -0.263, 0.903}
resultSets, _ := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector"))
```

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
address: "YOUR_CLUSTER_ENDPOINT",
token: "YOUR_CLUSTER_TOKEN",
});

const query_vector = [0.358, -0.602, 0.184, -0.263, 0.903];

const res = await client.search({
collection_name: "my_collection",
data: [query_vector],
anns_field: "vector",
limit: 3,
});

console.log(res.results);
```

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [[0.358, -0.602, 0.184, -0.263, 0.903]],
    "annsField": "vector",
    "limit": 3
}'
```

## 过滤搜索\{#filtered-search}

在向量搜索前应用元数据过滤条件来缩小搜索范围，从而提升结果的相关性。[了解更多](./filtered-search)。

```json
// Dataset: 3 items with vectors and color metadata
// Search target: Find items with color starting with "red"
[
    {
        "id": 0,
        "vector": [0.358, -0.602, 0.184, -0.263, 0.903],
        "color": "pink_8682"
    },
    {
        "id": 1,
        "vector": [0.199, 0.060, 0.698, 0.261, 0.839],
        "color": "red_7025"
    },
    {
        "id": 2,
        "vector": [0.437, -0.560, 0.646, 0.789, 0.208],
        "color": "orange_6781"
    }
]
```

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Search with metadata filter applied before vector search
res = client.search(
    collection_name="my_collection",
    data=[[0.358, -0.602, 0.184, -0.263, 0.903]],
    filter='color like "red%"',  # Filter: only search items with color starting with "red"
    limit=3,
    output_fields=["color"]  # Return color field in results
)
```

```java
import io.milvus.v2.service.vector.request.SearchReq;

SearchReq searchReq = SearchReq.builder()
    .collectionName("my_collection")
    .data(Collections.singletonList(new FloatVec(new float[]{0.358f, -0.602f, 0.184f, -0.263f, 0.903f})))
    .filter("color like \"red%\"")
    .topK(3)
    .outputFields(Lists.newArrayList("color"))
    .build();

SearchResp searchResp = client.search(searchReq);
```

```go
resultSets, _ := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.FloatVector([]float32{0.358, -0.602, 0.184, -0.263, 0.903})},
).WithFilter("color like \"red%\"").WithOutputFields("color"))
```

```javascript
const res = await client.search({
    collection_name: "my_collection",
    data: [[0.358, -0.602, 0.184, -0.263, 0.903]],
    filter: 'color like "red%"',
    limit: 3,
    output_fields: ["color"]
});
```

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [[0.358, -0.602, 0.184, -0.263, 0.903]],
    "filter": "color like \"red%\"",
    "limit": 3,
    "outputFields": ["color"]
}'
```

## 分组搜索\{#grouping-search}

按字段对搜索结果进行分组，从而在更高维度上聚合数据并提升结果多样性。[了解更多](./grouping-search)。

```json
// Dataset: 3 items from different documents (docId)
// Search target: Get top result from each unique document
[
    {
        "id": 0,
        "vector": [0.358, -0.602, 0.184, -0.263, 0.903],
        "docId": 1
    },
    {
        "id": 1,
        "vector": [0.199, 0.060, 0.698, 0.261, 0.839],
        "docId": 5
    },
    {
        "id": 2,
        "vector": [0.437, -0.560, 0.646, 0.789, 0.208],
        "docId": 2
    }
]
```

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Group results by docId to get diverse results from different documents
res = client.search(
    collection_name="my_collection",
    data=[[0.145, 0.915, 0.797, 0.701, 0.561]],
    limit=3,
    group_by_field="docId",  # Group by: return top result from each unique docId
    output_fields=["docId"]
)
```

```java
SearchReq searchReq = SearchReq.builder()
    .collectionName("my_collection")
    .data(Collections.singletonList(new FloatVec(new float[]{0.145f, 0.915f, 0.797f, 0.701f, 0.561f})))
    .topK(3)
    .groupByFieldName("docId")
    .outputFields(Lists.newArrayList("docId"))
    .build();

SearchResp searchResp = client.search(searchReq);
```

```go
resultSets, _ := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.FloatVector([]float32{0.145, 0.915, 0.797, 0.701, 0.561})},
).WithGroupByField("docId").WithOutputFields("docId"))
```

```javascript
const res = await client.search({
    collection_name: "my_collection",
    data: [[0.145, 0.915, 0.797, 0.701, 0.561]],
    limit: 3,
    group_by_field: "docId",
    output_fields: ["docId"]
});
```

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [[0.145, 0.915, 0.797, 0.701, 0.561]],
    "groupByField": "docId",
    "limit": 3,
    "outputFields": ["docId"]
}'
```

## 混合搜索\{#hybrid-search}

组合多个向量字段，实现跨文本、图像等多种模态的多模态搜索。[了解更多](./hybrid-search)。

```json
// Dataset: 3 items with text and image embeddings
// Search target: Combine text and image similarity for multi-modal search
[
    {
        "id": 0,
        "text_dense": [0.358, -0.602, 0.184],
        "image_dense": [0.123, 0.456, 0.789]
    },
    {
        "id": 1,
        "text_dense": [0.199, 0.060, 0.698],
        "image_dense": [0.789, 0.234, 0.567]
    },
    {
        "id": 2,
        "text_dense": [0.437, -0.560, 0.646],
        "image_dense": [0.567, 0.890, 0.123]
    }
]
```

```python
from pymilvus import MilvusClient, AnnSearchRequest, RRFRanker

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Search request 1: text dense vector
req1 = AnnSearchRequest(
    data=[[0.358, -0.602, ...]],
    anns_field="text_dense",  # Search on text embeddings
    param={"metric_type": "IP"},
    limit=3
)
# Search request 2: image dense vector
req2 = AnnSearchRequest(
    data=[[0.123, 0.456, ...]],
    anns_field="image_dense",  # Search on image embeddings
    param={"metric_type": "IP"},
    limit=3
)

# Combine multiple vector searches with RRF (Reciprocal Rank Fusion)
res = client.hybrid_search(
    collection_name="my_collection",
    reqs=[req1, req2],  # Multiple search requests
    ranker=RRFRanker(),  # Rerank combined results
    limit=3
)
```

```java
Map<String,Object> params1 = new HashMap<>();
params1.put("metric_type", "IP");
AnnSearchReq req1 = AnnSearchReq.builder()
    .vectorFieldName("text_dense")
    .vectors(Collections.singletonList(new FloatVec(textVector)))
    .params(params1)
    .topK(3)
    .build();

AnnSearchReq req2 = AnnSearchReq.builder()
    .vectorFieldName("image_dense")
    .vectors(Collections.singletonList(new FloatVec(imageVector)))
    .params(params1)
    .topK(3)
    .build();

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
    .collectionName("my_collection")
    .searchRequests(Arrays.asList(req1, req2))
    .ranker(new RRFRanker(60))
    .topK(3)
    .build();
```

```go
req1 := milvusclient.NewANNSearchRequest(
    "text_dense",
    entity.IP,
    "",
    []entity.Vector{entity.FloatVector(textVector)},
    3,
)
req2 := milvusclient.NewANNSearchRequest(
    "image_dense",
    entity.IP,
    "",
    []entity.Vector{entity.FloatVector(imageVector)},
    3,
)

resultSets, _ := client.HybridSearch(ctx,
    milvusclient.NewHybridSearchOption(
        "my_collection",
        3,
        []milvusclient.ANNSearchRequest{req1, req2},
    ).WithRRFRanker(milvusclient.NewRRFRanker(60)),
)
```

```javascript
const res = await client.search({
    collection_name: "my_collection",
    data: [textVector, imageVector],
    anns_field: ["text_dense", "image_dense"],
    limit: 3
});
```

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "search": [
        {"data": [textVector], "annsField": "text_dense", "limit": 3},
        {"data": [imageVector], "annsField": "image_dense", "limit": 3}
    ],
    "limit": 3
}'
```

## 全文搜索\{#full-text-search}

使用关键词匹配并借助 BM25 相关性评分进行文本搜索，实现精准的词项检索。[了解更多](./full-text-search)。

```json
// Dataset: 3 text documents with BM25 sparse embeddings
// Search target: Find documents matching "machine learning" keywords
[
    {
        "id": 0,
        "text": "Artificial intelligence and machine learning",
        "text_sparse": {
            "indices": [12, 45, 78],
            "values": [0.8, 0.6, 0.9]
        }
    },
    {
        "id": 1,
        "text": "Neural networks for deep learning",
        "text_sparse": {
            "indices": [23, 56, 89],
            "values": [0.7, 0.5, 0.8]
        }
    },
    {
        "id": 2,
        "text": "Machine learning algorithms and applications",
        "text_sparse": {
            "indices": [12, 67, 90],
            "values": [0.9, 0.7, 0.6]
        }
    }
]
```

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Full-text search using raw text query (BM25 keyword matching)
res = client.search(
    collection_name="my_collection",
    data=["machine learning"],  # Raw text query (no manual embedding needed)
    anns_field="text_sparse",  # Search on sparse vectors generated by BM25
    limit=3
)
```

```java
SearchReq searchReq = SearchReq.builder()
    .collectionName("my_collection")
    .data(Collections.singletonList("machine learning"))
    .annsField("text_sparse")
    .topK(3)
    .build();

SearchResp searchResp = client.search(searchReq);
```

```go
resultSets, _ := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.NewSparseEmbedding("machine learning")},
).WithANNSField("text_sparse"))
```

```javascript
const res = await client.search({
    collection_name: "my_collection",
    data: ["machine learning"],
    anns_field: "text_sparse",
    limit: 3
});
```

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": ["machine learning"],
    "annsField": "text_sparse",
    "limit": 3
}'
```

## 搜索迭代器\{#search-iterator}

通过分页迭代获取超过 16,384 条上限的大规模搜索结果。[了解更多](./with-iterators)。

```json
// Dataset: First 3 items with vectors
// Search target: Iterate through 20,000 results in batches of 50
[
    {
        "id": 0,
        "vector": [0.358, -0.602, 0.184, -0.263, 0.903]
    },
    {
        "id": 1,
        "vector": [0.199, 0.060, 0.698, 0.261, 0.839]
    },
    {
        "id": 2,
        "vector": [0.437, -0.560, 0.646, 0.789, 0.208]
    }
]
```

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create iterator for large-scale retrieval (beyond 16,384 limit)
iterator = client.search_iterator(
    collection_name="my_collection",
    data=[[0.358, -0.602, 0.184, -0.263, 0.903]],
    anns_field="vector",
    batch_size=50,  # Return 50 results per iteration
    limit=20000  # Total results to retrieve
)

# Iterate through results in batches
while True:
    result = iterator.next()
    if not result:
        iterator.close()
        break
```

```java
SearchIterator searchIterator = client.searchIterator(
    SearchIteratorReq.builder()
        .collectionName("my_collection")
        .vectors(Collections.singletonList(queryVector))
        .vectorFieldName("vector")
        .batchSize(500L)
        .outputFields(Lists.newArrayList("id"))
        .build()
);

while (true) {
    List<QueryResultsWrapper.RowRecord> res = searchIterator.next();
    if (res.isEmpty()) {
        searchIterator.close();
        break;
    }
}
```

```go
itr, _ := client.SearchIterator(ctx, milvusclient.NewSearchIteratorOption(
    "my_collection",
    []entity.Vector{entity.FloatVector(queryVector)},
).WithBatchSize(500))

for {
    rs, err := itr.Next(ctx)
    if err != nil || len(rs) == 0 {
        itr.Close()
        break
    }
}
```

```javascript
const iterator = await client.searchIterator({
    collection_name: "my_collection",
    data: [[0.358, -0.602, 0.184, -0.263, 0.903]],
    batch_size: 50,
    limit: 20000
});

let result = await iterator.next();
while (result.length > 0) {
    result = await iterator.next();
}
```

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search_iterator" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [[0.358, -0.602, 0.184, -0.263, 0.903]],
    "annsField": "vector",
    "batchSize": 50,
    "limit": 20000
}'
```

## 查询\{#query}

无需向量搜索，通过过滤标量字段或主键来检索 Entity。[了解更多](./get-and-scalar-query)。

```json
// Dataset: 3 items with vectors and color metadata
// Search target: Query items where color starts with "red" (no vector search)
[
    {
        "id": 0,
        "vector": [0.358, -0.602, 0.184, -0.263, 0.903],
        "color": "pink_8682"
    },
    {
        "id": 1,
        "vector": [0.199, 0.060, 0.698, 0.261, 0.839],
        "color": "red_7025"
    },
    {
        "id": 2,
        "vector": [0.437, -0.560, 0.646, 0.789, 0.208],
        "color": "orange_6781"
    }
]
```

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Query entities by scalar field filter (no vector search)
res = client.query(
    collection_name="my_collection",
    filter='color like "red%"',  # Filter condition on scalar field
    output_fields=["id", "color"]  # Fields to return
)
```

```java
QueryReq queryReq = QueryReq.builder()
    .collectionName("my_collection")
    .filter("color like \"red%\"")
    .outputFields(Lists.newArrayList("id", "color"))
    .build();

QueryResp queryResp = client.query(queryReq);
```

```go
resultSets, _ := client.Query(ctx, milvusclient.NewQueryOption(
    "my_collection",
).WithFilter("color like \"red%\"").WithOutputFields("id", "color"))
```

```javascript
const res = await client.query({
    collection_name: "my_collection",
    filter: 'color like "red%"',
    output_fields: ["id", "color"]
});
```

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": "color like \"red%\"",
    "outputFields": ["id", "color"]
}'
```

</Hero>

<Bars>

选择项目[套餐](./select-zilliz-cloud-service-plans)，并在该项目中创建采用不同部署选项的集群。

- [Free](./create-cluster#create-a-free-cluster)

- [Serverless](./create-cluster#create-a-serverless-cluster)

- [Dedicated](./create-cluster#create-a-dedicated-cluster)

 [不确定该选择哪种部署选项？](https://zilliz.com/pricing)

</Bars>

<Stories>

## 在 Zilliz Cloud 中处理您的数据\{#work-with-your-data-in-zilliz-cloud}

## 将计算资源带到您的数据所在之处\{#bring-compute-resources-to-your-data}

1. 设置存储集成。

    将 AWS S3 存储桶、Google Cloud Storage 存储桶或 Microsoft Azure Blob 存储容器与 Zilliz Cloud 集成。

1. 创建[外部卷](./external-volume)。

    将某个路径或整个外部存储用作外部卷，外部卷是对集成存储中某个存储桶或路径的只读引用，使 Zilliz Cloud 能够就地访问您的数据，而无需复制或移动数据。

1. [创建 Database](./on-demand-database#create-database)。

    在按需计算中创建 Database。该 Database 是项目级资源，由该项目中的所有按需集群共享。

1. 在 Database 中创建外部 Collection。

    将 Collection 的列映射到您的 Parquet 文件、Lance 表、Iceberg 表，或自 0.56.0 起支持的 Vortex 文件。

1. 创建索引并刷新 Collection。

    为所有向量字段和可选的标量字段建立索引，然后刷新 Collection，以便 Zilliz Cloud 为该 Collection 创建元数据和索引文件。刷新通常在亚秒级完成。

1. 开始在您的数据中探索。

    随后，您便可以使用按需计算资源，对存储在外部存储中的数据进行向量搜索和标量过滤。

## 使用您自己的向量\{#bring-your-own-vectors}

1. 创建集群并连接到该集群。

    使用您所需的计算和存储资源[创建集群](./create-cluster)，然后[连接到该集群](./connect-to-clusters)。

1. 创建 Collection。

    Collection 是一张列固定、行可变的二维表。您可以创建外部 Collection，将计算能力带到您的数据所在之处，也可以创建托管 Collection，以享受高性能的向量搜索服务。

1. 导入数据。

    从本地文件或对象存储桶中[导入数据](./import-data)。

1. 执行向量相似度搜索。

    [基础向量相似度搜索](./single-vector-search)可帮助您找到最相似的结果。

## 集成 Embedding\{#integrated-embedding}

1. 创建集群并连接到该集群。

    使用您所需的计算和存储资源[创建集群](./create-cluster)，然后[连接到该集群](./connect-to-clusters)。

1. 设置模型提供商集成。

    创建 AWS、GCP 或 Azure 存储集成，用于存储第三方模型提供商的凭据。

1. 创建 Collection 并配置 Embedding 函数。

    创建一个至少包含一个向量字段和一个 VARCHAR 字段的托管 Collection，并定义文本 Embedding 函数。

1. 插入原始文本数据。

    [插入](./insert-entities)原始数据。Zilliz Cloud 会在数据写入过程中自动生成向量 Embedding。

1. 使用原始文本执行搜索。

    提供原始查询文本。Zilliz Cloud 会为查询生成 Embedding，将其与已存储的向量进行比较，并[返回](./single-vector-search)最相关的结果。

## 从其他数据基础设施迁移\{#migrate-from-other-data-infra}

1. 连接到您的数据源。

    Zilliz Cloud 支持多种数据源，包括 Pinecone、MongoDB、Qdrant、PostgreSQL 等。请参阅[迁移指南](./migrate-from-pinecone)。

1. 配置迁移源和目标。

    查看数据源信息并配置您的迁移目标。

1. 检查映射关系。

    设置并检查源数据与目标数据 Schema 之间的映射关系。

## 备份与恢复\{#backup-and-restore}

1. 为您的集群或 Collection 创建备份。

    备份是集群或 Collection 的某一时间点副本。您可以[手动创建备份](./create-backup)，也可以[设置备份策略](./schedule-automatic-backups)进行定时备份。您还可以[将备份复制到其他区域](/docs/backup-to-other-regions)，以提升灾难恢复能力。

1. （可选）将备份导出到对象存储服务。

    您可以将已创建的备份文件[导出](./export-backup-files)到 AWS S3 或 Azure Blob Storage。

1. 恢复数据。

    在发生意外系统故障或数据丢失时，[恢复您的数据](./restore-from-backup-files)。

</Stories>

<Cards>

## 进一步使用 Zilliz Cloud\{#go-further-with-zilliz-cloud}

- [监控与告警](./metrics-and-alerts)

    监控您的集群并及时获取告警。

- 访问控制

    通过细粒度访问控制保障您的数据安全。

- [私有网络](./setup-a-private-link)

    将您的集群连接到私有网络。

- break

- [计费](./payment-billing)

    按实际用量付费，无需预付费用。

- 集成

    与您现有的工具和工作流集成。

</Cards>

<Blocks>

## 使用您偏好的语言开始构建\{#start-building-with-your-preferred-language}

- [Python](/reference/python)

- [Java](/reference/java)

- [Go](/reference/go)

- [Node.js](/reference/nodejs)

- [RESTful API](/reference/restful)

</Blocks>
