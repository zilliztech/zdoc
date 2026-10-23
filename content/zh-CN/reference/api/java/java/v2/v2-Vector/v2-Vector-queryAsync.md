---
title: "queryAsync() | Java | v2"
slug: /java/java/v2-Vector-queryAsync
sidebar_label: "queryAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会异步查询 Collection 中的 Entity，并返回一个 future。 | Java | v2"
type: docx
token: PWzJdbh5ZoT8K7xo1j4cbvNsnWe
sidebar_position: 16
keywords: 
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - 多模态 RAG
  - Zilliz
  - Zilliz Cloud
  - 云
  - queryAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# queryAsync()

此操作会异步查询 Collection 中的 Entity，并返回一个 future。

```java
public CompletableFuture<QueryResp> queryAsync(QueryReq request)
```

此方法使用与 `query()` 相同的请求参数，但会立即返回 `CompletableFuture<QueryResp>`。使用返回的 future 读取结果，或在操作失败时处理异常完成。

## 请求语法\{#request-syntax}

```java
CompletableFuture<QueryResp> future = client.queryAsync(QueryReq.builder()
    .collectionName(String collectionName)
    .filter(String filter)
    .outputFields(List<String> outputFields)
    .build());
```

有关 `QueryReq` 构建器方法的完整列表，请参见 query()。

**返回类型：**

*CompletableFuture&lt;QueryResp&gt;*

**返回：**

一个以 `QueryResp` 正常完成的 future；如果操作失败，则该 future 以异常方式完成。

**参数：**

- **queryResults** (*List&lt;QueryResp.QueryResult&gt;*) -

    查询结果列表，其中每个结果包含以下字段：

- **entity** (*Map&lt;String,Object&gt;*) -

    一个包含匹配 Entity 的字段名和值的映射。

- **elementOffset** (*Long*) -

    对于 struct-array 元素级查询，表示匹配元素在数组中的索引。对于普通查询，该值为 null。

- **sessionTs** (*long*) -

    本次读取的会话时间戳。

- **cost** (*Long*) -

    操作的时间开销。

- **scannedRemoteBytes** (*Long*) -

    查询期间远程扫描的字节数。

- **scannedTotalBytes** (*Long*) -

    查询期间扫描的总字节数。

- **cacheHitRatio** (*Float*) -

    查询的缓存命中率。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<QueryResp> future = client.queryAsync(QueryReq.builder()
        .collectionName("my_collection")
        .filter("age > 20")
        .outputFields(Arrays.asList("name", "age"))
        .build());
QueryResp response = future.get();
```
