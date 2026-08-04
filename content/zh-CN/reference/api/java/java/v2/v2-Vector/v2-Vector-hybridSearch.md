---
title: "hybridSearch() | Java | v2"
slug: /java/java/v2-Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作对集合执行多向量搜索，并在重排序后返回搜索结果。 | Java | v2"
type: docx
token: R1NDdFPnVo4wTuxvHjFcozc8nMa
sidebar_position: 3
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - hybridSearch()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearch()

此操作对集合执行多向量搜索，并在重排序后返回搜索结果。

```java
public SearchResp hybridSearch(HybridSearchReq request)
```

## 请求语法\{#request-syntax}

```java
hybridSearch(HybridSearchReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionNames(List<String> partitionNames)
    .searchRequests(List<AnnSearchReq> searchRequests)
    .topK(int topK)
    .limit(long limit)
    .outFields(List<String> outFields)
    .offset(long offset)
    .roundDecimal(int roundDecimal)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .groupByFieldName(String groupByFieldName)
    .groupSize(Integer groupSize)
    .strictGroupSize(Boolean strictGroupSize)
    .functionScore(FunctionScore functionScore)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)`

    数据库名称。若未指定，则默认使用当前数据库。

- `collectionName(String collectionName)`

    目标集合的名称。

- `clusterId(String clusterId)`

    此向量读取请求的目标集群 ID。当多个请求需要共享同一个集群 ID 时，请使用 `session(String clusterId)`。

- `partitionNames(List<String> partitionNames)`

    要搜索的分区名称列表。

- `searchRequests(List<AnnSearchReq> searchRequests)`

    用于混合搜索的 AnnSearchReq 对象列表。

- `topK(int topK)`

    要返回的前 K 个结果数。

- `limit(long limit)`

    要返回的最大结果数。

- `outFields(List<String> outFields)`

    输出中要包含的字段名称列表。

- `offset(long offset)`

    返回结果前要跳过的结果数量。

- `roundDecimal(int roundDecimal)`

    对 distance/score 进行舍入时保留的小数位数。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    此操作的一致性级别。

- `groupByFieldName(String groupByFieldName)`

    用于对搜索结果进行分组的字段名称。

- `groupSize(Integer groupSize)`

    每组要返回的结果数量。

- `strictGroupSize(Boolean strictGroupSize)`

    是否严格执行组大小限制。

- `functionScore(FunctionScore functionScore)`

    用于自定义评分的 FunctionScore 对象。

**返回值：**

*SearchResp*

*SearchResp*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.ranker.WeightedRanker;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.common.ConsistencyLevel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// Build ANN search requests for multiple vector fields
List<AnnSearchReq> searchRequests = new ArrayList<>();
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("float_vector")
        .vectors(floatVectors)
        .params("{\"nprobe\": 10}")
        .limit(10)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("binary_vector")
        .vectors(binaryVectors)
        .limit(50)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("sparse_vector")
        .vectors(sparseVectors)
        .limit(100)
        .build());

// Hybrid search with WeightedRanker via FunctionScore
SearchResp searchResp = client.hybridSearch(HybridSearchReq.builder()
        .collectionName("my_collection")
        .searchRequests(searchRequests)
        .functionScore(FunctionScore.builder()
                .addFunction(WeightedRanker.builder()
                        .weights(Arrays.asList(0.2f, 0.5f, 0.6f))
                        .build())
                .build())
        .limit(5)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```
