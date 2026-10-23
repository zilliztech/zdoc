---
title: "searchAsync() | Java | v2"
slug: /java/java/v2-Vector-searchAsync
sidebar_label: "searchAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作异步执行向量搜索并返回一个 future。 | Java | v2"
type: docx
token: DONndM4QbouPN1xdGujcWedRnXb
sidebar_position: 17
keywords: 
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - Zilliz
  - Zilliz Cloud
  - 云
  - searchAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# searchAsync()

此操作异步执行向量搜索并返回一个 future。

```java
public CompletableFuture<SearchResp> searchAsync(SearchReq request)
```

此方法使用与 `search()` 相同的请求参数，但会立即返回一个 `CompletableFuture<SearchResp>`。请使用返回的 future 消费结果，或在操作失败时处理异常完成。

## 请求语法\{#request-syntax}

```java
CompletableFuture<SearchResp> future = client.searchAsync(SearchReq.builder()
    .collectionName(String collectionName)
    .data(List<BaseVector> data)
    .annsField(String annsField)
    .limit(long limit)
    .build());
```

有关 `SearchReq` 构建器方法的完整列表，请参见 search()。

**返回类型：**

*CompletableFuture&lt;SearchResp&gt;*

**返回：**

一个以 `SearchResp` 完成的 future，或在操作失败时以异常方式完成。

**参数：**

- **searchResults** （*List&lt;List&lt;SearchResult&gt;&gt;*） -

    搜索结果批次列表，每个查询向量对应一个批次，每个批次包含具有以下字段的 **SearchResult** 条目：

- **id** （*Object*） -

    匹配 Entity 的主键值。

- **score** （*Float*） -

    匹配项的相关性分数。

- **entity** （*Map&lt;String,Object&gt;*） -

    包含匹配 Entity 的字段名称和值的映射。

- **primaryKey** （*String*） -

    Entity 主键字段的名称。

- **highlightResults** （*Map&lt;String,HighlightResult&gt;*） -

    在请求高亮时，以字段名称为键的高亮结果。

- **sessionTs** （*long*） -

    读取的会话时间戳。

- **recalls** （*List&lt;Float&gt;*） -

    如已报告，则为每个查询向量的召回率。

- **cost** （*Long*） -

    操作的时间开销。

- **scannedRemoteBytes** （*Long*） -

    搜索期间远程扫描的字节数。

- **scannedTotalBytes** （*Long*） -

    搜索期间扫描的总字节数。

- **cacheHitRatio** （*Float*） -

    搜索的缓存命中率。

- **aggregationBuckets** （*List&lt;List&lt;AggregationBucket&gt;&gt;*） -

    在请求聚合时，按查询向量分组的聚合桶。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<SearchResp> future = client.searchAsync(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f})))
        .annsField("vector")
        .limit(10)
        .build());
SearchResp response = future.get();
```
