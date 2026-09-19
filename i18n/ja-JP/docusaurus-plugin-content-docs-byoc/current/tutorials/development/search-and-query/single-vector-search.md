---
title: "基本ベクトル検索 | BYOC"
slug: /single-vector-search
sidebar_label: "基本ベクトル検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル埋め込みのソート順を記録したインデックスファイルに基づき、近似最近傍探索（ANN search）は、受信した検索リクエストに含まれるクエリベクトルに基づいてベクトル埋め込みのサブセットを特定し、そのサブグループ内のベクトルとクエリベクトルを比較して、最も類似した結果を返します。ANN search により、Zilliz Cloud は効率的な検索体験を提供します。このページでは、基本的な ANN search の実行方法を学べます。 | BYOC"
type: origin
token: BaGlwzDmyiyVvVk6NurcFclInCd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基本ベクトル検索

ベクトル埋め込みのソート順を記録したインデックスファイルに基づき、近似最近傍探索（ANN search）は、受信した検索リクエストに含まれるクエリベクトルに基づいてベクトル埋め込みのサブセットを特定し、そのサブグループ内のベクトルとクエリベクトルを比較して、最も類似した結果を返します。ANN search により、Zilliz Cloud は効率的な検索体験を提供します。このページでは、基本的な ANN search の実行方法を学べます。

<Admonition type="info" title="Notes">

コレクションの作成後に新しいフィールドを追加した場合、これらのフィールドを含む検索では、明示的に値を設定していないエンティティに対して、定義済みのデフォルト値または `NULL` が返されます。詳細については、[コレクション スキーマの変更](./add-fields-to-an-existing-collection) を参照してください。

</Admonition>

## 概要\{#overview}

ANN search と k-Nearest Neighbors（kNN）search は、ベクトル類似検索で一般的に使用される手法です。kNN search では、最も類似したベクトルを特定する前に、検索リクエストに含まれるクエリベクトルとベクトル空間内のすべてのベクトルを比較する必要があるため、時間とリソースを消費します。

kNN search とは異なり、ANN search アルゴリズムでは、ベクトル埋め込みのソート順を記録した **インデックス**ファイルが必要です。検索リクエストを受信すると、このインデックスファイルを参照して、クエリベクトルに最も類似したベクトル埋め込みを含む可能性が高いサブグループをすばやく特定できます。次に、指定された **メトリックタイプ** を使用してクエリベクトルとサブグループ内のベクトルとの類似度を測定し、クエリベクトルとの類似度に基づいてグループのメンバーを並べ替え、**top-K** のグループメンバーを特定できます。

ANN search は事前に構築されたインデックスに依存しており、検索スループット、メモリ使用量、検索の正確性は、選択するインデックスタイプによって異なる場合があります。検索パフォーマンスと正確性のバランスを取る必要があります。

学習コストを下げるために、Zilliz Cloud は **AUTOINDEX** を提供しています。**AUTOINDEX** を使用すると、Zilliz Cloud はインデックスの構築中にコレクション内のデータ分布を分析し、その分析に基づいて最適化されたインデックスパラメータを設定して、検索パフォーマンスと正確性のバランスを取ります。

AUTOINDEX と適用可能なメトリックタイプの詳細については、[AUTOINDEX の解説](./autoindex-explained) および [メトリックタイプ](./search-metrics-explained) を参照してください。このセクションでは、以下のトピックに関する詳細情報を確認できます。

- [単一ベクトル検索](./single-vector-search#single-vector-search)

- [バルクベクトル検索](./single-vector-search#bulk-vector-search)

- [パーティション内での ANN search](./single-vector-search#ann-search-in-partition)

- [出力フィールドの使用](./single-vector-search#use-output-fields)

- [limit と offset の使用](./single-vector-search#use-limit-and-offset)

- [level の使用](./single-vector-search#use-level)

- [再現率の取得](./single-vector-search#get-recall-rate)

- [ANN Search の強化](./single-vector-search#enhancing-ann-search)

## 単一ベクトル検索\{#single-vector-search}

ANN search において、単一ベクトル検索とは、1 つのクエリベクトルのみを対象とする検索を指します。事前に構築されたインデックスと検索リクエストに含まれるメトリックタイプに基づいて、Zilliz Cloud はクエリベクトルに最も類似した top-K 個のベクトルを検索します。

このセクションでは、単一ベクトル検索の実行方法について説明します。検索リクエストには 1 つのクエリベクトルを含め、Zilliz Cloud に対して Inner Product（IP）を使用してクエリベクトルとコレクション内のベクトルとの類似度を計算するよう指示すると、最も類似した 3 件が返されます。

<Admonition type="info" title="Notes">

データプレーン RESTful API エンドポイントを呼び出す際は、対象クラスターのユーザー名とパスワードをコロンで区切った文字列（例: `username:password`）を認証トークンとして使用します。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
#include <iostream>
#include <vector>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cerr << "Failed to connect: " << status.Message() << std::endl;
    return;
}

std::vector<float> queryVector = {
    0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F
};

auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("quick_setup")
                         .WithAnnsField("vector")
                         .WithLimit(3)
                         .WithMetricType(milvus::MetricType::IP)
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i] << ", score=" << result.Scores()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.3580376395471989,
      -0.6023495712049978,
      0.18414012509913835,
      -0.26286205330961354,
      0.9029438446296592
    ]
  ],
  "annsField": "vector",
  "limit": 3
}' \
  --output json
```

</TabItem>
</Tabs>

Milvus は、検索結果をクエリベクトルとの類似度スコアの降順で並べ替えます。この類似度スコアはクエリベクトルへの距離とも呼ばれ、その値の範囲は使用するメトリックタイプによって異なります。

以下の表に、適用可能なメトリックタイプと対応する距離の範囲を示します。

| メトリックタイプ | 特性 | 距離の範囲 |
| --- | --- | --- |
| `L2` | 値が小さいほど類似度が高くなります。 | [0, ∞) |
| `IP` | 値が大きいほど類似度が高くなります。 | [-1, 1] |
| `COSINE` | 値が大きいほど類似度が高くなります。 | [-1, 1] |
| `JACCARD` | 値が小さいほど類似度が高くなります。 | [0, 1] |
| `HAMMING` | 値が小さいほど類似度が高くなります。 | [0, dim(vector)] |

## バルクベクトル検索\{#bulk-vector-search}

同様に、検索リクエストには複数のクエリベクトルを含めることができます。Zilliz Cloud は、これらのクエリベクトルに対して ANN search を並列に実行し、2 組の結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
std::vector<std::vector<float>> queryVectors = {
    {0.041732933F, 0.013779674F, -0.027564144F, -0.013061441F, 0.009748648F},
    {0.0039737443F, 0.003020432F, -0.0006188639F, 0.03913546F, -0.00089768134F},
};

auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("quick_setup")
                         .WithAnnsField("vector")
                         .WithLimit(3)
                         .WithFloatVectors(std::move(queryVectors));

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    const auto ids = result.Ids().IntIDArray();
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i] << ", score=" << result.Scores()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.041732933,
      0.013779674,
      -0.027564144,
      -0.013061441,
      0.009748648
    ],
    [
      0.0039737443,
      0.003020432,
      -0.0006188639,
      0.03913546,
      -0.00089768134
    ]
  ],
  "annsField": "vector",
  "limit": 3
}' \
  --output json
```

</TabItem>
</Tabs>

## 主キー検索\{#primary-key-search}

クエリベクトルを設定する代わりに、対象のコレクションにクエリベクトルがすでに存在する場合は、主キーを使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;

SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .annsField("vector")
        // highlight-start
        .ids(Arrays.<Object>asList(551L, 296L, 43L))
        // highlight-end
        .limit(3)
        .metricType(IndexParam.MetricType.IP)
        .build();

SearchResp searchResp = client.search(searchReq);
System.out.println(searchResp.getSearchResults());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "quick_setup",
    anns_field: "vector",
    // highlight-start
    ids: [551, 296, 43],
    // highlight-end
    limit: 3,
    metric_type: "IP",
})

console.log(res.results)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

queryIDs := column.NewColumnInt64("id", []int64{551, 296, 43})
resultSets, err := client.Search(ctx, milvusclient.NewSearchByIDsOption(
    "quick_setup", // collectionName
    3,             // limit
    queryIDs,
).WithANNSField("vector").
    WithSearchParam("metric_type", "IP"))
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

<TabItem value='c++'>

```c++
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("quick_setup")
                         .WithAnnsField("vector")
                         // highlight-start
                         .WithIDs({551, 296, 43})
                         // highlight-end
                         .WithLimit(3)
                         .WithMetricType(milvus::MetricType::IP);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i] << ", score=" << result.Scores()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --data '[]' \
  --body '{
  "ids": [
    1,
    2,
    3
  ],
  "annsField": "vector",
  "limit": 3
}' \
  --output json
```

</TabItem>
</Tabs>

## パーティション内での ANN Search\{#ann-search-in-partition}

コレクションに複数のパーティションを作成しており、検索範囲を特定の数のパーティションに絞り込める状況を想定します。その場合は、検索リクエストに対象のパーティション名を含めることで、検索範囲を指定したパーティション内に制限できます。検索対象のパーティション数を減らすと、検索パフォーマンスが向上します。

以下のコードスニペットは、コレクション内に **PartitionA** という名前のパーティションが存在することを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("quick_setup")
                         .WithAnnsField("vector")
                         // highlight-next-line
                         .AddPartitionName("partitionA")
                         .WithLimit(3)
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i] << ", score=" << result.Scores()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.3580376395471989,
      -0.6023495712049978,
      0.18414012509913835,
      -0.26286205330961354,
      0.9029438446296592
    ]
  ],
  "annsField": "vector",
  "partitionNames": [
    "partitionA"
  ],
  "limit": 3
}' \
  --output json
```

</TabItem>
</Tabs>

## 出力フィールドの使用\{#use-output-fields}

検索結果では、Zilliz Cloud はデフォルトで、上位 K 個のベクトル埋め込みを含むエンティティの主フィールド値と類似度スコア（distance/scores）を含めます。検索結果にこれらのエンティティの他のフィールドの値も含めるには、ベクトルフィールドとスカラーフィールドの両方を含む対象フィールドの名前を、出力フィールドとして検索リクエストに含めます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("quick_setup")
                         .WithAnnsField("vector")
                         .WithLimit(3)
                         .WithMetricType(milvus::MetricType::IP)
                         // highlight-next-line
                         .AddOutputField("color")
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    const auto colors = result.OutputField<milvus::VarCharFieldData>("color");
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i] << ", score=" << result.Scores()[i]
                  << ", color=" << colors->Data()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.3580376395471989,
      -0.6023495712049978,
      0.18414012509913835,
      -0.26286205330961354,
      0.9029438446296592
    ]
  ],
  "annsField": "vector",
  "outputFields": [
    "color"
  ],
  "limit": 3
}' \
  --output json
```

</TabItem>
</Tabs>

## スカラーフィールドで検索結果を並べ替える | ONDEMAND\{#sort-search-results-by-scalar-fields}

デフォルトでは、Zilliz Cloud は検索結果をクエリベクトルとの類似度スコア順に並べ替えます。返されるエンティティをスカラーフィールドの順序に従わせたい場合は、検索リクエストに `order_by_fields` を追加します。

`order_by_fields` の各項目は、スカラーフィールドと並べ替え方向を指定します。昇順には `"asc"`、降順には `"desc"` を使用します。`order` を省略した場合、Zilliz Cloud はそのフィールドを昇順で並べ替えます。

以下の例では、検索結果を `price` の低い順から高い順に並べ替えます。レスポンスでフィールドの値を確認したい場合は、並べ替えに使用するフィールドを `output_fields` に含めてください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.aggregation.AggDirection;
import io.milvus.v2.service.vector.request.aggregation.OrderByField;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

FloatVec queryVector = new FloatVec(new float[]{0.35803764f, -0.6023496f, 0.18414013f, -0.26286206f, 0.90294385f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("product_catalog")
        .data(Collections.singletonList(queryVector))
        .annsField("embedding")
        .limit(20)
        .outputFields(Arrays.asList("id", "price", "rating", "category"))
        // highlight-start
        .orderByFields(Collections.singletonList(
                OrderByField.builder()
                        .fieldName("price")
                        .direction(AggDirection.ASC)
                        .build()
        ))
        // highlight-end
        .build();

SearchResp searchResp = client.search(searchReq);
System.out.println(searchResp.getSearchResults());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "product_catalog",
    data: query_vector,
    anns_field: "embedding",
    limit: 20,
    output_fields: ["id", "price", "rating", "category"],
    // highlight-start
    order_by_fields: [
        { field: "price", order: "asc" }
    ],
    // highlight-end
})

console.log(res.results)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

queryVector := []float32{0.35803764, -0.6023496, 0.18414013, -0.26286206, 0.90294385}
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "product_catalog", // collectionName
    20,                // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithOutputFields("id", "price", "rating", "category").
    WithSearchParam("order_by_fields", "price:asc"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Prices: ", resultSet.GetColumn("price").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("product_catalog")
                         .WithAnnsField("embedding")
                         .WithLimit(20)
                         .WithOutputFields({"id", "price", "rating", "category"})
                         // highlight-start
                         .AddOrderByField(milvus::OrderByField(
                             "price", milvus::AggregationDirection::ASC))
                         // highlight-end
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    const auto prices = result.OutputField<milvus::Int64FieldData>("price");
    for (size_t i = 0; i < result.GetRowCount(); ++i) {
        std::cout << "id=" << ids[i] << ", price=" << prices->Data()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.3580376395471989,
      -0.6023495712049978,
      0.18414012509913835,
      -0.26286205330961354,
      0.9029438446296592
    ]
  ],
  "annsField": "vector",
  "outputFields": [
    "price"
  ],
  "orderByFields": [
    "price:asc"
  ],
  "limit": 3
}' \
  --output json
```

</TabItem>
</Tabs>

複数のスカラーフィールドで並べ替えることもできます。Zilliz Cloud は、指定した順序でフィールドを適用します。以下の例では、Zilliz Cloud は結果を `price` の昇順で並べ替えます。同じ `price` を持つエンティティについては、Zilliz Cloud は続いて `rating` の降順で並べ替えます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.aggregation.AggDirection;
import io.milvus.v2.service.vector.request.aggregation.OrderByField;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

FloatVec queryVector = new FloatVec(new float[]{0.35803764f, -0.6023496f, 0.18414013f, -0.26286206f, 0.90294385f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("product_catalog")
        .data(Collections.singletonList(queryVector))
        .annsField("embedding")
        .limit(20)
        .outputFields(Arrays.asList("id", "price", "rating", "category"))
        // highlight-start
        .orderByFields(Arrays.asList(
                OrderByField.builder()
                        .fieldName("price")
                        .direction(AggDirection.ASC)
                        .build(),
                OrderByField.builder()
                        .fieldName("rating")
                        .direction(AggDirection.DESC)
                        .build()
        ))
        // highlight-end
        .build();

SearchResp searchResp = client.search(searchReq);
System.out.println(searchResp.getSearchResults());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "product_catalog",
    data: query_vector,
    anns_field: "embedding",
    limit: 20,
    output_fields: ["id", "price", "rating", "category"],
    // highlight-start
    order_by_fields: [
        { field: "price", order: "asc" },
        { field: "rating", order: "desc" },
    ],
    // highlight-end
})

console.log(res.results)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

queryVector := []float32{0.35803764, -0.6023496, 0.18414013, -0.26286206, 0.90294385}
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "product_catalog", // collectionName
    20,                // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithOutputFields("id", "price", "rating", "category").
    WithSearchParam("order_by_fields", "price:asc,rating:desc"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Prices: ", resultSet.GetColumn("price").FieldData().GetScalars())
    fmt.Println("Ratings: ", resultSet.GetColumn("rating").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("product_catalog")
                         .WithAnnsField("embedding")
                         .WithLimit(20)
                         .WithOutputFields({"id", "price", "rating", "category"})
                         // highlight-start
                         .WithOrderByFields({
                             milvus::OrderByField("price", milvus::AggregationDirection::ASC),
                             milvus::OrderByField("rating", milvus::AggregationDirection::DESC),
                         })
                         // highlight-end
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    const auto prices = result.OutputField<milvus::Int64FieldData>("price");
    const auto ratings = result.OutputField<milvus::DoubleFieldData>("rating");
    for (size_t i = 0; i < result.GetRowCount(); ++i) {
        std::cout << "id=" << ids[i] << ", price=" << prices->Data()[i]
                  << ", rating=" << ratings->Data()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.3580376395471989,
      -0.6023495712049978,
      0.18414012509913835,
      -0.26286205330961354,
      0.9029438446296592
    ]
  ],
  "annsField": "vector",
  "outputFields": [
    "price",
    "rating"
  ],
  "orderByFields": [
    "price:asc",
    "rating:desc"
  ],
  "limit": 3
}' \
  --output json
```

</TabItem>
</Tabs>

指定したすべての並べ替えフィールドで同じ値を持つエンティティについては、Zilliz Cloud は元の類似度スコア順を維持します。

## limit と offset の使用\{#use-limit-and-offset}

検索リクエストに含まれる `limit` パラメータが、検索結果に含めるエンティティ数を決定することに気付くかもしれません。このパラメータは、1 回の検索で返すエンティティの最大数を指定するものであり、通常 **top-K** と呼ばれます。

ページネーションされたクエリを実行する場合は、ループを使用して複数の Search リクエストを送信し、各クエリリクエストに **Limit** パラメータと **Offset** パラメータを含めます。具体的には、**Limit** パラメータに現在のクエリ結果に含めたいエンティティ数を設定し、**Offset** にすでに返されたエンティティの合計数を設定します。

以下の表に、一度に 100 個のエンティティを返す場合の、ページネーションされたクエリにおける **Limit** パラメータと **Offset** パラメータの設定方法を示します。

| クエリ | 1 回のクエリで返すエンティティ数 | すでに返されたエンティティの合計数 |
| --- | --- | --- |
| **1 回目**のクエリ | 100 | 0 |
| **2 回目**のクエリ | 100 | 100 |
| **3 回目**のクエリ | 100 | 200 |
| **n 回目**のクエリ | 100 | 100 x (n-1) |

1 回の ANN search における `limit` と `offset` の合計は 16,384 未満にする必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("quick_setup")
                         .WithAnnsField("vector")
                         .WithLimit(3)
                         // highlight-next-line
                         .WithOffset(10)
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i] << ", score=" << result.Scores()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.3580376395471989,
      -0.6023495712049978,
      0.18414012509913835,
      -0.26286205330961354,
      0.9029438446296592
    ]
  ],
  "annsField": "vector",
  "limit": 3,
  "offset": 3
}' \
  --output json
```

</TabItem>
</Tabs>

## level の使用\{#use-level}

ANN search を最適化するために、Zilliz Cloud は、簡素化された検索最適化によって検索精度を制御する `level` というパラメータを提供しています。

このパラメータは `1` から `10` の範囲で、デフォルトは `1` です。値を大きくすると検索の再現率は向上しますが、検索パフォーマンスは低下します。一般的なケースでは、デフォルト値で最大 90% の再現率が得られます。必要に応じて値を大きくしてください。

<Admonition type="info" title="Notes">

`level` パラメータは現在も **Public Preview** です。`5` より大きい値を設定できない場合、お使いのクラスターがこの機能に完全には対応していない可能性があります。回避策として、代わりに `1` から `5` までの範囲の値を設定するか、[Zilliz Cloud support](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.3580376395471989,
      -0.6023495712049978,
      0.18414012509913835,
      -0.26286205330961354,
      0.9029438446296592
    ]
  ],
  "annsField": "vector",
  "searchParams": {
    "level": 10
  },
  "limit": 3
}' \
  --output json
```

</TabItem>
</Tabs>

## 再現率の取得\{#get-recall-rate}

`level` パラメータを調整する際に `enable_recall_calculation` を `true` に設定すると、異なる `level` 値での検索の精度を評価できます。

<Admonition type="info" title="Notes">

`enable_recall_calculation` パラメータは現在も **Public Preview** であり、互換性の問題により使用できない場合があります。サポートが必要な場合は、[Zilliz Cloud support](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='shell'>

```shell
# Zilliz CLI
# Recall-rate metadata is not currently exposed by the CLI.
```

</TabItem>
</Tabs>

## 検索に対して一時的にタイムゾーンを設定する\{#temporarily-set-a-timezone-for-a-search}

コレクションに `TIMESTAMPTZ` フィールドがある場合、検索呼び出しで `timezone` パラメータを設定することで、1 回の操作に限りデータベースまたはコレクションのデフォルトのタイムゾーンを一時的に上書きできます。これは、操作中に `TIMESTAMPTZ` 値がどのように表示および比較されるかを制御します。

`timezone` の値は、有効な [IANA time zone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) である必要があります（例: **Asia/Shanghai**, **America/Chicago**, または **UTC**）。`TIMESTAMPTZ` フィールドの使用方法の詳細については、[TIMESTAMPTZ フィールド](./use-timestamptz-field) を参照してください。

以下の例では、検索操作のタイムゾーンを一時的に設定する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Collections;

FloatVec queryVector = new FloatVec(new float[]{0.35803764f, -0.6023496f, 0.18414013f, -0.26286206f, 0.90294385f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .annsField("vector")
        .data(Collections.singletonList(queryVector))
        .limit(3)
        .metricType(IndexParam.MetricType.IP)
        // highlight-next-line
        .timezone("America/Havana")
        .build();

SearchResp searchResp = client.search(searchReq);
System.out.println(searchResp.getSearchResults());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "quick_setup",
    anns_field: "vector",
    data: query_vector,
    limit: 3,
    metric_type: "IP",
    // highlight-next-line
    params: { timezone: "America/Havana" },
})

console.log(res.results)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

queryVector := []float32{0.35803764, -0.6023496, 0.18414013, -0.26286206, 0.90294385}
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,             // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector").
    WithSearchParam("metric_type", "IP").
    WithOutputFields("event_time").
    WithSearchParam("timezone", "America/Havana"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Event times: ", resultSet.GetColumn("event_time").FieldData().GetScalars())
}
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
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("quick_setup")
                         .WithAnnsField("vector")
                         .WithLimit(3)
                         .WithMetricType(milvus::MetricType::IP)
                         .AddOutputField("event_time")
                         // highlight-next-line
                         .WithTimezone("America/Havana")
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    const auto eventTimes = result.OutputField<milvus::TimestamptzFieldData>("event_time");
    for (size_t i = 0; i < result.GetRowCount(); ++i) {
        std::cout << "id=" << ids[i] << ", event_time=" << eventTimes->Data()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.3580376395471989,
      -0.6023495712049978,
      0.18414012509913835,
      -0.26286205330961354,
      0.9029438446296592
    ]
  ],
  "annsField": "vector",
  "outputFields": [
    "event_time"
  ],
  "timezone": "America/Havana",
  "limit": 3
}' \
  --output json
```

</TabItem>
</Tabs>

## ANN Search の強化\{#enhancing-ann-search}

AUTOINDEX は ANN search の学習コストを大幅に軽減します。ただし、top-K が大きくなるにつれて、検索結果が常に正確であるとは限りません。検索範囲の絞り込み、検索結果の関連性の向上、検索結果の多様化によって、Zilliz Cloud は以下の検索拡張機能を実現します。

- フィルタリング検索

    検索リクエストにフィルタリング条件を含めることで、Zilliz Cloud は ANN search を実行する前にメタデータのフィルタリングを行い、検索範囲をコレクション全体から指定したフィルタリング条件に一致するエンティティのみに絞り込めます。

    メタデータのフィルタリングとフィルタリング条件の詳細については、[Filtered Search](./filtered-search) および [フィルタリングの解説](./filtering-overview) を参照してください。

- 範囲検索

    返されるエンティティの距離またはスコアを特定の範囲内に制限することで、検索結果の関連性を向上できます。Zilliz Cloud のレンジ検索では、クエリベクトルに最も類似したベクトル埋め込みを中心とする 2 つの同心円を描きます。検索リクエストで両方の円の半径を指定すると、Zilliz Cloud は外側の円の内側で内側の円の外側にあるすべてのベクトル埋め込みを返します。

    レンジ検索の詳細については、[範囲検索](./range-search) を参照してください。

- グループ検索

    返されるエンティティが特定のフィールドで同じ値を持つ場合、検索結果がベクトル空間内のすべてのベクトル埋め込みの分布を表さないことがあります。検索結果を多様化するには、グループ検索の使用を検討してください。

    グループ検索の詳細については、[Grouping Search](./grouping-search) を参照してください。

- ハイブリッド検索

    コレクションには、異なる埋め込みモデルを使用して生成されたベクトル埋め込みを保存するために、複数のベクトルフィールドを含めることができます。そうすることで、ハイブリッド検索を使用してこれらのベクトルフィールドからの検索結果を再ランク付けし、再現率を向上させることができます。

    ハイブリッド検索の詳細については、[ハイブリッド検索](./hybrid-search) を参照してください。

    コレクションで許可されるベクトルフィールド数の制限の詳細については、[Zilliz Cloud の制限](./limits#fields) を参照してください。

- 検索イテレーター

    1 回の ANN search で返されるエンティティの最大数は 16,384 です。1 回の検索でより多くのエンティティを返す必要がある場合は、検索イテレーターの使用を検討してください。

    検索イテレーターの詳細については、[Search Iterator](./with-iterators) を参照してください。

- 全文検索

    全文検索は、テキストデータセット内で特定の用語やフレーズを含むドキュメントを取得し、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性があるセマンティック検索の制限を克服し、最も正確で文脈に関連した結果を得られるようにします。さらに、生のテキスト入力を受け付け、手動でベクトル埋め込みを生成することなくテキストデータを自動的にスパース埋め込みに変換するため、ベクトル検索を簡素化します。

    全文検索の詳細については、[全文検索](./full-text-search) を参照してください。

- テキストマッチ

    Zilliz Cloud のキーワードマッチを使用すると、特定の用語に基づいてドキュメントを正確に取得できます。この機能は主に、特定の条件を満たすためのフィルタリング検索に使用され、スカラーフィルタリングを組み合わせてクエリ結果を絞り込むことができ、スカラー条件を満たすベクトル内での類似検索が可能になります。

    キーワードマッチの詳細については、[Keyword Match](./text-match) を参照してください。

- パーティションキーの使用

    メタデータフィルタリングに複数のスカラーフィールドを含め、かなり複雑なフィルタリング条件を使用すると、検索効率に影響する可能性があります。スカラーフィールドをパーティションキーとして設定し、検索リクエストでパーティションキーを含むフィルタリング条件を使用すると、指定したパーティションキーの値に対応するパーティション内に検索範囲を制限するのに役立ちます。

    パーティションキーの詳細については、[Partition Key を使用する](./use-partition-key) を参照してください。

- mmap の使用

    mmap 設定の詳細については、[mmap を使用する](./use-mmap) を参照してください。

