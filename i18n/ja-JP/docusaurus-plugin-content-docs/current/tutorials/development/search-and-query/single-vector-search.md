---
title: "基本的なベクトル検索 | Cloud"
slug: /single-vector-search
sidebar_label: "基本的なベクトル検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル埋め込みのソート順を記録したインデックスファイルに基づき、Approximate Nearest Neighbor（ANN）検索は、受信した検索リクエストに含まれるクエリベクトルに基づいてベクトル埋め込みのサブセットを特定し、そのサブグループ内のベクトルとクエリベクトルを比較して、最も類似した結果を返します。ANN検索により、Zilliz Cloud は効率的な検索体験を提供します。このページでは、基本的な ANN 検索の実行方法を学べます。 | Cloud"
type: origin
token: BaGlwzDmyiyVvVk6NurcFclInCd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基本的なベクトル検索

ベクトル埋め込みのソート順を記録したインデックスファイルに基づき、Approximate Nearest Neighbor (ANN) 検索は、受信した検索リクエストに含まれるクエリベクトルに基づいてベクトル埋め込みのサブセットを特定し、そのサブグループ内のベクトルとクエリベクトルを比較して、最も類似した結果を返します。ANN 検索により、Zilliz Cloud は効率的な検索体験を提供します。このページでは、基本的な ANN 検索の実行方法を学べます。

<Admonition type="info" icon="📘" title="注意">

collection の作成後に新しいフィールドを追加した場合、それらのフィールドを含む検索では、値が明示的に設定されていない entity に対して、定義されたデフォルト値または `NULL` が返されます。詳細については、[Alter Collection Schema](./add-fields-to-an-existing-collection) を参照してください。

</Admonition>

## 概要\{#overview}

ANN 検索と k-Nearest Neighbors（kNN）検索は、ベクトル類似性検索で一般的に使用される方法です。kNN 検索では、最も類似したベクトルを見つける前に、ベクトル空間内のすべてのベクトルを検索リクエストに含まれるクエリベクトルと比較する必要があるため、時間とリソースを多く消費します。

kNN 検索とは異なり、ANN 検索アルゴリズムでは、ベクトル埋め込みのソート順を記録した **index** ファイルが必要です。検索リクエストが届くと、この index ファイルを参照して、クエリベクトルに最も類似している可能性が高いベクトル埋め込みを含むサブグループをすばやく特定できます。次に、指定された **metric type** を使用してクエリベクトルとサブグループ内のベクトルとの類似度を測定し、クエリベクトルとの類似度に基づいてグループメンバーを並べ替え、**top-K** のグループメンバーを特定できます。

ANN 検索は事前に構築された index に依存しており、選択する index type によって検索スループット、メモリ使用量、検索の正確性が異なる場合があります。検索パフォーマンスと正確性のバランスを取る必要があります。 

学習コストを下げるために、Zilliz Cloud は **AUTOINDEX** を提供しています。**AUTOINDEX** を使用すると、Zilliz Cloud は index の構築中に collection 内のデータ分布を分析し、その分析に基づいて最適化された index パラメータを設定し、検索パフォーマンスと正確性のバランスを取ることができます。 

AUTOINDEX と適用可能な metric type の詳細については、[AUTOINDEX Explained](./autoindex-explained) および [Metric Types](./search-metrics-explained) を参照してください。このセクションでは、次のトピックに関する詳細情報を確認できます。

- [Single-vector search](./single-vector-search#single-vector-search)

- [Bulk-vector search](./single-vector-search#bulk-vector-search)

- [ANN search in partitions](./single-vector-search#ann-search-in-partition)

- [Use output fields](./single-vector-search#use-output-fields)

- [Use limit and offset](./single-vector-search#use-limit-and-offset)

- [Use level](./single-vector-search#use-level)

- [Get Recall Rate](./single-vector-search#get-recall-rate)

- [Enhancing ANN search](./single-vector-search#enhancing-ann-search)

## 単一ベクトル検索\{#single-vector-search}

ANN 検索において、単一ベクトル検索とは 1 つのクエリベクトルのみを含む検索を指します。事前に構築された index と、検索リクエストに含まれる metric type に基づいて、Zilliz Cloud はクエリベクトルに最も類似した top-K ベクトルを見つけます。

このセクションでは、単一ベクトル検索の実行方法を学びます。検索リクエストには 1 つのクエリベクトルが含まれ、Zilliz Cloud に対して Inner Product (IP) を使用してクエリベクトルと collection 内のベクトルとの類似度を計算し、最も類似した 3 件を返すよう要求します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
    collection_name="quick_setup",
    anns_field="vector",
    data=[query_vector],
    limit=3
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

// 4. Single vector search
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("quick_setup")
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>
</Tabs>

Milvus は、検索結果をクエリベクトルとの類似度スコアの降順でランク付けします。類似度スコアはクエリベクトルへの距離とも呼ばれ、その値の範囲は使用する metric type によって異なります。

次の表は、適用可能な metric type と対応する距離の範囲を示しています。

| Metric Type | Characteristics | Distance Range |
| --- | --- | --- |
| `L2` | 値が小さいほど類似度が高いことを示します。 | [0, ∞) |
| `IP` | 値が大きいほど類似度が高いことを示します。 | [-1, 1] |
| `COSINE` | 値が大きいほど類似度が高いことを示します。 | [-1, 1] |
| `JACCARD` | 値が小さいほど類似度が高いことを示します。 | [0, 1] |
| `HAMMING` | 値が小さいほど類似度が高いことを示します。 | [0, dim(vector)] |

## バルクベクトル検索\{#bulk-vector-search}

同様に、複数のクエリベクトルを検索リクエストに含めることもできます。Zilliz Cloud はクエリベクトルに対して並列に ANN 検索を実行し、2 組の結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
// 7. Search with multiple vectors
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
std::vector<std::vector<float>> query_vectors = {
    {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592},
    {0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104}
};
auto request = milvus::SearchRequest()
                   .WithCollectionName("quick_setup")
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .WithFloatVector(std::move(query_vectors));

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>
</Tabs>

## 主キー検索\{#primary-key-search}

クエリベクトルを設定する代わりに、クエリベクトルが対象の collection にすでに存在している場合は、主キーを使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="quick_setup",
    anns_field="vector",
    # highlight-start
    ids=[551, 296, 43],
    # highlight-end
    limit=3
)

for hits in res:
    for hit in hits:
        print(hit)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "quick_setup",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3
  }'
```

</TabItem>
</Tabs>

## パーティション内の ANN 検索\{#ann-search-in-partition}

collection に複数の partition を作成している場合、検索範囲を特定の数の partition に絞り込めます。その場合、検索リクエストに対象の partition 名を含めることで、指定した partition 内に検索範囲を制限できます。検索に関与する partition の数を減らすことで、検索パフォーマンスが向上します。

以下のコードスニペットでは、collection に **PartitionA** という名前の partition があることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("quick_setup")
                   .AddPartitionName("partitionA")
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>
</Tabs>

## 出力フィールドの使用\{#use-output-fields}

検索結果では、Zilliz Cloud はデフォルトで、上位 K 件の vector embedding を含む entity の主フィールド値と類似度 distance/score を返します。これらの entity にある他のフィールドの値も検索結果に含めたい場合は、検索リクエストの output fields として、vector フィールドと scalar フィールドの両方を含む対象フィールド名を指定できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("quick_setup")
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .AddOutputField("color")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>
</Tabs>

## スカラー フィールドによる検索結果の並べ替え | ONDEMAND\{#sort-search-results-by-scalar-fields}

デフォルトでは、Zilliz Cloud は検索結果をクエリベクトルに対する類似度スコアで並べます。返される entity を scalar フィールドの順序に従わせたい場合は、検索リクエストに `order_by_fields` を追加します。

`order_by_fields` の各項目では、scalar フィールドと並べ替え方向を指定します。昇順には `"asc"`、降順には `"desc"` を使用します。`order` を省略した場合、Zilliz Cloud はそのフィールドを昇順で並べ替えます。

以下の例では、検索結果を `price` の低い順に並べ替えます。レスポンス内でフィールド値を確認したい場合は、並べ替え対象フィールドを `output_fields` に含めてください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="product_catalog",
    data=query_vectors,
    anns_field="embedding",
    limit=20,
    output_fields=["id", "price", "rating", "category"],
    # highlight-start
    order_by_fields=[
        {"field": "price", "order": "asc"}
    ],
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

複数の scalar フィールドで並べ替えることもできます。Zilliz Cloud は、指定した順序でフィールドを適用します。以下の例では、まず `price` を昇順で並べ替えます。`price` が同じ entity については、次に `rating` を降順で並べ替えます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="product_catalog",
    data=query_vectors,
    anns_field="embedding",
    limit=20,
    output_fields=["id", "price", "rating", "category"],
    # highlight-start
    order_by_fields=[
        {"field": "price", "order": "asc"},
        {"field": "rating", "order": "desc"},
    ],
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

指定したすべての order-by フィールドの値が同じ entity については、Zilliz Cloud は元の類似度スコア順を維持します。

## Limit と Offset を使用する\{#use-limit-and-offset}

検索リクエストに含まれるパラメータ `limit` が、検索結果に含める entity の数を決定していることに気付くかもしれません。このパラメータは、1 回の検索で返す entity の最大数を指定するもので、通常は **top-K** と呼ばれます。

ページネーション付きクエリを実行したい場合は、ループを使って複数の Search リクエストを送信し、各クエリリクエストに **Limit** と **Offset** パラメータを含めることができます。具体的には、**Limit** パラメータを現在のクエリ結果に含めたい Entities の数に設定し、**Offset** を、すでに返された Entities の総数に設定します。

以下の表は、1 回あたり 100 Entities を返す場合に、ページネーション付きクエリで **Limit** と **Offset** パラメータをどのように設定するかを示しています。

| クエリ | クエリごとに返す Entities | すでに返された Entities の総数 |
| --- | --- | --- |
| **1 回目** のクエリ | 100 | 0 |
| **2 回目** のクエリ | 100 | 100 |
| **3 回目** のクエリ | 100 | 200 |
| **n 回目** のクエリ | 100 | 100 x (n-1) |

なお、1 回の ANN 検索における `limit` と `offset` の合計は 16,384 未満である必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("quick_setup")
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .WithOffset(10)
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>
</Tabs>

## Level を使用する\{#use-level}

ANN 検索を最適化するために、Zilliz Cloud では `level` というパラメータを提供しており、簡易的な検索最適化によって検索精度を制御できます。

このパラメータの範囲は `1` から `10` で、デフォルトは `1` です。値を大きくすると検索の再現率は向上しますが、その代わりに検索パフォーマンスは低下します。一般的なケースでは、デフォルト値で最大 90% の再現率が得られます。必要に応じて値を上げてください。

<Admonition type="info" icon="📘" title="注意">

`level` パラメータは現在も **Public Preview** です。`5` より大きい値に設定できない場合は、使用中の cluster がこの機能を完全にはサポートしていない可能性があります。回避策としては、`1` から `5` の範囲の値を設定するか、[Zilliz Cloud support](https://zilliz.com/contact-sales) にお問い合わせください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("quick_setup")
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .AddFloatVector(query_vector)
                   .AddExtraParam("level", "10");

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>
</Tabs>

## Recall Rate を取得する\{#get-recall-rate}

`level` パラメータを調整するときに `enable_recall_calculation` を `true` に設定すると、異なる `level` 値での検索精度を評価できます。

<Admonition type="info" icon="📘" title="注意">

`enable_recall_calculation` パラメータは現在も **Public Preview** であり、互換性の問題により使用できない場合があります。サポートが必要な場合は、[Zilliz Cloud support](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("quick_setup")
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .AddFloatVector(query_vector)
                   .AddExtraParam("level", "10")
                   .AddExtraParam("enable_recall_calculation", "true");

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>
</Tabs>

## 検索に対して一時的にタイムゾーンを設定する\{#temporarily-set-a-timezone-for-a-search}

collection に `TIMESTAMPTZ` フィールドがある場合、検索呼び出しで `timezone` パラメータを設定することで、単一の操作に対して database または collection のデフォルトタイムゾーンを一時的に上書きできます。これにより、その操作中に `TIMESTAMPTZ` の値がどのように表示および比較されるかを制御できます。

`timezone` の値は、有効な [IANA time zone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) である必要があります（例: **Asia/Shanghai**、**America/Chicago**、**UTC**）。`TIMESTAMPTZ` フィールドの使用方法の詳細については、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

以下の例は、検索操作に対して一時的にタイムゾーンを設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="quick_setup",
    anns_field="vector",
    data=[query_vector],
    limit=3,
    # highlight-next-line
    timezone="America/Havana",
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export QUERY_VECTOR='[0.1, 0.2, 0.3, 0.4]'                                                                                                                                                                                                              
                                                                                                                                                                                                                                                          
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \                                                                                                                                                                                     
-H "Content-Type: application/json" \  
-H "Request-Timeout: 10" \                                                                                                                                                                                                               
-d '{                                                                                                                                                                                                                                                 
  "collectionName": "quick_setup",                                                                                                                                                                                                                    
  "annsField": "vector",                                                                                                                                                                                                                              
  "data": ['"$QUERY_VECTOR"'],                                                                                                                                                                                                                        
  "limit": 3,                                                                                                                                                                                                                                         
  "searchParams": {                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    "timezone": "America/Havana"                                                                                                                                                                                                                      
  }                                                                                                                                                                                                                                                   
}'
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("quick_setup")
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .AddFloatVector(query_vector)
                   .WithMetricType(milvus::MetricType::IP)
                   .WithTimezone("America/Havana");

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## ANN Search の強化\{#enhancing-ann-search}

AUTOINDEX は ANN Search の学習ハードルを大幅に下げます。しかし、top-K が増加すると、検索結果が常に正しいとは限りません。検索範囲を狭め、検索結果の関連性を高め、検索結果を多様化することで、Zilliz Cloud は以下の検索強化機能を提供します。

- Filtered Search

    検索リクエストにフィルタリング条件を含めることで、Zilliz Cloud は ANN Search を実行する前に metadata filtering を実施し、検索範囲を collection 全体から、指定されたフィルタリング条件に一致する entities のみに絞り込めます。

    metadata filtering とフィルタリング条件の詳細については、[Filtered Search](./filtered-search) および [Filtering Explained](./filtering-overview) を参照してください。

- Range Search

    返される entities の距離またはスコアを特定の範囲内に制限することで、検索結果の関連性を向上させることができます。Zilliz Cloud では、range search は、クエリ vector に最も類似した vector embedding を中心として 2 つの同心円を描く形で行われます。検索リクエストでは両方の円の半径を指定し、Zilliz Cloud は外側の円の内側かつ内側の円の外側にあるすべての vector embeddings を返します。

    range search の詳細については、[Range Search](./range-search) を参照してください。

- Grouping Search

    返された entities が特定のフィールドで同じ値を持つ場合、検索結果は vector space 内のすべての vector embeddings の分布を表していない可能性があります。検索結果を多様化するには、grouping search の使用を検討してください。

    grouping search の詳細については、[Grouping Search](./grouping-search) を参照してください。

- Hybrid Search

    collection には、異なる embedding model を使用して生成された vector embeddings を保存するために、複数の vector fields を含めることができます。これにより、hybrid search を使用してこれらの vector fields からの検索結果を rerank し、recall rate を向上させることができます。

    hybrid search の詳細については、[Hybrid Search](./hybrid-search) を参照してください。

    collection で許可される vector fields の数の制限の詳細については、[Zilliz Cloud Limits](./limits#fields) を参照してください。

- Search Iterator

    1 回の ANN Search で返される entities の最大数は 16,384 です。1 回の検索でさらに多くの entities を返す必要がある場合は、search iterators の使用を検討してください。

    search iterators の詳細については、[Search Iterator](./with-iterators) を参照してください。

- Full-Text Search

    full text search は、テキストデータセット内で特定の用語やフレーズを含むドキュメントを取得し、その後関連性に基づいて結果をランク付けする機能です。この機能は semantic search の制限を補い、正確な用語が見落とされる可能性を回避して、より正確で文脈に即した結果を得られるようにします。さらに、生のテキスト入力を受け付け、テキストデータを自動的に sparse embeddings に変換することで、手動で vector embeddings を生成する必要をなくし、vector search を簡素化します。

    full-text search の詳細については、[Full Text Search](./full-text-search) を参照してください。

- Text Match

    Zilliz Cloud の keyword match は、特定の用語に基づいて正確なドキュメント取得を可能にします。この機能は主に filtered search で特定の条件を満たすために使用され、scalar filtering を組み合わせてクエリ結果を絞り込み、scalar 条件を満たす vectors に対する類似検索を可能にします。

    keyword match の詳細については、[Keyword Match](./text-match) を参照してください。

- Use Partition Key

    metadata filtering に複数の scalar fields を含め、かなり複雑なフィルタリング条件を使用すると、検索効率に影響する可能性があります。scalar field を partition key として設定し、検索リクエストで partition key を含むフィルタリング条件を使用すると、指定した partition key の値に対応する partitions 内に検索範囲を制限するのに役立ちます。 

    partition key の詳細については、[Use Partition Key](./use-partition-key) を参照してください。

- Use mmap

    mmap-settings の詳細については、[Use mmap](./use-mmap) を参照してください。

