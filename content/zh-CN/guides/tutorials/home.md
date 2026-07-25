---
title: "首页 | Cloud"
slug: /home
sidebar_key: home
sidebar_label: "首页"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "此页为 Zilliz Cloud 开发者中心的首页。 | Cloud"
type: origin
token: I5PAwH8MFi67Myky6EYcAxuVnNe
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 首页

hide_title: true
hide_table_of_contents: true
---

import Admonition from '@theme/Admonition';



import Hero from '@site/src/components/Hero';


import Bars from '@site/src/components/Bars';


import Blocks from '@site/src/components/Blocks';


import Cards from '@site/src/components/Cards';


import Stories from '@site/src/components/Stories';


import Banner from '@site/src/components/Banner';



<Hero>

# 从容构建、为您的 AI 应用注入强劲动力\{#ai}

Zilliz Cloud 提供完全托管的 Milvus 服务，简化您的向量检索应用的部署和扩缩容流程，并提供相应的安全保障，将您从复杂运维流程中解放出来。

## Basic Vector Search\{#basic-vector-search}

执行相似最近邻（ANN）搜索，找出与您提供的查询微量最接近的候选向量。[了解更多](./single-vector-search)。

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

## Filtered Search\{#filtered-search}

在向量搜索前使用元数据过滤缩小搜索范围，从而提升搜索结果的相关性。[了解更多](./filtered-search)。

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

## Grouping Search\{#grouping-search}

按指定字段为搜索结果分组，从而在更高维度上整合搜索结果，提升搜索结果的多样性。[了解更多](./grouping-search)。

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

## Hybrid Search\{#hybrid-search}

结合多向量列，实现跨文本、图像及更多非结构化数据的相似性搜索。[了解更多](./hybrid-search)。

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

## Full Text Search\{#full-text-search}

通过 BM25 相似性得分实现搜索关键词的精确匹配。[了解更多](./full-text-search)。

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

## Search Iterator\{#search-iterator}

突破 16,384 的召回上限，实现大规模搜索结果的分页迭代。[了解更多](./with-iterators)。

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

## Query\{#query}

通过元数据或主键过滤来获取相关 Entity。[了解更多](./get-and-scalar-query)。

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

Zilliz Cloud 提供如下集群部署方式：

- [Free](./create-cluster-on-demand#set-up-a-free-cluster)

- [Serverless](./create-cluster-on-demand#create-a-serverless-cluster)

- [Dedicated](./create-cluster-on-demand#create-a-dedicated-cluster)

[不清楚如何选择合适的部署方式？](https://zilliz.com.cn/pricing)

</Bars>

<Stories>

# 在 Zilliz Cloud 上使用您的数据\{#zilliz-cloud}

## 使用自带向量数据\{#}

1. 创建并连接您的 Zilliz Cloud 集群。

    您需要[创建一个集群](./create-cluster)，并为您分配合适的计算和存储资源，然后[连接这个集群](./connect-to-cluster)。

1. 创建 Collection。

    Collection 是一个二维数据表，拥有固定的列数和可变行数。您需要在集群中[创建一个 Collection](./manage-collections-sdks) 来存放您的数据。

1. 导入数据。

    您可以选择从本地文件或您的对象存储桶中[导入数据](./import-data)。

1. 执行向量相似性搜索。

    [向量相似性搜索](./single-vector-search)可以帮助您发现与您的查询向量最相似的搜索结果。

## 集成 Embedding 模型\{#embedding}

1. 创建并连接您的 Zilliz Cloud 集群。

    您需要[创建一个集群](./create-cluster)，并为您分配合适的计算和存储资源，然后[连接这个集群](./connect-to-cluster)。

1. 设置模型供应商集成或部署托管模型。

    [添加集成](./integrate-with-model-providers)，存储访问模型供应商所需的认证信息。或[部署](./hosted-models)托管模型。

1. 创建 Collection 并设置 Embedding Function。

    [创建一个 Collection](./manage-collections-sdks) 来存放您的数据。您的 Collection 中至少需要包含 1 个向量字段和 1 个 VARCHAR 字段。您还需要再创建时定义 Embedding Function。

1. 插入原始文本数据。

    [插入](./insert-entities)原始数据。Zilliz Cloud 会在数据 Ingest 过程中自动生成向量。

1. 使用原始文本进行搜索。

    提供原始查询文本。Zilliz Cloud 会将其转化为向量，与已存储的向量进行相似度比对，并[返回](./single-vector-search)最相关的结果。

## 从其它数据源迁移数据\{#}

1. 连接到您的数据源

    Zilliz Cloud 支持为数众多的数据源。您可以选择从 Pinecone, Qdrant, Elasticsearch, PostgreSQL 等数据源[迁移您的数据到 Zilliz Cloud](./migrations)。

1. 配置数据源及目标集群。

    检查您的数据源信息，并指定迁移的目标集群。

1. 检查字段映射关系。

    设置并检查数据源表字段和目标 Collection 字段间的映射关系。

## 备份与恢复\{#}

1. 为您的集群或 Collection 创建备份。

    备份为目标集群或 Collection 在某个时点的数据拷贝。您可以[手动创建备份](./create-snapshot)，也可以[设置定时自动备份](./schedule-automatic-backups)。此外，您还可以进行[跨地域备份](./backup-to-other-regions)以提升容灾能力。

1. （可选）导出备份到您的对象存储。

    您可以将您备份好的数据导入到阿里云对象存储。

1. 恢复数据。

    您可以在系统错误或数据丢失时选择相应的备份[恢复您的数据](./restore-from-snapshot)。

</Stories>

<Cards>

# 深入了解 Zilliz Cloud\{#zilliz-cloud}

- [监控与告警 (Monitoring & Alerts)](./metrics-and-alerts)

    监控您的集群并及时获得相关告警。

- [访问控制 (Access Control)](./access-control)

    细粒度的访问控制，保护您的数据安全。

- [私网连接 (Private Networking)](./setup-a-private-link)

    使用私网连接连接您的集群，提升数据安全。

- break

- [支付与账单 (Billing)](./payment-billing)

    提供多样的计费模式：按量付费或包年包月。

- [第三方集成 (Integrations)](https://zilliz.com/learn/milvus-notebooks)

    在您现有的技术栈和工作流中集成 Zilliz Cloud。

</Cards>

<Blocks>

# 使用您熟悉的编程语言\{#}

- [Python](/reference/python)

- [Java](/reference/java)

- [Go](/reference/go)

- [Node.js](/reference/nodejs)

- [RESTful API](/reference/restful)

</Blocks>

<Banner bannerText="仍旧无法找到您需要的信息？" bannerLinkText="试试 Ask AI" />

import DocCardList from '@theme/DocCardList';

<DocCardList />