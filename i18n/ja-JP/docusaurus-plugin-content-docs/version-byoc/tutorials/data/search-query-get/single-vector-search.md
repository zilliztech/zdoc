---
title: "基本ベクトル検索 | BYOC"
slug: /single-vector-search
sidebar_label: "基本ベクトル検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル埋め込みのソートされた順序を記録したインデックスファイルに基づき、近似最近傍（ANN）検索は、受信した検索リクエストに含まれるクエリベクトルを基にベクトル埋め込みのサブセットを特定し、クエリベクトルとサブグループ内のベクトルを比較して最も類似した結果を返します。ANN検索により、Zilliz Cloudは効率的な検索体験を提供します。このページでは、基本的なANN検索の実行方法について学びます。 | BYOC"
type: origin
token: BaGlwzDmyiyVvVk6NurcFclInCd
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - ベクトル検索
  - ann
  - Faissベクトルデータベース
  - Chromaベクトルデータベース
  - nlp検索
  - 幻想llm

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基本ベクトル検索

ベクトル埋め込みのソートされた順序を記録したインデックスファイルに基づき、近似最近傍（ANN）検索は、受信した検索リクエストに含まれるクエリベクトルを基にベクトル埋め込みのサブセットを特定し、クエリベクトルとサブグループ内のベクトルを比較して最も類似した結果を返します。ANN検索により、Zilliz Cloudは効率的な検索体験を提供します。このページでは、基本的なANN検索の実行方法について学びます。

## 概要\{#overview}

ANNおよびk-最近傍（kNN）検索は、ベクトル類似性検索の一般的な方法です。kNN検索では、検索リクエストに含まれるクエリベクトルとベクトル空間内のすべてのベクトルを比較して最も類似したものを見つける必要がありますが、これは時間とリソースを大量に消費します。

一方、ANN検索アルゴリズムは、ベクトル埋め込みのソートされた順序を記録した**インデックス**ファイルを要求します。検索リクエストが送られてきた際には、インデックスファイルを参照としてクエリベクトルに最も類似したベクトル埋め込みを含みそうなサブグループを迅速に特定できます。その後、指定された**メトリックタイプ**を使用してクエリベクトルとサブグループ内のベクトル間の類似性を測定し、クエリベクトルとの類似性に基づいてグループメンバーをソートし、**top-K**グループメンバーを特定します。

ANN検索は事前に構築されたインデックスに依存しており、選択するインデックスタイプによって検索スループット、メモリ使用量、検索の正確性は異なります。検索パフォーマンスと正確性のバランスを取る必要があります。

学習曲線を減らすために、Zilliz Cloudは**AUTOINDEX**を提供します。**AUTOINDEX**により、Zilliz Cloudはインデックス構築中にコレクション内のデータ分布を分析し、検索パフォーマンスと正確性のバランスを取るための最も最適化されたインデックスパラメータを分析に基づいて設定できます。

AUTOINDEXおよび適用可能なメトリックタイプの詳細については、[AUTOINDEXの説明](./autoindex-explained)および[メトリックタイプ](./search-metrics-explained)を参照してください。このセクションでは、以下のトピックに関する詳細情報を確認できます：

- [シングルベクトル検索](./single-vector-search#single-vector-search)

- [バルクベクトル検索](./single-vector-search#bulk-vector-search)

- [パーティションでのANN検索](./single-vector-search#ann-search-in-partition)

- [出力フィールドの使用](./single-vector-search#use-output-fields)

- [制限とオフセットの使用](./single-vector-search#use-limit-and-offset)

- [レベルの使用](./single-vector-search#use-level)

- [再検出率の取得](./single-vector-search#get-recall-rate)

- [ANN検索の強化](./single-vector-search#enhancing-ann-search)

## シングルベクトル検索\{#single-vector-search}

ANN検索では、シングルベクトル検索とは、1つのクエリベクトルのみを含む検索を指します。事前に構築されたインデックスと検索リクエストに含まれるメトリックタイプに基づき、Zilliz Cloudはクエリベクトルに最も類似したtop-Kベクトルを探し出します。

このセクションでは、シングルベクトル検索の実施方法について学びます。検索リクエストは1つのクエリベクトルを含み、Zilliz Cloudに内積（IP）を使用してクエリベクトルとコレクション内のベクトル間の類似性を計算し、最も類似した3つを返すよう指示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 4. シングルベクトル検索
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
res = client.search(
    collection_name="quick_setup",
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
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .annsField("vector")
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

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}

```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 4. シングルベクトル検索
var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = await client.search({
    collection_name: "quick_setup",
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

Milvusは検索結果を類似性スコアに基づいてクエリベクトルとの距離で降順にランク付けします。類似性スコアはクエリベクトルとの距離とも呼ばれます。その値の範囲は使用するメトリックタイプによって異なります。

以下の表は、適用可能なメトリックタイプと対応する距離範囲を示しています。

<table>
   <tr>
     <th><p>メトリックタイプ</p></th>
     <th><p>特性</p></th>
     <th><p>距離範囲</p></th>
   </tr>
   <tr>
     <td><p><code>L2</code></p></td>
     <td><p>値が小さいほど類似性が高い。</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>値が大きいほど類似性が高い。</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>COSINE</code></p></td>
     <td><p>値が大きいほど類似性が高い。</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>JACCARD</code></p></td>
     <td><p>値が小さいほど類似性が高い。</p></td>
     <td><p>[0, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>HAMMING</code></p></td>
     <td><p>値が小さいほど類似性が高い。</p></td>
     <td><p>[0, dim(vector)]</p></td>
   </tr>
</table>

## バルクベクトル検索\{#bulk-vector-search}

同様に、検索リクエストに複数のクエリベクトルを含めることができます。Zilliz Cloudはクエリベクトルに対して並列にANN検索を実行し、2つの結果セットを返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 7. 複数ベクトルでの検索
# 7.1. クエリベクトルを準備
query_vectors = [
    [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648],
    [0.0039737443, 0.003020432, -0.0006188639, 0.03913546, -0.00089768134]
]

# 7.2. 検索開始
res = client.search(
    collection_name="quick_setup",
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
queryVectors := []entity.Vector{
    entity.FloatVector([]float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}),
    entity.FloatVector([]float32{0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104}),
}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,               // limit
    queryVectors,
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("vector"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 7. 複数ベクトルでの検索
const query_vectors = [
    [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
    [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]
]

res = await client.search({
    collection_name: "quick_setup",
    vectors: query_vectors,
    limit: 3,
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
#     ],
#     "topks":[3]
# }
```

</TabItem>
</Tabs>

## パーティションでのANN検索\{#ann-search-in-partition}

コレクション内に複数のパーティションを作成したとし、検索範囲を特定の数のパーティションに狭められるとします。その場合、検索リクエストにターゲットパーティション名を含めることで、指定されたパーティション内のみで検索範囲を制限できます。検索に関与するパーティションの数を減らすことで検索パフォーマンスが向上します。

以下のコードスニペットでは、コレクション内に**PartitionA**という名前のパーティションがあると仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. シングルベクトル検索
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
res = client.search(
    collection_name="quick_setup",
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
queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithPartitions("partitionA").
    WithANNSField("vector"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. シングルベクトル検索
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
#     ],
#     "topks":[3]
# }
```

</TabItem>
</Tabs>

## 出力フィールドの使用\{#use-output-fields}

検索結果において、Zilliz Cloudはデフォルトでtop-Kベクトル埋め込みを含むエンティティの主キーの値と類似性の距離/スコアを含みます。検索リクエストにターゲットフィールド（ベクトルフィールドとスカラフィールドの両方）の名前を出力フィールドとして含めることで、検索結果にこれらのエンティティの他のフィールドからの値を含めることができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. シングルベクトル検索
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
queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("vector").
    WithOutputFields("color"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("color: ", resultSet.GetColumn("color").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. シングルベクトル検索
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
#     ],
#     "topks":[3]
# }
```

</TabItem>
</Tabs>

## 制限とオフセットの使用\{#use-limit-and-offset}

検索リクエストに含まれる`limit`パラメータは、検索結果に含めるエンティティの数を決定します。このパラメータは、1回の検索で返されるエンティティの最大数を指定し、通常これは**top-K**と呼ばれます。

ページネーションクエリを実行したい場合は、それぞれのクエリリクエストに含まれる**制限**と**オフセット**パラメータを使用して複数の検索要求を送信するループを使用できます。具体的には、**制限**パラメータを現在のクエリ結果に含みたいエンティティの数に設定し、**オフセット**をすでに返されたエンティティの合計数に設定できます。

以下の表は、1回のクエリで100個のエンティティを返す場合のページネーションクエリの**制限**と**オフセット**パラメータの設定方法を説明しています。

<table>
   <tr>
     <th><p>クエリ</p></th>
     <th><p>クエリ毎に返すエンティティ</p></th>
     <th><p>これまでに返されたエンティティ総数</p></th>
   </tr>
   <tr>
     <td><p><strong>1番目の</strong>クエリ</p></td>
     <td><p>100</p></td>
     <td><p>0</p></td>
   </tr>
   <tr>
     <td><p><strong>2番目の</strong>クエリ</p></td>
     <td><p>100</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p><strong>3番目の</strong>クエリ</p></td>
     <td><p>100</p></td>
     <td><p>200</p></td>
   </tr>
   <tr>
     <td><p><strong>n番目の</strong>クエリ</p></td>
     <td><p>100</p></td>
     <td><p>100 × (n-1)</p></td>
   </tr>
</table>

1回のANN検索において、`limit`と`offset`の合計は16,384未満でなければなりません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. シングルベクトル検索
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
queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("vector").
    WithOffset(10))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. シングルベクトル検索
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

## レベルの使用\{#use-level}

ANN検索を最適化するために、Zilliz Cloudは検索精度を制御するパラメータとして`level`を提供し、簡略化された検索最適化で検索を制御します。

このパラメータは`1`から`10`の範囲で、デフォルトは`1`です。値を大きくすると検索再現率が向上しますが、検索パフォーマンスが低下します。一般的な場合、デフォルト値では最大90％の再現率が得られます。必要に応じて値を大きくできます。

<Admonition type="info" icon="📘" title="注釈">

<p><code>level</code>パラメータはまだ<strong>パブリックプレビュー</strong>です。<code>5</code>より大きな値に設定できない場合、クラスターがこの機能を完全にサポートしていない可能性があります。回避策として、代わりに<code>1</code>から<code>5</code>の範囲内の値に設定するか、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にご連絡ください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. シングルベクトル検索
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

<TabItem value='go'>

```go
queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("vector").
    WithSearchParam("level", "10"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. シングルベクトル検索
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

# {"code":0,"cost":0,"data":[{"distance":1,"id":0},{"distance":0.6290165,"id":1},{"distance":0.5975797,"id":4},{"distance":0.9999999,"id":1},{"distance":0.7408552,"id":7},{"distance":0.6290165,"id":0}],"topks":[3]}
```

</TabItem>
</Tabs>

## 再検出率の取得\{#get-recall-rate}

`level`パラメータを調整する際には、`enable_recall_calculation`を`true`に設定することで、異なる`level`値で検索の精度を評価できます。

<Admonition type="info" icon="📘" title="注釈">

<p><code>enable_recall_calculation</code>パラメータはまだ<strong>パブリックプレビュー</strong>であり、互換性の問題により使用できない可能性があります。支援が必要な場合は、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>までお問い合わせください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. シングルベクトル検索
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

<TabItem value='go'>

```go
queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("vector").
    WithSearchParam("enable_recall_calculation", "true"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. シングルベクトル検索
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

# {"code":0,"cost":0,"data":[{"distance":1,"id":0},{"distance":0.6290165,"id":1},{"distance":0.5975797,"id":4},{"distance":0.9999999,"id":1},{"distance":0.7408552,"id":7},{"distance":0.6290165,"id":0}],"topks":[3]}
```

</TabItem>
</Tabs>

## ANN検索の強化\{#enhancing-ann-search}

AUTOINDEXはANN検索の学習曲線を相当平坦にしますが、top-Kが増えるにつれて検索結果が常に正しいとは限りません。検索範囲を狭め、検索結果の関連性を向上させ、検索結果の多様性を持たせることで、Zilliz Cloudは以下の検索強化を実施します。

- フィルター検索

    検索リクエストにフィルタリング条件を含めることで、Zilliz CloudはANN検索の前にメタデータフィルタリングを行い、検索範囲をコレクション全体から指定されたフィルタリング条件に一致するエンティティのみに限定できます。

    メタデータフィルタリングとフィルタリング条件の詳細については、[フィルター検索](./filtered-search)および[フィルタリング](./filtering)を参照してください。

- 範囲検索

    返されたエンティティの距離またはスコアを特定の範囲内に制限することで、検索結果の関連性を改善できます。Zilliz Cloudでは、範囲検索はクエリベクトルに最も類似したベクトル埋め込みを中心に2つの同心円を描画することを含みます。検索リクエストでは両方の円の半径を指定し、Zilliz Cloudは外側の円に含まれるが内側の円には含まれないすべてのベクトル埋め込みを返します。

    範囲検索の詳細については、[範囲検索](./range-search)を参照してください。

- グループ化検索

    返されたエンティティが特定のフィールドで同じ値を持つ場合、検索結果がベクトル空間内のすべてのベクトル埋め込みの分布を表していない可能性があります。検索結果の多様性を持たせるために、グループ化検索の使用をご検討ください。

    グループ化検索の詳細については、[グループ化検索](./grouping-search)を参照してください。

- ハイブリッド検索

    コレクションには、異なる埋め込みモデルを使用して生成されたベクトル埋め込みを保存するために複数のベクトルフィールドを含めることができます。これにより、ハイブリッド検索を使用してこれらのベクトルフィールドの検索結果を再ランク付けし、再検出率を向上させることができます。

    ハイブリッド検索の詳細については、[ハイブリッド検索](./hybrid-search)を参照してください。

    コレクションで許可されるベクトルフィールド数の制限については、[Zilliz Cloudの制限](./limits#fields)を参照してください。

- 検索イテレータ

    1回のANN検索では最大16,384個のエンティティを返します。1回の検索でより多くのエンティティを返す必要がある場合は、検索イテレータの使用をご検討ください。

    検索イテレータの詳細については、[検索イテレータ](./with-iterators)を参照してください。

- 全文検索

    全文検索は、テキストデータセット内の特定の用語や語句を含むドキュメントを検索し、結果を関連性に基づいてランク付けする機能です。この機能は、正確な用語を見逃す可能性のあるセマンティック検索の制限を克服し、最も正確で文脈的に関連性のある結果を受け取ることができます。さらに、生のテキスト入力を受け入れるだけでベクトル検索を簡素化し、手動でベクトル埋め込みを生成する必要なく、テキストデータをスパース埋め込みに自動的に変換します。

    全文検索の詳細については、[全文検索](./full-text-search)を参照してください。

- テキスト一致

    Zilliz Cloudのキーワード一致は、特定の用語に基づいたドキュメントの正確な検索を可能にします。この機能は主に特定の条件を満たすためにフィルター検索で使用され、クエリ結果を絞り込むためにスカラーフフィルタリングを組み込むことができ、スカラー基準を満たすベクトル内で類似性検索を可能にします。

    キーワード一致の詳細については、[キーワード一致](./text-match)を参照してください。

- パーティションキーの使用

    メタデータフィルタリングで複数のスカラーフィールドを使用したり、やや複雑なフィルタリング条件を使用したりすると、検索効率に影響を与える可能性があります。スカラーフィールドをパーティションキーとして設定し、検索リクエストでパーティションキーを含むフィルタリング条件を使用すると、指定されたパーティションキーフ値に対応するパーティション内での検索範囲の制限に役立つ可能性があります。

    パーティションキーの詳細については、[パーティションキーの使用](./use-partition-key)を参照してください。

- mmapの使用

    mmap設定の詳細については、[mmapの使用](./use-mmap)を参照してください。