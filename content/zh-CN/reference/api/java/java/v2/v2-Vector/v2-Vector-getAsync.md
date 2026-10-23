---
title: "getAsync() | Java | v2"
slug: /java/java/v2-Vector-getAsync
sidebar_label: "getAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过 ID 异步获取特定 Entity，并返回一个 future。 | Java | v2"
type: docx
token: BvuWd2mJUotj3kxXhbqczE9Zn3U
sidebar_position: 13
keywords: 
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - 开源向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - getAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getAsync()

此操作通过 ID 异步获取特定 Entity，并返回一个 future。

```java
public CompletableFuture<GetResp> getAsync(GetReq request)
```

此方法使用与 `get()` 相同的请求参数，但会立即返回一个 `CompletableFuture<GetResp>`。使用返回的 future 读取结果，或在操作失败时处理异常完成。

## 请求语法\{#request-syntax}

```java
CompletableFuture<GetResp> future = client.getAsync(GetReq.builder()
    .collectionName(String collectionName)
    .ids(List<Object> ids)
    .build());
```

有关 `GetReq` 构建器方法的完整列表，请参见 get()。

**返回类型：**

*CompletableFuture&lt;GetResp&gt;*

**返回：**

一个已完成并包含 `GetResp` 的 future；操作失败时，该 future 会以异常方式完成。

**参数：**

- **queryResults** (*List&lt;QueryResp.QueryResult&gt;*) -

    查询结果列表，其中每个查询结果都包含以下字段：

    - **entity** (*Map&lt;String,Object&gt;*) -

        包含所匹配 Entity 的字段名称和值的映射。

    - **elementOffset** (*Long*) -

        对于通过 `element_filter` 进行的结构体数组元素级查询，表示匹配元素在数组中的索引。对于普通查询，此值为 null。

- **sessionTs** (*long*) -

    本次读取的会话时间戳。

- **cost** (*Long*) -

    操作耗时。

- **scannedRemoteBytes** (*Long*) -

    操作期间远程扫描的字节数。

- **scannedTotalBytes** (*Long*) -

    操作期间扫描的总字节数。

- **cacheHitRatio** (*Float*) -

    操作期间的缓存命中率。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<GetResp> future = client.getAsync(GetReq.builder()
        .collectionName("my_collection")
        .ids(Collections.singletonList("0"))
        .build());
GetResp response = future.get();
```
