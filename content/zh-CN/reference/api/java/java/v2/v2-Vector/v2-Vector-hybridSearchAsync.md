---
title: "hybridSearchAsync() | Java | v2"
slug: /java/java/v2-Vector-hybridSearchAsync
sidebar_label: "hybridSearchAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用 Ranker 异步执行多向量相似性搜索，并返回一个 future。 | Java | v2"
type: docx
token: BqO8dsvRBoAZ5Mxgqhscqattnzh
sidebar_position: 15
keywords: 
  - ANNS
  - 向量搜索
  - knn 算法
  - HNSW
  - zilliz
  - zilliz cloud
  - 云
  - hybridSearchAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearchAsync()

此操作使用 Ranker 异步执行多向量相似性搜索，并返回一个 future。

```java
public CompletableFuture<SearchResp> hybridSearchAsync(HybridSearchReq request)
```

此方法使用与 `hybridSearch()` 相同的请求参数，但会立即返回一个 `CompletableFuture<SearchResp>`。使用返回的 future 读取结果，或在操作失败时处理异常完成。

## 请求语法\{#request-syntax}

```java
CompletableFuture<SearchResp> future = client.hybridSearchAsync(HybridSearchReq.builder()
    .collectionName(String collectionName)
    .searchRequests(List<AnnSearchReq> searchRequests)
    .ranker(FunctionScore ranker)
    .limit(long limit)
    .build());
```

有关 `HybridSearchReq` 构建器方法的完整列表，请参见 hybridSearch()。

**返回类型：**

*CompletableFuture&lt;SearchResp&gt;*

**返回：**

一个已完成并包含 `SearchResp` 的 future；操作失败时，该 future 会以异常方式完成。

**参数：**

- **searchResults** (*List&lt;List&lt;SearchResult&gt;&gt;*) -

    搜索结果批次列表，每个查询向量对应一个批次，每个批次包含具有以下字段的 **SearchResult** 条目：

    - **id** (*Object*) -

        匹配 Entity 的主键值。

    - **score** (*Float*) -

        重排后匹配项的相关性分数。

    - **entity** (*Map&lt;String,Object&gt;*) -

        包含匹配 Entity 的字段名称和值的映射。

    - **primaryKey** (*String*) -

        Entity 的主键字段名称。

    - **highlightResults** (*Map&lt;String,HighlightResult&gt;*) -

        以字段名称为键的高亮结果（在请求高亮时提供）。

    - **elementOffset** (*Long*) -

        对于结构体数组元素级匹配（通过 `element_filter`），表示匹配元素在数组中的索引。对于普通匹配，此值为 null。

- **sessionTs** (*long*) -

    本次读取的会话时间戳。

- **recalls** (*List&lt;Float&gt;*) -

    每个查询向量的召回率（如有报告）。

- **cost** (*Long*) -

    操作耗时。

- **scannedRemoteBytes** (*Long*) -

    搜索期间远程扫描的字节数。

- **scannedTotalBytes** (*Long*) -

    搜索期间扫描的总字节数。

- **cacheHitRatio** (*Float*) -

    搜索的缓存命中率。

- **aggregationBuckets** (*List&lt;List&lt;AggregationBucket&gt;&gt;*) -

    按查询向量分组的聚合桶（当请求聚合时）。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<SearchResp> future = client.hybridSearchAsync(HybridSearchReq.builder()
        .collectionName("my_collection")
        .searchRequests(Arrays.asList(
                AnnSearchReq.builder()
                        .vectorFieldName("dense_vector")
                        .vectors(Collections.singletonList(queryVector))
                        .build(),
                AnnSearchReq.builder()
                        .vectorFieldName("sparse_vector")
                        .vectors(Collections.singletonList(sparseVector))
                        .build()))
        .build());
SearchResp response = future.get();
```
