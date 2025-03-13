---
title: "基本的なベクトル検索 | Cloud"
slug: /single-vector-search
sidebar_label: "基本的なベクトル検索"
beta: FALSE
notebook: FALSE
description: "ベクトル埋め込みのソートされた順序を記録したインデックスファイルに基づいて、近似最近傍法(ANN)検索は、受信した検索リクエストで運ばれたクエリベクトルに基づいてベクトル埋め込みのサブセットを検索し、クエリベクトルをサブグループ内のものと比較して、最も類似した結果を返します。ANN検索では、Zilliz Cloudが効率的な検索体験を提供します。このページでは、基本的なANN検索の方法を学ぶことができます。 | Cloud"
type: origin
token: HvZ5wulvviC4mukWJzNcgbAQnhb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - vector search
  - ann
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基本的なベクトル検索

ベクトル埋め込みのソートされた順序を記録したインデックスファイルに基づいて、近似最近傍法(ANN)検索は、受信した検索リクエストで運ばれたクエリベクトルに基づいてベクトル埋め込みのサブセットを検索し、クエリベクトルをサブグループ内のものと比較して、最も類似した結果を返します。ANN検索では、Zilliz Cloudが効率的な検索体験を提供します。このページでは、基本的なANN検索の方法を学ぶことができます。

## 概要について{#overview}

ANNとk最近傍探索(kNN)は、ベクトル類似性検索の通常の方法です。kNN検索では、最も類似したものを見つける前に、検索要求で運ばれるクエリベクトルとベクトル空間内のすべてのベクトルを比較する必要があり、時間とリソースがかかります。

kNN検索とは異なり、ANN検索アルゴリズムはベクトル埋め込みのソートされた順序を記録する**インデックス**ファイルを要求します。検索リクエストが送信されると、インデックスファイルを参照として使用して、クエリベクトルに最も似たベクトル埋め込みを含むサブグループをすばやく検索できます。その後、指定された**メトリックタイプ**を使用して、クエリベクトルとサブグループの類似度を測定し、クエリベクトルとの類似度に基づいてグループメンバーをソートし、**トップK**グループメンバーを特定できます。

ANN検索はあらかじめ構築されたインデックスに依存し、検索スループット、メモリ使用量、検索の正確性は選択したインデックスの種類によって異なる場合があります。検索のパフォーマンスと正確性のバランスを取る必要があります。

学習曲線を減らすために、Zilliz Cloudは**AUTOINDEX**を提供しています。**AUTOINDEX**を使用すると、Zilliz Cloudはコレクション内のデータ分布を分析しながらインデックスを構築し、分析に基づいて最適化されたインデックスパラメータを設定して、検索パフォーマンスと正確性のバランスを取ることができます。

AUTOINDEXと適用可能なメトリックタイプの詳細については、「[AUTOINDEXの説明](./autoindex-explained)」and「[メトリックの種類](./search-metrics-explained)」を参照してください。このセクションでは、以下のトピックについて詳しく説明します。

- [単一ベクトル探索](./single-vector-search#single-vector-search)

- [一括ベクトル探索](./single-vector-search#bulk-vector-search)

- [パーティション内のANN検索](./single-vector-search#ann-search-in-partition)

- [出力フィールドを使用する](./single-vector-search#use-output-fields)

- [リミットとオフセットを使用する](./single-vector-search#use-limit-and-offset)

- [使用レベル](./single-vector-search#use-level)

- [リコール率を取得する](./single-vector-search#get-recall-rate)

- [ANN検索を強化する](./single-vector-search#enhancing-ann-search)

## 単一ベクトル探索{#single-vector-search}

ANN検索において、単一ベクトル検索とは、1つのクエリベクトルのみを含む検索を指します。事前に構築されたインデックスと検索リクエストに含まれるメトリックタイプに基づいて、Zilliz Cloudは、クエリベクトルに最も似た上位K個のベクトルを検索します。

このセクションでは、単一ベクトル検索を実行する方法を学びます。コードスニペットは、[クイックセットアップ](./quick-setup-collections#quick-setup)方法でコレクションを作成したことを前提としています。検索リクエストには単一のクエリベクトルが含まれ、Zilliz Cloudを使用して、クエリベクトルとコレクション内のベクトルの類似度を計算し、最も類似した3つを返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
res = client.search(
    collection_name="my_collection",
    anns_field="vector",
    data=[query_vector],
    limit=3,
    search_params={"metric_type": "IP"}
)

for hits in res:
    for hit in hits:
        print(hit)

# [
#     [
#         {
#             "id": 551,
#             "distance": 0.08821295201778412,
#             "entity": {}
#         },
#         {
#             "id": 296,
#             "distance": 0.0800950899720192,
#             "entity": {}
#         },
#         {
#             "id": 43,
#             "distance": 0.07794742286205292,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());
    
FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.95944905, id=5)
// SearchResp.SearchResult(entity={}, score=0.8689616, id=1)
// SearchResp.SearchResult(entity={}, score=0.866088, id=7)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

func ExampleClient_Search_basic() {
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    milvusAddr := "YOUR_CLUSTER_ENDPOINT"
    token := "YOUR_CLUSTER_TOKEN"

    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: milvusAddr,
        APIKey:  token,
    })
    if err != nil {
        log.Fatal("failed to connect to milvus server: ", err.Error())
    }

    defer cli.Close(ctx)

    queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

    resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
        "my_collection", // collectionName
        3,             // limit
        []entity.Vector{entity.FloatVector(queryVector)},
    ))
    if err != nil {
        log.Fatal("failed to perform basic ANN search collection: ", err.Error())
    }

    for _, resultSet := range resultSets {
        log.Println("IDs: ", resultSet.IDs)
        log.Println("Scores: ", resultSet.Scores)
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 4. Single vector search
var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = await client.search({
    collection_name: "my_collection",
    data: query_vector,
    limit: 3, // The number of results to return
})

console.log(res.results)

// [
//   { score: 0.08821295201778412, id: '551' },
//   { score: 0.0800950899720192, id: '296' },
//   { score: 0.07794742286205292, id: '43' }
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "limit": 3
}'

# {
#     "code": 0,
#     "data": [
#         {
#             "distance": 0.08821295201778412,
#             "id": 551
#         },
#         {
#             "distance": 0.0800950899720192,
#             "id": 296
#         },
#         {
#             "distance": 0.07794742286205292,
#             "id": 43
#         }
#     ]
# }
```

</TabItem>
</Tabs>

Milvusは、クエリベクトルとの類似度スコアによって検索結果を降順にランク付けします。類似度スコアは、クエリベクトルまでの距離とも呼ばれ、その値の範囲は使用されるメトリックタイプによって異なります。

次の表に、適用可能なメトリックタイプと対応する距離範囲を示します。

<table>
   <tr>
     <th><p>メートルタイプ</p></th>
     <th><p>の特徴</p></th>
     <th><p>距離の範囲</p></th>
   </tr>
   <tr>
     <td><p><code>L 2</code></p></td>
     <td><p>値が小さいほど類似度が高いことを示します。</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>値が大きいほど類似度が高いことを示します。</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>コサイン</code></p></td>
     <td><p>値が大きいほど類似度が高いことを示します。</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>ジャカード</code></p></td>
     <td><p>値が小さいほど類似度が高いことを示します。</p></td>
     <td><p>[0, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>ハミング</code></p></td>
     <td><p>値が小さいほど類似度が高いことを示します。</p></td>
     <td><p>[0, dim(ベクトル)]</p></td>
   </tr>
</table>

## 一括ベクトル検索{#bulk-vector-search}

Zilliz Cloudは、クエリベクトルに対してANN検索を並列に実行し、2つの結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 7. Search with multiple vectors
# 7.1. Prepare query vectors
query_vectors = [
    [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648],
    [0.0039737443, 0.003020432, -0.0006188639, 0.03913546, -0.00089768134]
]

# 7.2. Start search
res = client.search(
    collection_name="my_collection",
    data=query_vectors,
    limit=3,
)

for hits in res:
    print("TopK results:")
    for hit in hits:
        print(hit)

# Output
#
# [
#     [
#         {
#             "id": 551,
#             "distance": 0.08821295201778412,
#             "entity": {}
#         },
#         {
#             "id": 296,
#             "distance": 0.0800950899720192,
#             "entity": {}
#         },
#         {
#             "id": 43,
#             "distance": 0.07794742286205292,
#             "entity": {}
#         }
#     ],
#     [
#         {
#             "id": 730,
#             "distance": 0.04431751370429993,
#             "entity": {}
#         },
#         {
#             "id": 333,
#             "distance": 0.04231833666563034,
#             "entity": {}
#         },
#         {
#             "id": 232,
#             "distance": 0.04221535101532936,
#             "entity": {}
#         }
#     ]
# ]

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.BaseVector;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

List<BaseVector> queryVectors = Arrays.asList(
        new FloatVec(new float[]{0.041732933f, 0.013779674f, -0.027564144f, -0.013061441f, 0.009748648f}),
        new FloatVec(new float[]{0.0039737443f, 0.003020432f, -0.0006188639f, 0.03913546f, -0.00089768134f})
);
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(queryVectors)
        .topK(3)
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.49548206, id=1)
// SearchResp.SearchResult(entity={}, score=0.320147, id=3)
// SearchResp.SearchResult(entity={}, score=0.107413776, id=6)
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.5678123, id=6)
// SearchResp.SearchResult(entity={}, score=0.32368967, id=2)
// SearchResp.SearchResult(entity={}, score=0.24108477, id=3)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

queryVectors := []entity.Vector{
    entity.FloatVector([]float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}),
    entity.FloatVector([]float32{0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104}),
}

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,             // limit
    queryVectors,
))
if err != nil {
    log.Fatal("failed to perform basic ANN search collection: ", err.Error())
}

for _, resultSet := range resultSets {
    log.Println("IDs: ", resultSet.IDs)
    log.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 7. Search with multiple vectors
const query_vectors = [
    [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], 
    [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]
]

res = await client.search({
    collection_name: "quick_setup",
    vectors: query_vectors,
    limit: 5,
})

console.log(res.results)

// Output
// 
// [
//   [
//     { score: 0.08821295201778412, id: '551' },
//     { score: 0.0800950899720192, id: '296' },
//     { score: 0.07794742286205292, id: '43' }
//   ],
//   [
//     { score: 0.04431751370429993, id: '730' },
//     { score: 0.04231833666563034, id: '333' },
//     { score: 0.04221535101532936, id: '232' },
//   ]
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
        [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]
    ],
    "annsField": "vector",
    "limit": 3
}'

# {
#     "code": 0,
#     "data": [
#         [
#           {
#               "distance": 0.08821295201778412,
#               "id": 551
#           },
#           {
#               "distance": 0.0800950899720192,
#               "id": 296
#           },
#           {
#               "distance": 0.07794742286205292,
#               "id": 43
#           }
#         ],
#         [
#           {
#               "distance": 0.04431751370429993,
#               "id": 730
#           },
#           {
#               "distance": 0.04231833666563034,
#               "id": 333
#           },
#           {
#               "distance": 0.04221535101532936,
#               "id": 232
#           }
#        ]
#     ]
# }
```

</TabItem>
</Tabs>

## パーティション内のANN検索{#ann-search-in-partition}

コレクション内に複数のパーティションを作成した場合、検索範囲を特定のパーティション数に絞り込むことができます。その場合、検索リクエストにターゲットパーティション名を含めて、指定されたパーティション内で検索範囲を制限することができます。検索に関与するパーティション数を減らすことで、検索のパフォーマンスが向上します。

次のコードスニペットは、コレクション内のPartitionAという名前のパーティション**を**想定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
res = client.search(
    collection_name="my_collection",
    # highlight-next-line
    partition_names=["partitionA"],
    data=[query_vector],
    limit=3,
)

for hits in res:
    print("TopK results:")
    for hit in hits:
        print(hit)

# [
#     [
#         {
#             "id": 551,
#             "distance": 0.08821295201778412,
#             "entity": {}
#         },
#         {
#             "id": 296,
#             "distance": 0.0800950899720192,
#             "entity": {}
#         },
#         {
#             "id": 43,
#             "distance": 0.07794742286205292,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .partitionNames(Collections.singletonList("partitionA"))
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.6395302, id=13)
// SearchResp.SearchResult(entity={}, score=0.5408028, id=12)
// SearchResp.SearchResult(entity={}, score=0.49696884, id=17)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,             // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithPartitions("partitionA"))
if err != nil {
    log.Fatal("failed to perform basic ANN search collection: ", err.Error())
}

for _, resultSet := range resultSets {
    log.Println("IDs: ", resultSet.IDs)
    log.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Single vector search
var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = await client.search({
    collection_name: "quick_setup",
    // highlight-next-line
    partition_names: ["partitionA"],
    data: query_vector,
    limit: 3, // The number of results to return
})

console.log(res.results)

// [
//   { score: 0.08821295201778412, id: '551' },
//   { score: 0.0800950899720192, id: '296' },
//   { score: 0.07794742286205292, id: '43' }
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
    "partitionNames": ["partitionA"],
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "limit": 3
}'

# {
#     "code": 0,
#     "data": [
#         {
#             "distance": 0.08821295201778412,
#             "id": 551
#         },
#         {
#             "distance": 0.0800950899720192,
#             "id": 296
#         },
#         {
#             "distance": 0.07794742286205292,
#             "id": 43
#         }
#     ]
# }
```

</TabItem>
</Tabs>

## 出力フィールドを使用する{#use-output-fields}

検索結果には、Zilliz Cloudが含まれます。デフォルトでは、上位K個のベクトル埋め込みを含むエンティティの主要なフィールド値と類似距離/スコアが含まれます。ベクトルフィールドとスカラーフィールドの両方を含むターゲットフィールドの名前を出力フィールドとして検索リクエストに含めることで、検索結果にこれらのエンティティの他のフィールドの値を含めることができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={"metric_type": "IP"}，
    # highlight-next-line
    output_fields=["color"]
)

print(res)

# [
#     [
#         {
#             "id": 551,
#             "distance": 0.08821295201778412,
#             "entity": {
#                 "color": "orange_6781"
#             }
#         },
#         {
#             "id": 296,
#             "distance": 0.0800950899720192,
#             "entity": {
#                 "color": "red_4794"
#             }
#         },
#         {
#             "id": 43,
#             "distance": 0.07794742286205292,
#             "entity": {
#                 "color": "grey_8510"
#             }
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .outputFields(Collections.singletonList("color"))
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={color=black_9955}, score=0.95944905, id=5)
// SearchResp.SearchResult(entity={color=red_7319}, score=0.8689616, id=1)
// SearchResp.SearchResult(entity={color=white_5015}, score=0.866088, id=7)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,             // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithOutputFields("color"))
if err != nil {
    log.Fatal("failed to perform basic ANN search collection: ", err.Error())
}

for _, resultSet := range resultSets {
    log.Println("IDs: ", resultSet.IDs)
    log.Println("Scores: ", resultSet.Scores)
    log.Println("Colors: ", resultSet.GetColumn("color"))
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Single vector search
var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = await client.search({
    collection_name: "quick_setup",
    data: query_vector,
    limit: 3, // The number of results to return
    // highlight-next-line
    output_fields: ["color"]
})

console.log(res.results)

// [
//   { score: 0.08821295201778412, id: '551', entity: {"color": "orange_6781"}},
//   { score: 0.0800950899720192, id: '296' entity: {"color": "red_4794"}},
//   { score: 0.07794742286205292, id: '43' entity: {"color": "grey_8510"}}
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "limit": 3,
    "outputFields": ["color"]
}'

# {
#     "code": 0,
#     "data": [
#         {
#             "distance": 0.08821295201778412,
#             "id": 551,
#             "color": "orange_6781"
#         },
#         {
#             "distance": 0.0800950899720192,
#             "id": 296,
#             "color": "red_4794"
#         },
#         {
#             "distance": 0.07794742286205292,
#             "id": 43
#             "color": "grey_8510"
#         }
#     ]
# }
```

</TabItem>
</Tabs>

## リミットとオフセットを使用する{#use-limit-and-offset}

検索リクエストに含まれるパラメータ`制限`によって、検索結果に含めるエンティティの数が決まることに気付くかもしれません。このパラメータは、1回の検索で返すエンティティの最大数を指定し、通常は**top-K**と呼ばれます。

ページ分割クエリを実行したい場合は、ループを使用して複数の検索リクエストを送信し、各クエリリクエストで**Limit**および**Offset**パラメータを使用できます。具体的には、**Limit**パラメータを現在のクエリ結果に含めたいエンティティの数に設定し、**Offset**を既に返されたエンティティの総数に設定できます。

以下の表は、一度に100個のエンティティを返すときに、ページ分割されたクエリの**Limit**と**Offset**パラメータを設定する方法を示しています。

<table>
   <tr>
     <th><p>クエリー</p></th>
     <th><p>クエリごとに返すエンティティ</p></th>
     <th><p>エンティティはすでに返却済みです。</p></th>
   </tr>
   <tr>
     <td><p>第<strong>1回</strong>クエリー</p></td>
     <td><p>100</p></td>
     <td><p>0</p></td>
   </tr>
   <tr>
     <td><p>第<strong>2回</strong>クエリ</p></td>
     <td><p>100</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p>第<strong>3回</strong>クエリ</p></td>
     <td><p>100</p></td>
     <td><p>200</p></td>
   </tr>
   <tr>
     <td><p>n番<strong>目</strong>のクエリ</p></td>
     <td><p>100</p></td>
     <td><p>100のx(n-1)</p></td>
   </tr>
</table>

1回のANN検索では、`limit`と`offset`の合計は16,384小なりになることに注意してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "metric_type": "IP", 
        # highlight-next-line
        "offset": 10 # The records to skip
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .offset(10)
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.24120237, id=16)
// SearchResp.SearchResult(entity={}, score=0.22559784, id=9)
// SearchResp.SearchResult(entity={}, score=-0.09906838, id=2)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,             // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithOffset(10))
if err != nil {
    log.Fatal("failed to perform basic ANN search collection: ", err.Error())
}

for _, resultSet := range resultSets {
    log.Println("IDs: ", resultSet.IDs)
    log.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Single vector search
var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = await client.search({
    collection_name: "quick_setup",
    data: query_vector,
    limit: 3, // The number of results to return,
    // highlight-next-line
    offset: 10 // The record to skip.
})
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "limit": 3,
    "offset": 10
}'
```

</TabItem>
</Tabs>

## 使用レベル{#use-level}

ANN検索を最適化するために、Zilliz Cloudには`level`という名前のパラメータが用意されています。

このパラメータの範囲は`1`から`10`で、デフォルトは`1`です。値を増やすと、検索のパフォーマンスが低下しながら検索の再現率が向上します。一般的な場合、デフォルト値では最大90%の再現率が得られます。必要に応じて値を増やすことができます。

<Admonition type="info" icon="📘" title="ノート">

<p>この<code>level</code>パラメーターはまだ<strong>Public Preview</strong>のままです。<code>5</code>に設定できない場合は、クラスターがこの機能を完全にサポートしていない可能性があります。回避策として、<code>1</code>から<code>5</code>の範囲内の値に設定するか、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            # highlight-next-line
            "level": 10 # The precision control
        }
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
Map<String, Object> params = new HashMap<>();
params.put("level", 10);
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .searchParams(params)
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.95944905, id=5)
// SearchResp.SearchResult(entity={}, score=0.8689616, id=1)
// SearchResp.SearchResult(entity={}, score=0.866088, id=7)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Single vector search
var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = await client.search({
    collection_name: "quick_setup",
    data: query_vector,
    limit: 3, // The number of results to return,
    params: {
        // highlight-next-line
        "level": 10 // The precision control
    }
})
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
        [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]
    ],
    "annsField": "vector",
    "limit": 3,
    "searchParams":{
        "params":{
            "level":10
        }
    }
}'

# {"code":0,"cost":0,"data":[{"distance":1,"id":0},{"distance":0.6290165,"id":1},{"distance":0.5975797,"id":4},{"distance":0.9999999,"id":1},{"distance":0.7408552,"id":7},{"distance":0.6290165,"id":0}]}
```

</TabItem>
</Tabs>

## リコール率を取得する{#get-recall-rate}

levelパラメータを微調整するときに、`enable_recall_estimation`を`True`に設定して、異なる`level`値で検索の精度を評価できるようにします。

<Admonition type="info" icon="📘" title="ノート">

<p><code>enable_recall_estimation</code>パラメータはまだ<strong>パブリックプレビュー</strong>のため、互換性の問題により使用できない可能性があります。サポートが必要な場合は、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>までお問い合わせください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            # highlight-next-line
            "level": 10 # The precision control,
            "enable_recall_calculation": True # Ask to return recall rate
        }
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
Map<String, Object> params = new HashMap<>();
params.put("level", 10);
params.put("enable_recall_calculation", true)
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .searchParams(params)
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.95944905, id=5)
// SearchResp.SearchResult(entity={}, score=0.8689616, id=1)
// SearchResp.SearchResult(entity={}, score=0.866088, id=7)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Single vector search
var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = await client.search({
    collection_name: "quick_setup",
    data: query_vector,
    limit: 3, // The number of results to return,
    params: {
        // highlight-next-line
        "level": 10 // The precision control
        "enable_recall_calculation": true // Ask to return recall rate
    }
})
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
        [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]
    ],
    "annsField": "vector",
    "limit": 3,
    "searchParams":{
        "params":{
            "level":10,
            "enable_recall_calculation": true
        }
    }
}'

# {"code":0,"cost":0,"data":[{"distance":1,"id":0},{"distance":0.6290165,"id":1},{"distance":0.5975797,"id":4},{"distance":0.9999999,"id":1},{"distance":0.7408552,"id":7},{"distance":0.6290165,"id":0}]}
```

</TabItem>
</Tabs>

## ANN検索を強化する{#enhancing-ann-search}

AUTOINDEXはANN検索の学習曲線を大幅に平坦化します。ただし、上位Kが増加するにつれて、検索結果が常に正しいとは限りません。Zilliz Cloudは、検索範囲を縮小し、検索結果の関連性を向上させ、検索結果を多様化することで、以下の検索強化を実現します。

- フィルター検索

    Zilliz CloudがANN検索を行う前にメタデータフィルタリングを行うように、検索要求にフィルタリング条件を含めることができます。これにより、検索範囲がコレクション全体から指定されたフィルタリング条件に一致するエンティティのみに縮小されます。

    メタデータのフィルタリングとフィルタリング条件の詳細については、[フィルター検索](./filtered-search)と[フィルタリング](./filtering)を参照してください。

- レンジ検索

    特定の範囲内で返されるエンティティの距離またはスコアを制限することで、検索結果の関連性を向上させることができます。Zilliz Cloudでは、範囲検索は、クエリベクトルに最も似たベクトル埋め込みを中心に2つの同心円を描画することを含みます。検索リクエストは両方の円の半径を指定し、Zilliz Cloudは、外側の円に含まれるが内側の円には含まれないすべてのベクトル埋め込みを返します。

    範囲検索の詳細については、[レンジ検索](./range-search)を参照してください。

- グループ検索

    返されたエンティティが特定のフィールドで同じ値を保持している場合、検索結果はベクトル空間内のすべてのベクトル埋め込みの分布を表すわけではありません。検索結果を多様化するには、グループ化検索を使用することを検討してください。

    グループ検索の詳細については、[グループ検索](./grouping-search)を参照してください、

- ハイブリッド検索

    コレクションには、異なる埋め込みモデルを使用して生成されたベクトル埋め込みを保存するために最大4つのベクトルフィールドを含めることができます。これにより、ハイブリッド検索を使用してこれらのベクトルフィールドから検索結果を再ランク付けし、リコール率を向上させることができます。

    ハイブリッド検索の詳細については、[ハイブリッド検索](./hybrid-search)を参照してください。

- 検索イテレータ

    1回のANN検索で最大16,384個のエンティティが返されます。1回の検索でより多くのエンティティを返す必要がある場合は、検索イテレータを使用することを検討してください。

    検索イテレータの詳細については、[検索イテレータ](./with-iterators)を参照してください。

- フルテキスト検索

    フルテキスト検索は、テキストデータセット内の特定の用語やフレーズを含むドキュメントを取得し、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性がある意味検索の制限を克服し、最も正確で文脈に関連する結果を受け取ることを保証します。さらに、生のテキスト入力を受け入れることにより、ベクトル検索を簡素化し、手動でベクトル埋め込みを生成する必要なく、テキストデータを疎な埋め込みに自動的に変換します。

    全文検索の詳細については、[フルテキスト検索](./full-text-search)を参照してください。

- キーワード一致

    Milvusのキーワードマッチにより、特定の用語に基づく正確なドキュメント検索が可能になります。この機能は、特定の条件を満たすためにフィルタリングされた検索に主に使用され、スカラーフィルタリングを組み込んでクエリ結果を絞り込むことができ、スカラー基準を満たすベクトル内の類似検索を可能にします。

    キーワード一致の詳細については、[テキスト一致](./text-match)を参照してください。

- パーティションキーを使う

    メタデータフィルタリングに複数のスカラーフィールドを関与させ、かなり複雑なフィルタリング条件を使用すると、検索効率に影響を与える可能性があります。パーティションキーとしてスカラーフィールドを設定し、検索要求にパーティションキーを含むフィルタリング条件を使用すると、指定されたパーティションキー値に対応するパーティション内の検索範囲を制限するのに役立ちます。

    パーティションキーの詳細については、[パーティションキーを使う](./use-partition-key)するを参照してください。

- mmapを使う

    mmap-settingsの詳細は、[mmapを使う](./use-mmap)うを参照してください。

