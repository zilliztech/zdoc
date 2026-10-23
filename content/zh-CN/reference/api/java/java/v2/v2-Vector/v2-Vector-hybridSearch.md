---
title: "hybridSearch() | Java | v2"
slug: /java/java/v2-Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在 Collection 上执行多向量搜索，并在重排后返回搜索结果。 | Java | v2"
type: docx
token: R1NDdFPnVo4wTuxvHjFcozc8nMa
sidebar_position: 3
keywords: 
  - Faiss
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - Zilliz
  - Zilliz Cloud
  - 云
  - hybridSearch()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearch()

此操作会在 Collection 上执行多向量搜索，并在重排后返回搜索结果。

```java
public SearchResp hybridSearch(HybridSearchReq request)
```

## 请求语法\{#request-syntax}

```java
hybridSearch(HybridSearchReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
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

    Database 的名称。如果未指定，则默认为当前 Database。

- `clusterId(String clusterId)`

    **已弃用。** 要查询的集群 ID。适用于 global-cluster 部署。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `partitionNames(List<String> partitionNames)`

    要作为目标的 Partition 名称列表。

- `searchRequests(List<AnnSearchReq> searchRequests)`

    用于混合搜索的 AnnSearchReq 对象列表。

- `topK(int topK)`

    要返回的排名靠前结果的数量。

- `limit(long limit)`

    要返回的最大结果数量。

- `outFields(List<String> outFields)`

    要包含在输出中的字段名称列表。

- `offset(long offset)`

    返回前要跳过的结果数量。

- `roundDecimal(int roundDecimal)`

    distance/score 舍入的小数位数。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    此操作的一致性级别。

- `groupByFieldName(String groupByFieldName)`

    用于对搜索结果进行分组的字段名称。

- `groupSize(Integer groupSize)`

    每组要返回的结果数量。

- `strictGroupSize(Boolean strictGroupSize)`

    是否严格强制执行分组大小。

- `functionScore(FunctionScore functionScore)`

    用于自定义评分的 FunctionScore 对象。

- `ranker(CreateCollectionReq.Function ranker)`

    **已弃用。** 应用于搜索结果的一个重排函数。建议使用 `functionScore()`。

**返回类型：**

*SearchResp*

**返回：**

一个 **SearchResp** 对象，包含来自所有查询向量的合并结果，并按重排策略排序。

**参数：**

- **searchResults** (*List&lt;List&lt;SearchResult&gt;&gt;*) -

    搜索结果批次列表，每个查询向量对应一个批次，每个批次包含具有以下字段的 **SearchResult** 条目：

    - **id** (*Object*) -

        匹配 Entity 的主键值。

    - **score** (*Float*) -

        重排后匹配 Entity 的相关性分数。

    - **entity** (*Map&lt;String,Object&gt;*) -

        包含匹配 Entity 的字段名称和值的映射。

    - **primaryKey** (*String*) -

        主键字段的名称。

    - **highlightResults** (*Map&lt;String,HighlightResult&gt;*) -

        按字段名称索引的高亮结果；在请求高亮时返回。

    - **elementOffset** (*Long*) -

        对于结构体数组的元素级匹配（通过 `element_filter`），表示匹配元素在数组中的索引。普通匹配时为空。

- **sessionTs** (*long*) -

    本次读取的会话时间戳。

- **recalls** (*List&lt;Float&gt;*) -

    每个查询向量的召回率；在报告时提供。

- **cost** (*Long*) -

    此操作的时间开销。

- **scannedRemoteBytes** (*Long*) -

    搜索期间远程扫描的字节数。

- **scannedTotalBytes** (*Long*) -

    搜索期间扫描的总字节数。

- **cacheHitRatio** (*Float*) -

    搜索的缓存命中率。

- **aggregationBuckets** (*List&lt;List&lt;AggregationBucket&gt;&gt;*) -

    按查询向量分组的聚合桶；在请求聚合时返回。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

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
