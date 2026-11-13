---
title: "基本 Vector Search | Cloud"
slug: /single-vector-search
sidebar_label: "基本 Vector Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "近似最近邻（ANN）Search 通过构建索引的方式对向量空间中的向量进行预排序，并在收到 Search 请求时根据索引快速定位到与查询向量相似可能性较高的子集中进行对比查询，从而提升查询效率。本节主要介绍如何使用 Milvus 进行 ANN Search 及相关的注意事项。 | Cloud"
type: origin
token: HtzdwrGPZi4bvnksR75ccetInrf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基本 Vector Search

近似最近邻（ANN）Search 通过构建索引的方式对向量空间中的向量进行预排序，并在收到 Search 请求时根据索引快速定位到与查询向量相似可能性较高的子集中进行对比查询，从而提升查询效率。本节主要介绍如何使用 Milvus 进行 ANN Search 及相关的注意事项。

## 概述\{#overview}

向量搜索的实现主要依赖两类算法，一类是 k-最近邻（kNN）Search，一类是 ANN Search。kNN 算法将查询向量与向量空间中的每个向量进行比较，直到出现 k 个完全匹配的结果。尽管 kNN 搜索可以确保准确性，但十分耗时。尤其是数据量大，向量维度高时，耗时更久。

相比之下，ANN 算法会预先构建**索引**。并在收到 Search 请求时根据索引快速定位到与查询向量相似可能性较高的子集，然后根据请求中携带的**相似度类型**计算查询向量和子集中各向量的相似性，并对计算结果进行排序，从而在更短的时间内返回与查询向量相似度最高的 topK 个向量。

ANN Search 依赖预先创建的索引。选择不同的索引算法会影响搜索速度、内存使用情况和准确性。用户需要在召回率和性能之间做出取舍。为了降低用户的学习曲线，Zilliz Cloud 提供了 **AUTOINDEX**。通过在建立索引时分析用户数据的分布情况，使用机器学习模型自动选择检索参数，实现召回率和检索性能间的平衡。

关于 **AUTOINDEX** 的详细内容，可以参考本手册中的 [AUTOINDEX](./autoindex-explained) 一节的内容。关于相似度类型，可以参考本手册中[相似度类型](./search-metrics-explained)一节的内容。本节将围绕如下话题展开讨论：

- [单路查询](./single-vector-search#single-vector-search)

- [批量查询](./single-vector-search#bulk-vector-search)

- [在 Partition中进行 ANN Search](./single-vector-search#ANN-search-in-partition)

- [使用 Output Fields 参数](./single-vector-search#use-output-fields)

- [使用 Limit 和 Offset 参数](./single-vector-search#use-limit)

- [使用 Level 参数](./single-vector-search#use-level)

- [查看召回率](./single-vector-search#get-recall-rate)

- [使用 Async 和 Callback 参数](./single-vector-search)

## 单路查询\{#single-vector-search}

在 ANN Search 中，单路查询是指在 Search 请求中携带一个查询向量，由 Zilliz Cloud 通过预先建立的索引和请求中携带的相似度类型快速找到与查询向量最相近的 topK 个向量。

本节将演示如何在使用最简建表方式创建的 Collection 中进行单路查询。示例代码中的 Search 请示携带了一个查询向量，要求使用内积（IP）算法计算查询向量和目标向量间的相似度，并返回最相近的 3 个向量。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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
#             "id": 0,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#         {
#             "id": 10,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#         {
#             "id": 4,
#             "distance": 0.9902134537696838,
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
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.aggregation.AggDirection;
import io.milvus.v2.service.vector.request.aggregation.OrderByField;
import io.milvus.v2.service.vector.request.data.BaseVector;
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

List> searchResults = searchResp.getSearchResults();
for (List results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=0)
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=10)
// SearchResp.SearchResult(entity={}, score=0.9902134537696838, id=4)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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

// Output
// IDs:  [0, 10, 4]
// Scores: [1.4093276262283325, 1.4093276262283325, 0.9902134537696838]
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

// 4. Single vector search
let query_vector = vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("quick_setup")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(3)
            .build()?,
    )
    .await?;

for result in response.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
// EntityRow { id: 0, ... }, EntityRow { id: 10, ... }, EntityRow { id: 4, ... }
```

</TabItem>

<TabItem value='c++'>

```c++
#include 
#include 
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cerr  queryVector = {
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
    std::cerr

// Output
// TopK: (id=0, distance=1.4093276262283325), (id=10, distance=1.4093276262283325), (id=4, distance=0.9902134537696838)
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
//   { score: 1.4093276262283325, id: '0' },
//   { score: 1.4093276262283325, id: '10' },
//   { score: 0.9902134537696838, id: '4' }
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Types;

using var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

// 4. Single vector search
var queryVector = new[] { new ReadOnlyMemory(new[] { 0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f }) };
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "quick_setup",
    VectorFieldName = "vector",
    Vectors = queryVector,
    Limit = 3
});

var single = res.SingleResults?.FirstOrDefault();
if (single is not null)
{
    for (int i = 0; i

// Output
// {Id=0, Distance=1.4093276262283325}, {Id=10, Distance=1.4093276262283325}, {Id=4, Distance=0.9902134537696838}
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
#             "distance": 1.4093276262283325,
#             "id": 0
#         },
#         {
#             "distance": 1.4093276262283325,
#             "id": 10
#         },
#         {
#             "distance": 0.9902134537696838,
#             "id": 4
#         }
#     ],
#     "topks":[3]
# }
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

返回的结果将按相似度进行排序，与查询向量最相似的结果排在前面。度量值的大小根据相似度类型的不同呈现出不同的特点。下表展示了使用不同的相似度类型，其度量值的特点。

| **相似度类型** | **特点** | 取值范围 |
| --- | --- | --- |
| `L2` | 较小的 L2 距离表示更高的相似性。 | [0, ∞) |
| `IP` | 较大的 IP 距离表示更高的相似性。 | [-1, 1] |
| `COSINE` | 较大的 cosine 值表示更高的相似性。 | [-1, 1] |
| `JACCARD` | 较小的 Jaccard 距离表示更高的相似性。 | [0, 1] |
| `HAMMING` | 较小的 Hamming 距离表示更高的相似性。 | [0, dim(vector)] |

## 批量查询\{#bulk-vector-search}

您也可以在 Search 请求中携带多个查询向量，Zilliz Cloud 将分别针对这两个查询向量执行 ANN Search，并返回两组查询结果。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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
#             "id": 0,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#         {
#             "id": 10,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#         {
#             "id": 4,
#             "distance": 0.9902134537696838,
#             "entity": {}
#         }
#     ],
#     [
#         {
#             "id": 1,
#             "distance": 1.3017789125442505,
#             "entity": {}
#         },
#         {
#             "id": 11,
#             "distance": 1.3017789125442505,
#             "entity": {}
#         },
#         {
#             "id": 7,
#             "distance": 1.2419954538345337,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
List queryVectors = Arrays.asList(
        new FloatVec(new float[]{0.041732933f, 0.013779674f, -0.027564144f, -0.013061441f, 0.009748648f}),
        new FloatVec(new float[]{0.0039737443f, 0.003020432f, -0.0006188639f, 0.03913546f, -0.00089768134f})
);
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(queryVectors)
        .topK(3)
        .build();

SearchResp searchResp = client.search(searchReq);

List> searchResults = searchResp.getSearchResults();
for (List results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=0)
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=10)
// SearchResp.SearchResult(entity={}, score=0.9902134537696838, id=4)
// TopK results:
// SearchResp.SearchResult(entity={}, score=1.3017789125442505, id=1)
// SearchResp.SearchResult(entity={}, score=1.3017789125442505, id=11)
// SearchResp.SearchResult(entity={}, score=1.2419954538345337, id=7)
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

// Output
// IDs:  [0, 10, 4]
// Scores: [1.4093276262283325, 1.4093276262283325, 0.9902134537696838]
// IDs:  [1, 11, 7]
// Scores: [1.3017789125442505, 1.3017789125442505, 1.2419954538345337]
```

</TabItem>

<TabItem value='rust'>

```rust
// 7. Search with multiple vectors
// 7.1. Prepare query vectors
let query_vectors = vec![
    vec![0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648],
    vec![0.0039737443, 0.003020432, -0.0006188639, 0.03913546, -0.00089768134],
];

// 7.2. Start search
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("quick_setup")
            .vector_field("vector")
            .vectors(SearchVectors::Float(query_vectors))
            .limit(3)
            .build()?,
    )
    .await?;

for result in response.results() {
    println!("TopK results:");
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
// EntityRow { id: 0, ... }, EntityRow { id: 10, ... }, EntityRow { id: 4, ... }
// EntityRow { id: 1, ... }, EntityRow { id: 11, ... }, EntityRow { id: 7, ... }
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector> queryVectors = {
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
    std::cerr

// Output
// TopK: (id=0, distance=1.4093276262283325), (id=10, distance=1.4093276262283325), (id=4, distance=0.9902134537696838)
// TopK: (id=1, distance=1.3017789125442505), (id=11, distance=1.3017789125442505), (id=7, distance=1.2419954538345337)
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
//     { score: 1.4093276262283325, id: '0' },
//     { score: 1.4093276262283325, id: '10' },
//     { score: 0.9902134537696838, id: '4' }
//   ],
//   [
//     { score: 1.3017789125442505, id: '1' },
//     { score: 1.3017789125442505, id: '11' },
//     { score: 1.2419954538345337, id: '7' }
//   ]
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
// 7. Search with multiple vectors
// 7.1. Prepare query vectors
var queryVectors = new[]
{
    new ReadOnlyMemory(new[] { 0.041732933f, 0.013779674f, -0.027564144f, -0.013061441f, 0.009748648f }),
    new ReadOnlyMemory(new[] { 0.0039737443f, 0.003020432f, -0.0006188639f, 0.03913546f, -0.00089768134f })
};

// 7.2. Start search
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "quick_setup",
    VectorFieldName = "vector",
    Vectors = queryVectors,
    Limit = 3
});

// Output
// {Id=0, Distance=1.4093276262283325}, {Id=10, Distance=1.4093276262283325}, {Id=4, Distance=0.9902134537696838}
// {Id=1, Distance=1.3017789125442505}, {Id=11, Distance=1.3017789125442505}, {Id=7, Distance=1.2419954538345337}
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
#               "distance": 1.4093276262283325,
#               "id": 0
#           },
#           {
#               "distance": 1.4093276262283325,
#               "id": 10
#           },
#           {
#               "distance": 0.9902134537696838,
#               "id": 4
#           }
#         ],
#         [
#           {
#               "distance": 1.3017789125442505,
#               "id": 1
#           },
#           {
#               "distance": 1.3017789125442505,
#               "id": 11
#           },
#           {
#               "distance": 1.2419954538345337,
#               "id": 7
#           }
#        ]
#     ],
#     "topks":[3]
# }
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

## 主键搜索\{#Primary-Key Search}

除了可以在搜索请求中设置查询向量外，您还可以使用 Collection 中在指定字段上包含了查询向量的 Entity 的主键来进行查询。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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

# Output
#
# [
#     [
#         {
#             "id": 7,
#             "distance": 0.8298614621162415,
#             "entity": {}
#         },
#         {
#             "id": 17,
#             "distance": 0.8298614621162415,
#             "entity": {}
#         },
#         {
#             "id": 1,
#             "distance": 0.7651865482330322,
#             "entity": {}
#         }
#     ]
#     [
#         {
#             "id": 7,
#             "distance": 0.7964162826538086,
#             "entity": {}
#         },
#         {
#             "id": 17,
#             "distance": 0.7964162826538086,
#             "entity": {}
#         },
#         {
#             "id": 1,
#             "distance": 0.7850733995437622,
#             "entity": {}
#         }
#     ]
#     [
#         {
#             "id": 1,
#             "distance": 0.8049601912498474,
#             "entity": {}
#         },
#         {
#             "id": 11,
#             "distance": 0.8049601912498474,
#             "entity": {}
#         },
#         {
#             "id": 7,
#             "distance": 0.7629711627960205,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .annsField("vector")
        // highlight-start
        .ids(Arrays.asList(551L, 296L, 43L))
        // highlight-end
        .limit(3)
        .metricType(IndexParam.MetricType.IP)
        .build();

SearchResp searchResp = client.search(searchReq);
System.out.println(searchResp.getSearchResults());

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.8298614621162415, id=7)
// SearchResp.SearchResult(entity={}, score=0.8298614621162415, id=17)
// SearchResp.SearchResult(entity={}, score=0.7651865482330322, id=1)
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.7964162826538086, id=7)
// SearchResp.SearchResult(entity={}, score=0.7964162826538086, id=17)
// SearchResp.SearchResult(entity={}, score=0.7850733995437622, id=1)
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.8049601912498474, id=1)
// SearchResp.SearchResult(entity={}, score=0.8049601912498474, id=11)
// SearchResp.SearchResult(entity={}, score=0.7629711627960205, id=7)
```

</TabItem>

<TabItem value='go'>

```go
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

// Output
// IDs:  [7, 17, 1]
// Scores: [0.8298614621162415, 0.8298614621162415, 0.7651865482330322]
// IDs:  [7, 17, 1]
// Scores: [0.7964162826538086, 0.7964162826538086, 0.7850733995437622]
// IDs:  [1, 11, 7]
// Scores: [0.8049601912498474, 0.8049601912498474, 0.7629711627960205]
```

</TabItem>

<TabItem value='rust'>

```rust
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("quick_setup")
            .vector_field("vector")
            .ids(Ids::Int64(vec![551, 296, 43]))
            .limit(3)
            .build()?,
    )
    .await?;

for result in response.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
// EntityRow { id: 7, ... }, EntityRow { id: 17, ... }, EntityRow { id: 1, ... }
// EntityRow { id: 7, ... }, EntityRow { id: 17, ... }, EntityRow { id: 1, ... }
// EntityRow { id: 1, ... }, EntityRow { id: 11, ... }, EntityRow { id: 7, ... }
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
    std::cerr

// Output
// TopK: (id=7, distance=0.8298614621162415), (id=17, distance=0.8298614621162415), (id=1, distance=0.7651865482330322)
// TopK: (id=7, distance=0.7964162826538086), (id=17, distance=0.7964162826538086), (id=1, distance=0.7850733995437622)
// TopK: (id=1, distance=0.8049601912498474), (id=11, distance=0.8049601912498474), (id=7, distance=0.7629711627960205)
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.search({
    collection_name: "quick_setup",
    anns_field: "vector",
    // highlight-start
    ids: [551, 296, 43],
    // highlight-end
    limit: 3,
    metric_type: "IP",
})

console.log(res.results)

// Output
// [
//   [
//     { score: 0.8298614621162415, id: '7' },
//     { score: 0.8298614621162415, id: '17' },
//     { score: 0.7651865482330322, id: '1' }
//   ],
//   [
//     { score: 0.7964162826538086, id: '7' },
//     { score: 0.7964162826538086, id: '17' },
//     { score: 0.7850733995437622, id: '1' }
//   ],
//   [
//     { score: 0.8049601912498474, id: '1' },
//     { score: 0.8049601912498474, id: '11' },
//     { score: 0.7629711627960205, id: '7' }
//   ]
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "quick_setup",
    VectorFieldName = "vector",
    Ids = new object[] { 551L, 296L, 43L },
    Limit = 3,
    MetricType = MetricType.Ip
});

// Output
// {Id=7, Distance=0.8298614621162415}, {Id=17, Distance=0.8298614621162415}, {Id=1, Distance=0.7651865482330322}
// {Id=7, Distance=0.7964162826538086}, {Id=17, Distance=0.7964162826538086}, {Id=1, Distance=0.7850733995437622}
// {Id=1, Distance=0.8049601912498474}, {Id=11, Distance=0.8049601912498474}, {Id=7, Distance=0.7629711627960205}
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

# {
#     "code": 0,
#     "data": [
#         [
#           {
#               "distance": 0.8298614621162415,
#               "id": 7
#           },
#           {
#               "distance": 0.8298614621162415,
#               "id": 17
#           },
#           {
#               "distance": 0.7651865482330322,
#               "id": 1
#           }
#         ],
#         [
#           {
#               "distance": 0.7964162826538086,
#               "id": 7
#           },
#           {
#               "distance": 0.7964162826538086,
#               "id": 17
#           },
#           {
#               "distance": 0.7850733995437622,
#               "id": 1
#           }
#         ],
#         [
#           {
#               "distance": 0.8049601912498474,
#               "id": 1
#           },
#           {
#               "distance": 0.8049601912498474,
#               "id": 11
#           },
#           {
#               "distance": 0.7629711627960205,
#               "id": 7
#           }
#         ]
#     ],
#     "topks":[3]
# }
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

## 在 Parition 中进行 ANN Search\{#ANN-search-in-partition}

如果 Collection 中存在多个按具体划分规则划分的 Partition，而且您的查询目标可以具体到其中的一个或多个 Partition。您就可以在 Search 请求中携带目标 Partition 的名称。通过减少扫描的数据量，可以显著提高搜索速度。

在以下示例代码中，假设存在一个名为 partitionA 的 Partition。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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
#             "id": 10,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#         {
#             "id": 14,
#             "distance": 0.9902134537696838,
#             "entity": {}
#         },
#         {
#             "id": 11,
#             "distance": 0.8519943356513977,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .partitionNames(Collections.singletonList("partitionA"))
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .build();

SearchResp searchResp = client.search(searchReq);

List> searchResults = searchResp.getSearchResults();
for (List results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=10)
// SearchResp.SearchResult(entity={}, score=0.9902134537696838, id=14)
// SearchResp.SearchResult(entity={}, score=0.8519943356513977, id=11)
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

// Output
// IDs:  [10, 14, 11]
// Scores: [1.4093276262283325, 0.9902134537696838, 0.8519943356513977]
```

</TabItem>

<TabItem value='rust'>

```rust
// 4. Single vector search
let query_vector = vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("quick_setup")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .partition_names(["partitionA"])
            .limit(3)
            .build()?,
    )
    .await?;

for result in response.results() {
    println!("TopK results:");
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
// EntityRow { id: 10, ... }, EntityRow { id: 14, ... }, EntityRow { id: 11, ... }
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
    std::cerr

// Output
// TopK: (id=10, distance=1.4093276262283325), (id=14, distance=0.9902134537696838), (id=11, distance=0.8519943356513977)
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
//   { score: 1.4093276262283325, id: '10' },
//   { score: 0.9902134537696838, id: '14' },
//   { score: 0.8519943356513977, id: '11' }
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
var queryVector = new[] { new ReadOnlyMemory(new[] { 0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f }) };
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "quick_setup",
    VectorFieldName = "vector",
    Vectors = queryVector,
    Limit = 3,
    Parameters = new SearchParameters { PartitionNames = { "partitionA" } }
});

// Output
// {Id=10, Distance=1.4093276262283325}, {Id=14, Distance=0.9902134537696838}, {Id=11, Distance=0.8519943356513977}
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
#             "distance": 1.4093276262283325,
#             "id": 10
#         },
#         {
#             "distance": 0.9902134537696838,
#             "id": 14
#         },
#         {
#             "distance": 0.8519943356513977,
#             "id": 11
#         }
#     ],
#     "topks":[3]
# }
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

## 使用 Output Fields 参数\{#use-output-fields}

在 Zilliz Cloud 中，ANN Search 默认返回与查询向量最相近的 topK 个 Entity 的主键值 (**id**) 及该 Entity 与查询向量的相似度得分 (**distance** 或 **score**)。如果要求返回的每个 Entity 中都携带指定字段的值，可以在 Search 请求中指定 Output Fields (输出字段)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        # highlight-next-line
        "offset": 10 # The records to skip
    }
)

# [
#     [
#         {
#             "id": 3,
#             "distance": 0.4527677893638611,
#             "entity": {}
#         },
#     [
#         {
#             "id": 13,
#             "distance": 0.4527677893638611,
#             "entity": {}
#         },
#     [
#         {
#             "id": 7,
#             "distance": 0.4388217329978943,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .outputFields(Collections.singletonList("color"))
        .build();

SearchResp searchResp = client.search(searchReq);

List> searchResults = searchResp.getSearchResults();
for (List results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={color=pink_8682}, score=1.4093276262283325, id=0)
// SearchResp.SearchResult(entity={color=pink_8682}, score=1.4093276262283325, id=10)
// SearchResp.SearchResult(entity={color=red_4794}, score=0.9902134537696838, id=4)
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

// Output
// IDs:  [0, 10, 4]
// Scores: [1.4093276262283325, 1.4093276262283325, 0.9902134537696838]
// color: ["pink_8682", "pink_8682", "red_4794"]
```

</TabItem>

<TabItem value='rust'>

```rust
// 4. Single vector search
let query_vector = vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("quick_setup")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .output_fields(["color"])
            .limit(3)
            .build()?,
    )
    .await?;

for result in response.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
// EntityRow { id: 0, color: "pink_8682", ... }, EntityRow { id: 10, color: "pink_8682", ... }, EntityRow { id: 4, color: "red_4794", ... }
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
    std::cerr ("color");
    for (size_t i = 0; i Data()[i]

// Output
// TopK: (id=0, distance=1.4093276262283325, color=pink_8682), (id=10, distance=1.4093276262283325, color=pink_8682), (id=4, distance=0.9902134537696838, color=red_4794)
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
//   { score: 1.4093276262283325, id: '0', entity: {"color": "pink_8682"}},
//   { score: 1.4093276262283325, id: '10', entity: {"color": "pink_8682"}},
//   { score: 0.9902134537696838, id: '4', entity: {"color": "red_4794"}}
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
var queryVector = new[] { new ReadOnlyMemory(new[] { 0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f }) };
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "quick_setup",
    VectorFieldName = "vector",
    Vectors = queryVector,
    Limit = 3,
    Parameters = new SearchParameters { OutputFields = { "color" } }
});

// Output
// {Id=0, Distance=1.4093276262283325, Color=pink_8682}, {Id=10, Distance=1.4093276262283325, Color=pink_8682}, {Id=4, Distance=0.9902134537696838, Color=red_4794}
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
#             "distance": 1.4093276262283325,
#             "id": 0,
#             "color": "pink_8682"
#         },
#         {
#             "distance": 1.4093276262283325,
#             "id": 10,
#             "color": "pink_8682"
#         },
#         {
#             "distance": 0.9902134537696838,
#             "id": 4,
#             "color": "red_4794"
#         }
#     ],
#     "topks":[3]
# }
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

## 通过标量字段对搜索结果进行排序 | PUBLIC \{#sort-search-results-by-scalar-fields}

默认情况下，Zilliz Cloud 会按照结果与查询向量的相似度得分对搜索结果进行排序。如果你希望返回的 Entity 遵循某个标量字段的排序规则，可以在搜索请求中添加 `order_by_fields` 参数。

`order_by_fields` 中的每一项都需要指定一个标量字段以及排序方向。排序方向可以是 `"asc"`（升序）或 `"desc"`（降序）。如果省略 `order` 字段，Zilliz Cloud 会默认按该字段的升序进行排序。

下面的示例按照 `price` 字段从低到高对搜索结果进行排序。如果你希望在响应中查看该字段的值，请将该排序字段一并添加到 `output_fields` 中。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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

# Output
#
# [
#     {
#         "id": 1,
#         "price": 11.0,
#         "rating": 4.1,
#         "category": "cate1"
#     },
#     {
#         "id": 2,
#         "price": 12.0,
#         "rating": 4.2,
#         "category": "cate2"
#     },
#     {
#         "id": 3,
#         "price": 13.0,
#         "rating": 4.3,
#         "category": "cate3"
#     },
#     {
#         "id": 4,
#         "price": 14.0,
#         "rating": 4.4,
#         "category": "cate4"
#     },
#     {
#         "id": 5,
#         "price": 15.0,
#         "rating": 4.5,
#         "category": "cate0"
#     },
#     {
#         "id": 6,
#         "price": 16.0,
#         "rating": 4.6,
#         "category": "cate1"
#     },
#     {
#         "id": 7,
#         "price": 17.0,
#         "rating": 4.7,
#         "category": "cate2"
#     },
#     {
#         "id": 8,
#         "price": 18.0,
#         "rating": 4.8,
#         "category": "cate3"
#     },
#     {
#         "id": 9,
#         "price": 19.0,
#         "rating": 4.9,
#         "category": "cate4"
#     },
#     {
#         "id": 10,
#         "price": 20.0,
#         "rating": 4.0,
#         "category": "cate0"
#     },
#     {
#         "id": 11,
#         "price": 21.0,
#         "rating": 4.1,
#         "category": "cate1"
#     },
#     {
#         "id": 12,
#         "price": 22.0,
#         "rating": 4.2,
#         "category": "cate2"
#     },
#     {
#         "id": 13,
#         "price": 23.0,
#         "rating": 4.3,
#         "category": "cate3"
#     },
#     {
#         "id": 14,
#         "price": 24.0,
#         "rating": 4.4,
#         "category": "cate4"
#     },
#     {
#         "id": 15,
#         "price": 25.0,
#         "rating": 4.5,
#         "category": "cate0"
#     },
#     {
#         "id": 16,
#         "price": 26.0,
#         "rating": 4.6,
#         "category": "cate1"
#     },
#     {
#         "id": 17,
#         "price": 27.0,
#         "rating": 4.7,
#         "category": "cate2"
#     },
#     {
#         "id": 18,
#         "price": 28.0,
#         "rating": 4.8,
#         "category": "cate3"
#     },
#     {
#         "id": 19,
#         "price": 29.0,
#         "rating": 4.9,
#         "category": "cate4"
#     },
#     {
#         "id": 20,
#         "price": 30.0,
#         "rating": 4.0,
#         "category": "cate0"
#     }
# ]
```

</TabItem>

<TabItem value='java'>

```java
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

// Output
// SearchResp.SearchResult(entity={id=1, price=11.0, rating=4.1, category=cate1}, ...)
// SearchResp.SearchResult(entity={id=2, price=12.0, rating=4.2, category=cate2}, ...)
// SearchResp.SearchResult(entity={id=3, price=13.0, rating=4.3, category=cate3}, ...)
// SearchResp.SearchResult(entity={id=4, price=14.0, rating=4.4, category=cate4}, ...)
// SearchResp.SearchResult(entity={id=5, price=15.0, rating=4.5, category=cate0}, ...)
// SearchResp.SearchResult(entity={id=6, price=16.0, rating=4.6, category=cate1}, ...)
// SearchResp.SearchResult(entity={id=7, price=17.0, rating=4.7, category=cate2}, ...)
// SearchResp.SearchResult(entity={id=8, price=18.0, rating=4.8, category=cate3}, ...)
// SearchResp.SearchResult(entity={id=9, price=19.0, rating=4.9, category=cate4}, ...)
// SearchResp.SearchResult(entity={id=10, price=20.0, rating=4.0, category=cate0}, ...)
// SearchResp.SearchResult(entity={id=11, price=21.0, rating=4.1, category=cate1}, ...)
// SearchResp.SearchResult(entity={id=12, price=22.0, rating=4.2, category=cate2}, ...)
// SearchResp.SearchResult(entity={id=13, price=23.0, rating=4.3, category=cate3}, ...)
// SearchResp.SearchResult(entity={id=14, price=24.0, rating=4.4, category=cate4}, ...)
// SearchResp.SearchResult(entity={id=15, price=25.0, rating=4.5, category=cate0}, ...)
// SearchResp.SearchResult(entity={id=16, price=26.0, rating=4.6, category=cate1}, ...)
// SearchResp.SearchResult(entity={id=17, price=27.0, rating=4.7, category=cate2}, ...)
// SearchResp.SearchResult(entity={id=18, price=28.0, rating=4.8, category=cate3}, ...)
// SearchResp.SearchResult(entity={id=19, price=29.0, rating=4.9, category=cate4}, ...)
// SearchResp.SearchResult(entity={id=20, price=30.0, rating=4.0, category=cate0}, ...)
```

</TabItem>

<TabItem value='go'>

```go
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

// Output
// IDs:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
// Prices: [11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 19.0, 20.0, 21.0, 22.0, 23.0, 24.0, 25.0, 26.0, 27.0, 28.0, 29.0, 30.0]
// Ratings: [4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.0]
```

</TabItem>

<TabItem value='rust'>

```rust
let query_vector = vec![0.35803764, -0.6023496, 0.18414013, -0.26286206, 0.90294385];
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("product_catalog")
            .vector_field("embedding")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(20)
            .output_fields(["id", "price", "rating", "category"])
            .order_by_fields(vec![OrderByField::new().field_name("price").direction(AggDirection::Asc)])
            .build()?,
    )
    .await?;

for result in response.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
//
// [
//     {
//         "id": 1,
//         "price": 11.0,
//         "rating": 4.1,
//         "category": "cate1"
//     },
//     {
//         "id": 2,
//         "price": 12.0,
//         "rating": 4.2,
//         "category": "cate2"
//     },
//     {
//         "id": 3,
//         "price": 13.0,
//         "rating": 4.3,
//         "category": "cate3"
//     },
//     {
//         "id": 4,
//         "price": 14.0,
//         "rating": 4.4,
//         "category": "cate4"
//     },
//     {
//         "id": 5,
//         "price": 15.0,
//         "rating": 4.5,
//         "category": "cate0"
//     },
//     {
//         "id": 6,
//         "price": 16.0,
//         "rating": 4.6,
//         "category": "cate1"
//     },
//     {
//         "id": 7,
//         "price": 17.0,
//         "rating": 4.7,
//         "category": "cate2"
//     },
//     {
//         "id": 8,
//         "price": 18.0,
//         "rating": 4.8,
//         "category": "cate3"
//     },
//     {
//         "id": 9,
//         "price": 19.0,
//         "rating": 4.9,
//         "category": "cate4"
//     },
//     {
//         "id": 10,
//         "price": 20.0,
//         "rating": 4.0,
//         "category": "cate0"
//     },
//     {
//         "id": 11,
//         "price": 21.0,
//         "rating": 4.1,
//         "category": "cate1"
//     },
//     {
//         "id": 12,
//         "price": 22.0,
//         "rating": 4.2,
//         "category": "cate2"
//     },
//     {
//         "id": 13,
//         "price": 23.0,
//         "rating": 4.3,
//         "category": "cate3"
//     },
//     {
//         "id": 14,
//         "price": 24.0,
//         "rating": 4.4,
//         "category": "cate4"
//     },
//     {
//         "id": 15,
//         "price": 25.0,
//         "rating": 4.5,
//         "category": "cate0"
//     },
//     {
//         "id": 16,
//         "price": 26.0,
//         "rating": 4.6,
//         "category": "cate1"
//     },
//     {
//         "id": 17,
//         "price": 27.0,
//         "rating": 4.7,
//         "category": "cate2"
//     },
//     {
//         "id": 18,
//         "price": 28.0,
//         "rating": 4.8,
//         "category": "cate3"
//     },
//     {
//         "id": 19,
//         "price": 29.0,
//         "rating": 4.9,
//         "category": "cate4"
//     },
//     {
//         "id": 20,
//         "price": 30.0,
//         "rating": 4.0,
//         "category": "cate0"
//     }
// ]
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
    std::cerr ("price");
    for (size_t i = 0; i Data()[i]

// Output
// TopK: (id=1, price=11.0), (id=2, price=12.0), (id=3, price=13.0), (id=4, price=14.0), (id=5, price=15.0), (id=6, price=16.0), (id=7, price=17.0), (id=8, price=18.0), (id=9, price=19.0), (id=10, price=20.0), (id=11, price=21.0), (id=12, price=22.0), (id=13, price=23.0), (id=14, price=24.0), (id=15, price=25.0), (id=16, price=26.0), (id=17, price=27.0), (id=18, price=28.0), (id=19, price=29.0), (id=20, price=30.0)
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.search({
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

// Output
// [
//   { id: 1, price: 11.0, rating: 4.1, category: "cate1" },
//   { id: 2, price: 12.0, rating: 4.2, category: "cate2" },
//   { id: 3, price: 13.0, rating: 4.3, category: "cate3" },
//   { id: 4, price: 14.0, rating: 4.4, category: "cate4" },
//   { id: 5, price: 15.0, rating: 4.5, category: "cate0" },
//   { id: 6, price: 16.0, rating: 4.6, category: "cate1" },
//   { id: 7, price: 17.0, rating: 4.7, category: "cate2" },
//   { id: 8, price: 18.0, rating: 4.8, category: "cate3" },
//   { id: 9, price: 19.0, rating: 4.9, category: "cate4" },
//   { id: 10, price: 20.0, rating: 4.0, category: "cate0" },
//   { id: 11, price: 21.0, rating: 4.1, category: "cate1" },
//   { id: 12, price: 22.0, rating: 4.2, category: "cate2" },
//   { id: 13, price: 23.0, rating: 4.3, category: "cate3" },
//   { id: 14, price: 24.0, rating: 4.4, category: "cate4" },
//   { id: 15, price: 25.0, rating: 4.5, category: "cate0" },
//   { id: 16, price: 26.0, rating: 4.6, category: "cate1" },
//   { id: 17, price: 27.0, rating: 4.7, category: "cate2" },
//   { id: 18, price: 28.0, rating: 4.8, category: "cate3" },
//   { id: 19, price: 29.0, rating: 4.9, category: "cate4" },
//   { id: 20, price: 30.0, rating: 4.0, category: "cate0" }
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
var queryVector = new[] { new ReadOnlyMemory(new[] { 0.35803764f, -0.6023496f, 0.18414013f, -0.26286206f, 0.90294385f }) };
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "product_catalog",
    VectorFieldName = "embedding",
    Vectors = queryVector,
    Limit = 20,
    Parameters = new SearchParameters
    {
        OutputFields = { "id", "price", "rating", "category" },
        ExtraParameters = { ["order_by_fields"] = "price:asc" }
    }
});

// Output
// {Id=1, Price=11.0}, {Id=2, Price=12.0}, {Id=3, Price=13.0}, {Id=4, Price=14.0}, {Id=5, Price=15.0}, {Id=6, Price=16.0}, {Id=7, Price=17.0}, {Id=8, Price=18.0}, {Id=9, Price=19.0}, {Id=10, Price=20.0}, {Id=11, Price=21.0}, {Id=12, Price=22.0}, {Id=13, Price=23.0}, {Id=14, Price=24.0}, {Id=15, Price=25.0}, {Id=16, Price=26.0}, {Id=17, Price=27.0}, {Id=18, Price=28.0}, {Id=19, Price=29.0}, {Id=20, Price=30.0}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
    "collectionName": "product_catalog",
    "data": [[0.35803764, -0.6023496, 0.18414013, -0.26286206, 0.90294385]],
    "annsField": "embedding",
    "limit": 20,
    "outputFields": ["id", "price", "rating", "category"],
    "orderByFields": ["price:asc"]
}'

# {
#     "code": 0,
#     "data": [
#         {
#             "id": 1,
#             "price": 11.0,
#             "rating": 4.1,
#             "category": "cate1"
#         },
#         {
#             "id": 2,
#             "price": 12.0,
#             "rating": 4.2,
#             "category": "cate2"
#         },
#         {
#             "id": 3,
#             "price": 13.0,
#             "rating": 4.3,
#             "category": "cate3"
#         },
#         {
#             "id": 4,
#             "price": 14.0,
#             "rating": 4.4,
#             "category": "cate4"
#         },
#         {
#             "id": 5,
#             "price": 15.0,
#             "rating": 4.5,
#             "category": "cate0"
#         },
#         {
#             "id": 6,
#             "price": 16.0,
#             "rating": 4.6,
#             "category": "cate1"
#         },
#         {
#             "id": 7,
#             "price": 17.0,
#             "rating": 4.7,
#             "category": "cate2"
#         },
#         {
#             "id": 8,
#             "price": 18.0,
#             "rating": 4.8,
#             "category": "cate3"
#         },
#         {
#             "id": 9,
#             "price": 19.0,
#             "rating": 4.9,
#             "category": "cate4"
#         },
#         {
#             "id": 10,
#             "price": 20.0,
#             "rating": 4.0,
#             "category": "cate0"
#         },
#         {
#             "id": 11,
#             "price": 21.0,
#             "rating": 4.1,
#             "category": "cate1"
#         },
#         {
#             "id": 12,
#             "price": 22.0,
#             "rating": 4.2,
#             "category": "cate2"
#         },
#         {
#             "id": 13,
#             "price": 23.0,
#             "rating": 4.3,
#             "category": "cate3"
#         },
#         {
#             "id": 14,
#             "price": 24.0,
#             "rating": 4.4,
#             "category": "cate4"
#         },
#         {
#             "id": 15,
#             "price": 25.0,
#             "rating": 4.5,
#             "category": "cate0"
#         },
#         {
#             "id": 16,
#             "price": 26.0,
#             "rating": 4.6,
#             "category": "cate1"
#         },
#         {
#             "id": 17,
#             "price": 27.0,
#             "rating": 4.7,
#             "category": "cate2"
#         },
#         {
#             "id": 18,
#             "price": 28.0,
#             "rating": 4.8,
#             "category": "cate3"
#         },
#         {
#             "id": 19,
#             "price": 29.0,
#             "rating": 4.9,
#             "category": "cate4"
#         },
#         {
#             "id": 20,
#             "price": 30.0,
#             "rating": 4.0,
#             "category": "cate0"
#         }
#     ],
#     "topks":[20]
# }
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection product_catalog \
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
  "annsField": "embedding",
  "outputFields": [
    "id",
    "price",
    "rating",
    "category"
  ],
  "orderByFields": [
    "price:asc"
  ],
  "limit": 20
}' \
  --output json
```

</TabItem>
</Tabs>

你也可以按多个标量字段进行排序。Zilliz Cloud 会按照你指定的字段顺序依次应用排序规则。在下面的示例中，Zilliz Cloud 首先按 `price` 进行升序排序；对于具有相同 `price` 的 Entity，则再按 `rating` 进行降序排序。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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

# Output
#
# [
#     {
#         "id": 1,
#         "price": 11.0,
#         "rating": 4.1,
#         "category": "cate1"
#     },
#     {
#         "id": 2,
#         "price": 12.0,
#         "rating": 4.2,
#         "category": "cate2"
#     },
#     {
#         "id": 3,
#         "price": 13.0,
#         "rating": 4.3,
#         "category": "cate3"
#     },
#     {
#         "id": 4,
#         "price": 14.0,
#         "rating": 4.4,
#         "category": "cate4"
#     },
#     {
#         "id": 5,
#         "price": 15.0,
#         "rating": 4.5,
#         "category": "cate0"
#     },
#     {
#         "id": 6,
#         "price": 16.0,
#         "rating": 4.6,
#         "category": "cate1"
#     },
#     {
#         "id": 7,
#         "price": 17.0,
#         "rating": 4.7,
#         "category": "cate2"
#     },
#     {
#         "id": 8,
#         "price": 18.0,
#         "rating": 4.8,
#         "category": "cate3"
#     },
#     {
#         "id": 9,
#         "price": 19.0,
#         "rating": 4.9,
#         "category": "cate4"
#     },
#     {
#         "id": 10,
#         "price": 20.0,
#         "rating": 4.0,
#         "category": "cate0"
#     },
#     {
#         "id": 11,
#         "price": 21.0,
#         "rating": 4.1,
#         "category": "cate1"
#     },
#     {
#         "id": 12,
#         "price": 22.0,
#         "rating": 4.2,
#         "category": "cate2"
#     },
#     {
#         "id": 13,
#         "price": 23.0,
#         "rating": 4.3,
#         "category": "cate3"
#     },
#     {
#         "id": 14,
#         "price": 24.0,
#         "rating": 4.4,
#         "category": "cate4"
#     },
#     {
#         "id": 15,
#         "price": 25.0,
#         "rating": 4.5,
#         "category": "cate0"
#     },
#     {
#         "id": 16,
#         "price": 26.0,
#         "rating": 4.6,
#         "category": "cate1"
#     },
#     {
#         "id": 17,
#         "price": 27.0,
#         "rating": 4.7,
#         "category": "cate2"
#     },
#     {
#         "id": 18,
#         "price": 28.0,
#         "rating": 4.8,
#         "category": "cate3"
#     },
#     {
#         "id": 19,
#         "price": 29.0,
#         "rating": 4.9,
#         "category": "cate4"
#     },
#     {
#         "id": 20,
#         "price": 30.0,
#         "rating": 4.0,
#         "category": "cate0"
#     }
# ]
```

</TabItem>

<TabItem value='java'>

```java
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

// Output
// SearchResp.SearchResult(entity={id=1, price=11.0, rating=4.1, category=cate1}, ...)
// SearchResp.SearchResult(entity={id=2, price=12.0, rating=4.2, category=cate2}, ...)
// SearchResp.SearchResult(entity={id=3, price=13.0, rating=4.3, category=cate3}, ...)
// SearchResp.SearchResult(entity={id=4, price=14.0, rating=4.4, category=cate4}, ...)
// SearchResp.SearchResult(entity={id=5, price=15.0, rating=4.5, category=cate0}, ...)
// SearchResp.SearchResult(entity={id=6, price=16.0, rating=4.6, category=cate1}, ...)
// SearchResp.SearchResult(entity={id=7, price=17.0, rating=4.7, category=cate2}, ...)
// SearchResp.SearchResult(entity={id=8, price=18.0, rating=4.8, category=cate3}, ...)
// SearchResp.SearchResult(entity={id=9, price=19.0, rating=4.9, category=cate4}, ...)
// SearchResp.SearchResult(entity={id=10, price=20.0, rating=4.0, category=cate0}, ...)
// SearchResp.SearchResult(entity={id=11, price=21.0, rating=4.1, category=cate1}, ...)
// SearchResp.SearchResult(entity={id=12, price=22.0, rating=4.2, category=cate2}, ...)
// SearchResp.SearchResult(entity={id=13, price=23.0, rating=4.3, category=cate3}, ...)
// SearchResp.SearchResult(entity={id=14, price=24.0, rating=4.4, category=cate4}, ...)
// SearchResp.SearchResult(entity={id=15, price=25.0, rating=4.5, category=cate0}, ...)
// SearchResp.SearchResult(entity={id=16, price=26.0, rating=4.6, category=cate1}, ...)
// SearchResp.SearchResult(entity={id=17, price=27.0, rating=4.7, category=cate2}, ...)
// SearchResp.SearchResult(entity={id=18, price=28.0, rating=4.8, category=cate3}, ...)
// SearchResp.SearchResult(entity={id=19, price=29.0, rating=4.9, category=cate4}, ...)
// SearchResp.SearchResult(entity={id=20, price=30.0, rating=4.0, category=cate0}, ...)
```

</TabItem>

<TabItem value='go'>

```go
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

// Output
// IDs:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
// Prices: [11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 19.0, 20.0, 21.0, 22.0, 23.0, 24.0, 25.0, 26.0, 27.0, 28.0, 29.0, 30.0]
// Ratings: [4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.0]
```

</TabItem>

<TabItem value='rust'>

```rust
let query_vector = vec![0.35803764, -0.6023496, 0.18414013, -0.26286206, 0.90294385];
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("product_catalog")
            .vector_field("embedding")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(20)
            .output_fields(["id", "price", "rating", "category"])
            .order_by_fields(vec![
                OrderByField::new().field_name("price").direction(AggDirection::Asc),
                OrderByField::new().field_name("rating").direction(AggDirection::Desc),
            ])
            .build()?,
    )
    .await?;

for result in response.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
//
// [
//     {
//         "id": 1,
//         "price": 11.0,
//         "rating": 4.1,
//         "category": "cate1"
//     },
//     {
//         "id": 2,
//         "price": 12.0,
//         "rating": 4.2,
//         "category": "cate2"
//     },
//     {
//         "id": 3,
//         "price": 13.0,
//         "rating": 4.3,
//         "category": "cate3"
//     },
//     {
//         "id": 4,
//         "price": 14.0,
//         "rating": 4.4,
//         "category": "cate4"
//     },
//     {
//         "id": 5,
//         "price": 15.0,
//         "rating": 4.5,
//         "category": "cate0"
//     },
//     {
//         "id": 6,
//         "price": 16.0,
//         "rating": 4.6,
//         "category": "cate1"
//     },
//     {
//         "id": 7,
//         "price": 17.0,
//         "rating": 4.7,
//         "category": "cate2"
//     },
//     {
//         "id": 8,
//         "price": 18.0,
//         "rating": 4.8,
//         "category": "cate3"
//     },
//     {
//         "id": 9,
//         "price": 19.0,
//         "rating": 4.9,
//         "category": "cate4"
//     },
//     {
//         "id": 10,
//         "price": 20.0,
//         "rating": 4.0,
//         "category": "cate0"
//     },
//     {
//         "id": 11,
//         "price": 21.0,
//         "rating": 4.1,
//         "category": "cate1"
//     },
//     {
//         "id": 12,
//         "price": 22.0,
//         "rating": 4.2,
//         "category": "cate2"
//     },
//     {
//         "id": 13,
//         "price": 23.0,
//         "rating": 4.3,
//         "category": "cate3"
//     },
//     {
//         "id": 14,
//         "price": 24.0,
//         "rating": 4.4,
//         "category": "cate4"
//     },
//     {
//         "id": 15,
//         "price": 25.0,
//         "rating": 4.5,
//         "category": "cate0"
//     },
//     {
//         "id": 16,
//         "price": 26.0,
//         "rating": 4.6,
//         "category": "cate1"
//     },
//     {
//         "id": 17,
//         "price": 27.0,
//         "rating": 4.7,
//         "category": "cate2"
//     },
//     {
//         "id": 18,
//         "price": 28.0,
//         "rating": 4.8,
//         "category": "cate3"
//     },
//     {
//         "id": 19,
//         "price": 29.0,
//         "rating": 4.9,
//         "category": "cate4"
//     },
//     {
//         "id": 20,
//         "price": 30.0,
//         "rating": 4.0,
//         "category": "cate0"
//     }
// ]
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
    std::cerr ("price");
    const auto ratings = result.OutputField("rating");
    for (size_t i = 0; i Data()[i]
                  Data()[i]

// Output
// TopK: (id=1, price=11.0), (id=2, price=12.0), (id=3, price=13.0), (id=4, price=14.0), (id=5, price=15.0), (id=6, price=16.0), (id=7, price=17.0), (id=8, price=18.0), (id=9, price=19.0), (id=10, price=20.0), (id=11, price=21.0), (id=12, price=22.0), (id=13, price=23.0), (id=14, price=24.0), (id=15, price=25.0), (id=16, price=26.0), (id=17, price=27.0), (id=18, price=28.0), (id=19, price=29.0), (id=20, price=30.0)
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.search({
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

// Output
// [
//   { id: 1, price: 11.0, rating: 4.1, category: "cate1" },
//   { id: 2, price: 12.0, rating: 4.2, category: "cate2" },
//   { id: 3, price: 13.0, rating: 4.3, category: "cate3" },
//   { id: 4, price: 14.0, rating: 4.4, category: "cate4" },
//   { id: 5, price: 15.0, rating: 4.5, category: "cate0" },
//   { id: 6, price: 16.0, rating: 4.6, category: "cate1" },
//   { id: 7, price: 17.0, rating: 4.7, category: "cate2" },
//   { id: 8, price: 18.0, rating: 4.8, category: "cate3" },
//   { id: 9, price: 19.0, rating: 4.9, category: "cate4" },
//   { id: 10, price: 20.0, rating: 4.0, category: "cate0" },
//   { id: 11, price: 21.0, rating: 4.1, category: "cate1" },
//   { id: 12, price: 22.0, rating: 4.2, category: "cate2" },
//   { id: 13, price: 23.0, rating: 4.3, category: "cate3" },
//   { id: 14, price: 24.0, rating: 4.4, category: "cate4" },
//   { id: 15, price: 25.0, rating: 4.5, category: "cate0" },
//   { id: 16, price: 26.0, rating: 4.6, category: "cate1" },
//   { id: 17, price: 27.0, rating: 4.7, category: "cate2" },
//   { id: 18, price: 28.0, rating: 4.8, category: "cate3" },
//   { id: 19, price: 29.0, rating: 4.9, category: "cate4" },
//   { id: 20, price: 30.0, rating: 4.0, category: "cate0" }
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
var queryVector = new[] { new ReadOnlyMemory(new[] { 0.35803764f, -0.6023496f, 0.18414013f, -0.26286206f, 0.90294385f }) };
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "product_catalog",
    VectorFieldName = "embedding",
    Vectors = queryVector,
    Limit = 20,
    Parameters = new SearchParameters
    {
        OutputFields = { "id", "price", "rating", "category" },
        ExtraParameters = { ["order_by_fields"] = "price:asc,rating:desc" }
    }
});

// Output
// {Id=1, Price=11.0}, {Id=2, Price=12.0}, {Id=3, Price=13.0}, {Id=4, Price=14.0}, {Id=5, Price=15.0}, {Id=6, Price=16.0}, {Id=7, Price=17.0}, {Id=8, Price=18.0}, {Id=9, Price=19.0}, {Id=10, Price=20.0}, {Id=11, Price=21.0}, {Id=12, Price=22.0}, {Id=13, Price=23.0}, {Id=14, Price=24.0}, {Id=15, Price=25.0}, {Id=16, Price=26.0}, {Id=17, Price=27.0}, {Id=18, Price=28.0}, {Id=19, Price=29.0}, {Id=20, Price=30.0}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
    "collectionName": "product_catalog",
    "data": [[0.35803764, -0.6023496, 0.18414013, -0.26286206, 0.90294385]],
    "annsField": "embedding",
    "limit": 20,
    "outputFields": ["id", "price", "rating", "category"],
    "orderByFields": ["price:asc", "rating:desc"]
}'

# {
#     "code": 0,
#     "data": [
#         {
#             "id": 1,
#             "price": 11.0,
#             "rating": 4.1,
#             "category": "cate1"
#         },
#         {
#             "id": 2,
#             "price": 12.0,
#             "rating": 4.2,
#             "category": "cate2"
#         },
#         {
#             "id": 3,
#             "price": 13.0,
#             "rating": 4.3,
#             "category": "cate3"
#         },
#         {
#             "id": 4,
#             "price": 14.0,
#             "rating": 4.4,
#             "category": "cate4"
#         },
#         {
#             "id": 5,
#             "price": 15.0,
#             "rating": 4.5,
#             "category": "cate0"
#         },
#         {
#             "id": 6,
#             "price": 16.0,
#             "rating": 4.6,
#             "category": "cate1"
#         },
#         {
#             "id": 7,
#             "price": 17.0,
#             "rating": 4.7,
#             "category": "cate2"
#         },
#         {
#             "id": 8,
#             "price": 18.0,
#             "rating": 4.8,
#             "category": "cate3"
#         },
#         {
#             "id": 9,
#             "price": 19.0,
#             "rating": 4.9,
#             "category": "cate4"
#         },
#         {
#             "id": 10,
#             "price": 20.0,
#             "rating": 4.0,
#             "category": "cate0"
#         },
#         {
#             "id": 11,
#             "price": 21.0,
#             "rating": 4.1,
#             "category": "cate1"
#         },
#         {
#             "id": 12,
#             "price": 22.0,
#             "rating": 4.2,
#             "category": "cate2"
#         },
#         {
#             "id": 13,
#             "price": 23.0,
#             "rating": 4.3,
#             "category": "cate3"
#         },
#         {
#             "id": 14,
#             "price": 24.0,
#             "rating": 4.4,
#             "category": "cate4"
#         },
#         {
#             "id": 15,
#             "price": 25.0,
#             "rating": 4.5,
#             "category": "cate0"
#         },
#         {
#             "id": 16,
#             "price": 26.0,
#             "rating": 4.6,
#             "category": "cate1"
#         },
#         {
#             "id": 17,
#             "price": 27.0,
#             "rating": 4.7,
#             "category": "cate2"
#         },
#         {
#             "id": 18,
#             "price": 28.0,
#             "rating": 4.8,
#             "category": "cate3"
#         },
#         {
#             "id": 19,
#             "price": 29.0,
#             "rating": 4.9,
#             "category": "cate4"
#         },
#         {
#             "id": 20,
#             "price": 30.0,
#             "rating": 4.0,
#             "category": "cate0"
#         }
#     ],
#     "topks":[20]
# }
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz vector search \
  --collection product_catalog \
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
  "annsField": "embedding",
  "outputFields": [
    "id",
    "price",
    "rating",
    "category"
  ],
  "orderByFields": [
    "price:asc",
    "rating:desc"
  ],
  "limit": 20
}' \
  --output json
```

</TabItem>
</Tabs>

对于在所有指定排序字段上取值都相同的 Entity，Zilliz Cloud 会保留它们原本按相似度得分排列的顺序。

## 使用 Limit 和 Offset 参数\{#use-limit}

通过上面的代码示例，您可能注意到了用于控制 Search 结果中的 Entity 数量的 `limit` 参数。这个参数代表单次查询结果中要求包含的 Entity 的最大数量，一般称之为 **topK**。

如果您希望进行分页查询，可以循环发送 Search 请求，并在每次查询请求中都携带 Limit 和 Offset 参数。具体来说，可以将 Limit 参数设置为当次查询的结果中需要包含的 Entity 数量，Offset 设置为之前已经返回的所有 Entity 的数量。

下表罗列了以每次返回 100 个 Entity 的速度进行分页查询时如何设置 Limit 和 Offset 参数。

|  | 单页返回 Entity 数量（Limit） | 已返回 Entity 总数量（Offset） |
| --- | --- | --- |
| 第 1 次 | 100 | 0 |
| 第 2 次 | 100 | 100 |
| 第 3 次 | 100 | 200 |
| 第 n 次 | 100 | 100 x (n - 1) |

需要注意的是，ANN Search 单次召回 Entity 的数量为 `offset` 和 `limit` 两个参数之和，最大不超过 16,384。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        # highlight-next-line
        "offset": 10 # The records to skip
    }
)

# [
#     [
#         {
#             "id": 3,
#             "distance": 0.4527677893638611,
#             "entity": {}
#         },
#     [
#         {
#             "id": 13,
#             "distance": 0.4527677893638611,
#             "entity": {}
#         },
#     [
#         {
#             "id": 7,
#             "distance": 0.4388217329978943,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .offset(10)
        .build();

SearchResp searchResp = client.search(searchReq);

List> searchResults = searchResp.getSearchResults();
for (List results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=0.4527677893638611, id=3)
// SearchResp.SearchResult(entity={}, score=0.4527677893638611, id=13)
// SearchResp.SearchResult(entity={}, score=0.4388217329978943, id=7)
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

// Output
// IDs:  [3, 13, 7]
// Scores: [0.4527677893638611, 0.4527677893638611, 0.4388217329978943]
```

</TabItem>

<TabItem value='rust'>

```rust
// 4. Single vector search
let query_vector = vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("quick_setup")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(3)
            .offset(10)
            .build()?,
    )
    .await?;

for result in response.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
// EntityRow { id: 3, ... }, EntityRow { id: 13, ... }, EntityRow { id: 7, ... }
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
    std::cerr

// Output
// TopK: (id=3, distance=0.4527677893638611), (id=13, distance=0.4527677893638611), (id=7, distance=0.4388217329978943)
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

// [
//   { score: 0.4527677893638611, id: '3' },
//   { score: 0.4527677893638611, id: '13' },
//   { score: 0.4388217329978943, id: '7' }
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
var queryVector = new[] { new ReadOnlyMemory(new[] { 0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f }) };
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "quick_setup",
    VectorFieldName = "vector",
    Vectors = queryVector,
    Limit = 3,
    Parameters = new SearchParameters { Offset = 10 }
});

// Output
// {Id=3, Distance=0.4527677893638611}, {Id=13, Distance=0.4527677893638611}, {Id=7, Distance=0.4388217329978943}
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

# {
#     "code": 0,
#     "data": [
#         {
#             "distance": 0.4527677893638611,
#             "id": 3
#         },
#         {
#             "distance": 0.4527677893638611,
#             "id": 13
#         },
#         {
#             "distance": 0.4388217329978943,
#             "id": 7
#         },
#     ],
#     "topks":[3]
# }
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

## 使用 Level 参数\{#use-level}

检索调优要求根据不同的索引类型调整不同的参数。Zilliz Cloud 使用了一个统一的检索精度控制参数 `level`，简化了检索参数调优的过程。

该参数默认值为 `1`，最大值为 `10`。调升参数值会提高召回率，但会相对降低检索性能。通常情况下，默认的检索精度可以支撑 90% 左右的召回率，基本满足大多数场景需求。如需更高的召回率，可以尝试调升该参数。

<Admonition type="info" title="说明">

查询参数 `Level` 当前仍处于公测阶段。如果您设置了高于 `5` 的值而搜索结果没有变化，您的 Cluster 可能尚未支持该参数。您可以继续按照 `1` - `5` 的范围调节召回效果或联系 [Zilliz Cloud 支持](https://zilliz.com.cn/contact-sales)。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

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

# [
#     [
#         {
#             "id": 0,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#     [
#         {
#             "id": 10,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#     [
#         {
#             "id": 4,
#             "distance": 0.9902134537696838,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
Map params = new HashMap<>();
params.put("level", 10);
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .searchParams(params)
        .build();

SearchResp searchResp = client.search(searchReq);

List> searchResults = searchResp.getSearchResults();
for (List results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=0)
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=10)
// SearchResp.SearchResult(entity={}, score=0.9902134537696838, id=4)
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

// Output
// IDs:  [0, 10, 4]
// Scores: [1.4093276262283325, 1.4093276262283325, 0.9902134537696838]
```

</TabItem>

<TabItem value='rust'>

```rust
// 4. Single vector search
let query_vector = vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("quick_setup")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(3)
            .extra_params(HashMap::from([("level".into(), "10".into())]))
            .build()?,
    )
    .await?;

for result in response.results() {
    println!("TopK results:");
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
// EntityRow { id: 0, ... }, EntityRow { id: 10, ... }, EntityRow { id: 4, ... }
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("quick_setup")
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .AddFloatVector(query_vector)
                   .AddExtraParam("level", "10");

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout

// Output
// TopK: (id=0, distance=1.4093276262283325), (id=10, distance=1.4093276262283325), (id=4, distance=0.9902134537696838)
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

// [
//   { score: 1.4093276262283325, id: '0' },
//   { score: 1.4093276262283325, id: '10' },
//   { score: 0.9902134537696838, id: '4' }
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
var queryVector = new[] { new ReadOnlyMemory(new[] { 0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f }) };
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "quick_setup",
    VectorFieldName = "vector",
    Vectors = queryVector,
    Limit = 3,
    Parameters = new SearchParameters { ExtraParameters = { ["level"] = "10" } }
});

// Output
// {Id=0, Distance=1.4093276262283325}, {Id=10, Distance=1.4093276262283325}, {Id=4, Distance=0.9902134537696838}
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

# {"code":0,"cost":0,"data":[{"distance":1.4093276262283325,"id":0},{"distance":1.4093276262283325,"id":10},{"distance":0.9902134537696838,"id":4},{"distance":1.3017789125442505,"id":1},{"distance":1.3017789125442505,"id":11},{"distance":1.2419954538345337,"id":7}],"topks":[3]}
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

## 查看召回率\{#get-recall-rate}

您还可以在调节 `level` 参数期间将 `enable_recall_rate` 参数设置为 `true`，以便在搜索结果中查看当前 `level` 值对应的召回率信息。

<Admonition type="info" title="说明">

查询参数 `enable_recall_rate` 当前仍处于公测阶段。您的集群可能尚未支持该参数。如需体验，可以联系 [Zilliz Cloud 支持](https://zilliz.com.cn/contact-sales)。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            # highlight-next-line
            "level": 10, # The precision control
            "enable_recall_calculation": True # Ask to return recall rate
        }
    }
)

# [
#     [
#         {
#             "id": 0,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#     [
#         {
#             "id": 10,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#     [
#         {
#             "id": 4,
#             "distance": 0.9902134537696838,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
Map params = new HashMap<>();
params.put("level", 10);
params.put("enable_recall_calculation", true);
SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .searchParams(params)
        .build();

SearchResp searchResp = client.search(searchReq);

List> searchResults = searchResp.getSearchResults();
for (List results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=0)
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=10)
// SearchResp.SearchResult(entity={}, score=0.9902134537696838, id=4)
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

// Output
// IDs:  [0, 10, 4]
// Scores: [1.4093276262283325, 1.4093276262283325, 0.9902134537696838]
```

</TabItem>

<TabItem value='rust'>

```rust
// 4. Single vector search
let query_vector = vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("quick_setup")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(3)
            .extra_params(HashMap::from([
                ("level".into(), "10".into()),
                ("enable_recall_calculation".into(), "true".into()),
            ]))
            .build()?,
    )
    .await?;

for result in response.results() {
    println!("TopK results:");
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
// EntityRow { id: 0, ... }, EntityRow { id: 10, ... }, EntityRow { id: 4, ... }
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
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
    std::cout

// Output
// TopK: (id=0, distance=1.4093276262283325), (id=10, distance=1.4093276262283325), (id=4, distance=0.9902134537696838)
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
        "level": 10, // The precision control
        "enable_recall_calculation": true // Ask to return recall rate
    }
})

// [
//   { score: 1.4093276262283325, id: '0' },
//   { score: 1.4093276262283325, id: '10' },
//   { score: 0.9902134537696838, id: '4' }
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
var queryVector = new[] { new ReadOnlyMemory(new[] { 0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f }) };
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "quick_setup",
    VectorFieldName = "vector",
    Vectors = queryVector,
    Limit = 3,
    Parameters = new SearchParameters
    {
        ExtraParameters = { ["level"] = "10", ["enable_recall_calculation"] = "true" }
    }
});

// Output
// {Id=0, Distance=1.4093276262283325}, {Id=10, Distance=1.4093276262283325}, {Id=4, Distance=0.9902134537696838}
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

# {"code":0,"cost":0,"data":[{"distance":1.4093276262283325,"id":0},{"distance":1.4093276262283325,"id":10},{"distance":0.9902134537696838,"id":4},{"distance":1.3017789125442505,"id":1},{"distance":1.3017789125442505,"id":11},{"distance":1.2419954538345337,"id":7}],"topks":[3]}
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Recall-rate metadata is not currently exposed by the CLI.
```

</TabItem>
</Tabs>

## 为 Search 临时设置一个时区\{#temporarily-set-a-timezone-for-a-search}

如果你的 Collection 包含 `TIMESTAMPTZ` 字段，你可以在一次操作中通过在 search 调用中设置 `timezone` 参数，临时覆盖 Database 或 Collection 的默认时区。这会控制在该次操作中 `TIMESTAMPTZ` 值的显示和比较方式。

以下示例展示了如何为 search 操作设置临时时区：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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

# [
#     [
#         {
#             "id": 0,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#     [
#         {
#             "id": 10,
#             "distance": 1.4093276262283325,
#             "entity": {}
#         },
#     [
#         {
#             "id": 4,
#             "distance": 0.9902134537696838,
#             "entity": {}
#         }
#     ]
# ]
```

</TabItem>

<TabItem value='java'>

```java
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

// Output
// TopK results:
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=0)
// SearchResp.SearchResult(entity={}, score=1.4093276262283325, id=10)
// SearchResp.SearchResult(entity={}, score=0.9902134537696838, id=4)
```

</TabItem>

<TabItem value='go'>

```go
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

// Output
// IDs:  [0, 10, 4]
// Scores: [1.4093276262283325, 1.4093276262283325, 0.9902134537696838]
```

</TabItem>

<TabItem value='rust'>

```rust
let query_vector = vec![0.35803764, -0.6023496, 0.18414013, -0.26286206, 0.90294385];
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("quick_setup")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(3)
            .timezone("America/Havana")
            .build()?,
    )
    .await?;

for result in response.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}

// Output
// EntityRow { id: 0, ... }, EntityRow { id: 10, ... }, EntityRow { id: 4, ... }
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
    std::cerr ("event_time");
    for (size_t i = 0; i Data()[i]

// Output
// TopK: (id=0, distance=1.4093276262283325), (id=10, distance=1.4093276262283325), (id=4, distance=0.9902134537696838)
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.search({
    collection_name: "quick_setup",
    anns_field: "vector",
    data: query_vector,
    limit: 3,
    metric_type: "IP",
    // highlight-next-line
    params: { timezone: "America/Havana" },
})

console.log(res.results)

// [
//   { score: 1.4093276262283325, id: '0' },
//   { score: 1.4093276262283325, id: '10' },
//   { score: 0.9902134537696838, id: '4' }
// ]
```

</TabItem>

<TabItem value='csharp'>

```csharp
var queryVector = new[] { new ReadOnlyMemory(new[] { 0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f }) };
var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "quick_setup",
    VectorFieldName = "vector",
    Vectors = queryVector,
    Limit = 3,
    Parameters = new SearchParameters { Timezone = "America/Havana" }
});

// Output
// {Id=0, Distance=1.4093276262283325}, {Id=10, Distance=1.4093276262283325}, {Id=4, Distance=0.9902134537696838}
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

# {
#     "code": 0,
#     "data": [
#         {
#             "distance": 1.4093276262283325,
#             "id": 0
#         },
#         {
#             "distance": 1.4093276262283325,
#             "id": 10
#         },
#         {
#             "distance": 0.9902134537696838,
#             "id": 4
#         },
#     ],
#     "topks":[3]
# }
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

参数 `timezone` 的值必须是有效的 [IANA 时区标识符](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)，例如 **Asia/Shanghai**、**America/Chicago** 或 **UTC**。关于如何使用 `TIMESTAMPTZ` 字段的详细信息，请参见[TIMESTAMPTZ 类型](./use-timestamptz-field)。

## ANN Search 能力增强\{#enhancing-ann-search}

Zilliz Cloud 提供的 AUTOINDEX 已经极大地降低了执行 ANN Search 的门槛，但在大规模召回的情况下依旧很难避免遇到类似返回与查询向量不相关的 Entity 等各种问题。按照缩小搜索范围、提升召回质量和提升召回结果多样性的思路，Milvus 提供了如下几种能力：

- Filtered Search

    ANN Search 支持在请求中携带过滤条件表达式，并在执行向量搜索前根据过滤条件表达式过滤出与之匹配的 Entity。通过这种方式，向量搜索的范围由整个 Collection 中的所有 Entity 缩小到与过滤条件表达式匹配的所有 Entity 了。

    关于标量过滤和过滤条件表达式的更多内容，可查看[Filtered Search](./filtered-search)和[过滤表达式概览](./filtering-overview)。

- Range Search

    Range Search 是通过指定相似度得分范围的方式提升 ANN Search 的召回质量。在执行 Range Search 时，Zilliz Cloud 会以 ANN Search 召回结果中与查询向量最相似的向量为圆心，以 Search 请求中指定的 radius 值为外圆半径，以 range_filter 为内圆半径画两个同心圆。所有相似度得分落在由这两个同心圆构成的圆环上的向量会被返回。 

    关于 Range Search 的更多内容，可查看 [Range Search](./range-search)。

- Grouping Search

    如果召回结果中所有 Entity 在某个标量字段上的取值都相同时，召回结果可能并不能真实反映与查询向量相似的所有向量在向量空间中的分布情况。为了提升召回结果的多样性，可以考虑使用 Grouping Search。

    关于 Grouping Search 的更多内容，可查看[Grouping Search](./grouping-search)。

- Hybrid Search

    Zilliz Cloud 支持在创建 Collection 时设置多个向量字段，用于存放使用不同的 Embedding 模型生成的向量数据。在此基础上，您可以使用 Hybrid Search 功能混合不同向量字段的多路召回结果并对它们进行混合排序，尝试得到更为精准的召回结果。

    关于 Hybrid Search 的更多内容，可查看[Hybrid Search](./hybrid-search)。

    如需了解 Collection 中向量字段的数量限制，请参考[使用限制](./limits#fields)。

- Search Iterator

    ANN Search 单次召回有最大数量限制。对于 topK 大于 16,384 的 ANN Search 请求，可以考虑使用 Search Iterator。

    关于 Search Iterator 的更多内容，可查看[Search Iterator](./with-iterators)。

- Full-Text Search

    Full-Text Search 是一项能在文本数据集中检索包含特定术语或短语的文档，然后根据相关性对结果进行排序的功能。该功能克服了语义搜索的局限性，语义搜索可能会忽略精确的术语，而全文搜索可确保你获得最准确且与上下文相关的结果。此外，它通过接受原始文本输入简化了向量搜索，能自动将你的文本数据转换为稀疏嵌入，无需手动生成向量嵌入。

    关于 Full-Text Search 的更多内容，可查看[Full Text Search](./full-text-search)。

- Text Match

    Zilliz Cloud 中的 Text Match 功能可基于特定术语实现精确的文档检索。此功能主要用于过滤式搜索，以满足特定条件，并且可以结合标量过滤来优化查询结果，从而在符合标量条件的向量中进行相似性搜索。

    关于 Text Match 的更多内容，可查看[Text Match](./text-match)。

- 使用 Partition Key

    如果参与过滤的标量字段过多、过滤条件表达式过于复杂，都可能会对召回效率带来负面影响。Zilliz Cloud 提出了 Partition Key 这个概念。通过将 Collection 中某一标量字段指定为 Partition Key，并在 Search 请求中使用仅包含 Partition Key 的过滤条件表达式，可以快速将搜索范围缩小到指定 Partition Key 值对应的若干 Partition。

    关于 Partition Key 的更多内容，可查看[使用 Partition Key](./use-partition-key)。

- 使用 mmap

    关于 mmap 设置的相关内容，可以查看[使用 mmap](./use-mmap)。

- 使用搜索重排

    关于如何使用 Ranker 重排搜索结果，可以查看 [Boost Ranker](./boost-ranker)、[Decay Ranker 概述](./decay-ranker-oveview) 等相关文档。

