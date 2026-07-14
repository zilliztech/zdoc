---
title: "ホーム | Cloud"
slug: /home
sidebar_label: "ホーム"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "これは Zilliz Cloud Developer Hub のホームページです。 | Cloud"
type: origin
token: KXgEwDH8yifWxukkXXFctMdLnpg
sidebar_position: 1
displayed_sidebar: default
keywords: 
  - zilliz
  - ベクトルデータベース
  - はじめに
  - 開発者ハブ
  - ホームページ
  - ホーム

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

# 自信を持って構築し、AI アプリケーションを加速\{#build-with-confidence-and-supercharge-your-ai-applications}

Zilliz Cloud は完全マネージドの Milvus サービスを提供し、セキュリティを重視しながら vector search アプリケーションのデプロイとスケーリングを簡素化します。

## 基本的な Vector Search\{#basic-vector-search}

近似最近傍（ANN）検索を実行して、クエリ vector に最も類似した vector を見つけます。[詳細はこちら](./single-vector-search)。

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

## フィルタ付き検索\{#filtered-search}

vector search の前にメタデータフィルタを適用して検索範囲を絞り、結果の関連性を向上させます。[詳細はこちら](./filtered-search)。

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

## グルーピング検索\{#grouping-search}

検索結果をフィールドごとにグループ化して、より高いレベルでデータを集約し、結果の多様性を向上させます。[詳細はこちら](./grouping-search)。

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

## ハイブリッド検索\{#hybrid-search}

複数の vector field を組み合わせて、テキスト、画像などをまたぐマルチモーダル検索を実現します。[詳細はこちら](./hybrid-search)。

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

## 全文検索\{#full-text-search}

BM25 の関連度スコアリングによるキーワードマッチングを使用してテキストを検索し、正確な用語検索を実現します。[詳細はこちら](./full-text-search)。

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

ページネーションによる反復取得を使用して、16,384 件の制限を超える大規模な検索結果を取得します。[詳細はこちら](./with-iterators)。

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

vector search を行わずに、scalar field または主キーでフィルタして entity を取得します。[詳細はこちら](./get-and-scalar-query)。

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

プロジェクトで[プラン](./select-zilliz-cloud-service-plans)を選択し、異なるデプロイオプションの cluster を作成します。

- [Free](./create-cluster#create-a-free-cluster)

- [Serverless](./create-cluster#create-a-serverless-cluster)

- [Dedicated](./create-cluster#create-a-dedicated-cluster)

 [どのデプロイオプションを選べばよいかわかりませんか？](https://zilliz.com/pricing)

</Bars>

<Stories>

# Zilliz Cloud でデータを活用する\{#work-with-your-data-in-zilliz-cloud}

## コンピュートリソースをデータに持ち込む\{#bring-compute-resources-to-your-data}

1. ストレージ統合を設定します。

    AWS S3 バケット、Google Cloud Storage バケット、または Microsoft Azure blob storage コンテナを Zilliz Cloud と統合します。

1. [external volume](./external-volumes) を作成します。

    パスまたは外部ストレージ全体を external volume として使用します。これは統合されたストレージ内のバケットまたはパスへの読み取り専用参照であり、Zilliz Cloud がデータをコピーまたは移動することなくその場でアクセスできるようにします。 

1. [データベースを作成](./create-database#create-database-in-on-demand-compute-or-public)します。

    オンデマンドコンピュートにデータベースを作成します。データベースはプロジェクトレベルのリソースであり、プロジェクト内のすべてのオンデマンド cluster で共有されます。 

1. データベース内に external collection を作成します。

    0.56.0 時点で、collection の列を Parquet ファイル、Lance テーブル、Iceberg テーブル、または Vortex ファイルにマッピングします。

1. index を作成し、collection を更新します。

    すべての vector field と必要に応じて scalar field に index を作成し、その後 collection を更新して、Zilliz Cloud が collection 用のメタデータと index ファイルを作成できるようにします。更新は通常、1 秒未満で完了します。

1. データの探索を開始します。

    その後、外部ストレージに保存されたデータに対して、オンデマンドコンピュートリソースを使った vector search と scalar フィルタリングを開始できます。

## 自分の Vector を持ち込む\{#bring-your-own-vectors}

1. cluster を作成して接続します。

    必要なコンピュートおよびストレージリソースで[cluster を作成](./create-cluster)し、その後[接続](./how-to-connect)します。

1. collection を作成します。

    collection は固定された列と可変の行を持つ二次元テーブルです。external collection を作成してデータに計算を持ち込むことも、managed collection を作成して高性能な vector search サービスを利用することもできます。

1. データをインポートします。

    ローカルファイルまたはオブジェクトストレージバケットから[データをインポート](./data-import-export)します。

1. vector 類似度検索を実行します。

    [基本的な vector 類似度検索](./single-vector-search)は、最も類似した結果を見つけるのに役立ちます。

## 統合 Embedding\{#integrated-embedding}

1. cluster を作成して接続します。

    必要なコンピュートおよびストレージリソースで[cluster を作成](./create-cluster)し、その後[接続](./how-to-connect)します。

1. モデルプロバイダー統合を設定するか、hosted model をデプロイします。

    サードパーティのモデルプロバイダー用認証情報を保存するために、AWS、GCP、または Azure のストレージ統合を作成します。あるいは、hosted model を[デプロイ](./hosted-models)することもできます。

1. collection を作成し、embedding function を構成します。

    少なくとも 1 つの vector field と 1 つの VARCHAR field を持つ managed collection を作成し、テキスト embedding function を定義します。

1. 生のテキストデータを挿入します。

    生データを[挿入](./insert-entities)します。Zilliz Cloud は取り込み時に自動的に vector embedding を生成します。

1. 生のテキストを使って検索を行います。

    生のクエリテキストを指定します。Zilliz Cloud はクエリを embedding し、保存された vector と比較して、最も関連性の高い結果を[返します](./single-vector-search)。

## 他のデータインフラから移行する\{#migrate-from-other-data-infra}

1. データソースに接続します。

    Zilliz Cloud は、Pinecone、MongoDB、Qdrant、PostgreSQL など、さまざまなデータソースをサポートしています。[Migration ](./migrations)[g](./migrations)[uides](./migrations)を参照してください。

1. 移行元と移行先を設定します。

    データソース情報を確認し、移行先を設定します。

1. マッピングを確認します。

    ソースデータとターゲットデータのスキーマ間のマッピングを設定して確認します。

## バックアップと復元\{#backup-and-restore}

1. cluster または collection のバックアップを作成します。

    バックアップは cluster または collection の特定時点のコピーです。バックアップは[手動で](./create-backup)作成することも、スケジュールバックアップ用に[バックアップポリシーを設定](./schedule-automatic-backups)することもできます。また、災害復旧機能を強化するために[バックアップを他のリージョンにコピー](/docs/backup-to-other-regions)することもできます。

1. （任意）バックアップをオブジェクトストレージサービスにエクスポートします。

    作成した[バックアップファイルをエクスポート](./export-backup-files)して、AWS S3 または Azure Blob Storage に保存できます。

1. データを復元します。

    予期しないシステム障害やデータ損失が発生した場合に、[データを復元](./restore-from-backup-files)します。

</Stories>

<Cards>

# Zilliz Cloud をさらに活用する\{#go-further-with-zilliz-cloud}

- [Monitoring & Alerts](./metrics-and-alerts)

    cluster を監視し、適切なタイミングでアラートを受け取ります。

- Access Control

    きめ細かなアクセス制御でデータを保護します。

- [Private Networking](./setup-a-private-link)

    cluster をプライベートネットワークに接続します。

- break

- [Billing](./payment-billing)

    初期費用なしで、使用した分だけ支払います。

- Integrations

    既存のツールやワークフローと統合します。

</Cards>

<Blocks>

# お好みの言語で構築を始める\{#start-building-with-your-preferred-language}

- [Python](/reference/python)

- [Java](/reference/java)

- [Go](/reference/go)

- [Node.js](/reference/nodejs)

- [RESTful API](/reference/restful)

</Blocks>

<Banner bannerText="お探しのものが見つかりませんか？" bannerLinkText="Ask AI を試す" />
