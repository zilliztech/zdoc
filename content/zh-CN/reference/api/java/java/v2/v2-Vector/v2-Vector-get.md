---
title: "get() | Java | v2"
slug: /java/java/v2-Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过 ID 获取特定 Entity。 | Java | v2"
type: docx
token: Xl3QdxmFxo3MNCxWlrxc9jFbnFc
sidebar_position: 2
keywords: 
  - LLM 作为评判者
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - get()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# get()

此操作通过 ID 获取特定 Entity。

```java
public GetResp get(GetReq request)
```

## 请求语法\{#request-syntax}

```java
get(GetReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionName(String partitionName)
    .partitionNames(List<String> partitionNames)
    .ids(List<Object> ids)
    .outputFields(List<String> outputFields)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标 Collection 所属 Database 的名称。

- `collectionName(String collectionName)`

    现有 Collection 的名称。

- `clusterId(String clusterId)`

    要查询的集群的 ID。适用于 global-cluster 部署。

- `partitionName(String partitionName)`

    Partition 的名称。

- `partitionNames(List<String> partitionNames)`

    要查询的 Partition 名称列表。

- `ids(List<Object> ids)`

    特定 Entity ID 或 Entity ID 列表。

- `outputFields(List<String> outputFields)`

    要包含在查询结果中的字段名称列表。

**返回类型：**

*GetResp*

**返回：**

**GetResp** 对象，表示一个或多个已查询的 Entity，并在可用时包含操作成本（`getCost()`）和扫描字节数指标（`getScannedRemoteBytes()`、`getScannedTotalBytes()`、`getCacheHitRatio()`）。

**参数：**

- **getResults** (*List&lt;QueryResp.QueryResult&gt;*) -

    已检索 Entity 的列表。每个 **QueryResp.QueryResult** 都包含以下字段：

    - **entity** (*Map&lt;String,Object&gt;*) -

        包含字段名称及其值的键值对映射。

    - **elementOffset** (*Long*) -

        对于结构体数组元素级查询，表示匹配元素在数组中的索引。对于普通查询，此值为 null。

- **sessionTs** (*long*) -

    本次读取的会话时间戳。

- **cost** (*Long*) -

    操作耗时。

- **scannedRemoteBytes** (*Long*) -

    查询期间远程扫描的字节数。

- **scannedTotalBytes** (*Long*) -

    查询期间扫描的总字节数。

- **cacheHitRatio** (*Float*) -

    查询的缓存命中率。

- **fields** (*Map&lt;String,Object&gt;*) -

    包含字段名称及其值的键值对映射。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get entity with id 0
GetReq getReq = GetReq.builder()
        .collectionName("test")
        .ids(Collections.singletonList("0"))
        .build();
GetResp getResp = client.get(getReq);
```
