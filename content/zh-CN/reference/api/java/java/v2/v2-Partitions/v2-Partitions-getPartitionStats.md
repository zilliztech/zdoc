---
title: "getPartitionStats() | Java | v2"
slug: /java/java/v2-Partitions-getPartitionStats
sidebar_label: "getPartitionStats()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "除实体数量外，还返回完整的分区统计信息映射。 | Java | v2"
type: docx
token: TOfvdLLzaoWJydxBTPQcKevfndd
sidebar_position: 3
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - getPartitionStats()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPartitionStats()

除实体数量外，还返回完整的分区统计信息映射。

```java
public GetPartitionStatsResp getPartitionStats(GetPartitionStatsReq request)
```

## 请求语法\{#request-syntax}

```java
GetPartitionStatsReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .build();
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    数据库名称。省略时默认使用当前数据库。

- `collectionName(String collectionName)`

    目标集合的名称。

- `partitionName(String partitionName)`

    目标分区的名称。

**RETURNS:**

*GetPartitionStatsResp*

包含 numOfEntities 以及 Milvus 返回的完整统计信息映射。

**EXCEPTIONS:**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示使用已审阅的 v3.0.x API 调用 getPartitionStats()。

```java
GetPartitionStatsResp response = client.getPartitionStats(GetPartitionStatsReq.builder()
    .collectionName("books")
    .partitionName("history")
    .build());
Map<String, String> stats = response.getStats();
```
