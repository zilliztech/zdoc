---
title: "getPartitionStats() | Java | v2"
slug: /java/java/v2-Partitions-getPartitionStats
sidebar_label: "getPartitionStats()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "除 Entity 计数外，还返回完整的 Partition 统计信息映射。 | Java | v2"
type: docx
token: TOfvdLLzaoWJydxBTPQcKevfndd
sidebar_position: 3
keywords: 
  - 检索增强生成
  - 大型语言模型
  - 向量化
  - k 最近邻算法
  - zilliz
  - zilliz cloud
  - 云
  - getPartitionStats()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPartitionStats()

除 Entity 计数外，还返回完整的 Partition 统计信息映射。

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

**构建器方法：**

- `databaseName(String databaseName)`

    Database 名称。省略时默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `partitionName(String partitionName)`

    目标 Partition 的名称。

**返回：**

*GetPartitionStatsResp*

包含 numOfEntities 以及 Milvus 返回的完整统计信息映射。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示如何使用经过审查的 v3.0.x API 调用 getPartitionStats()。

```java
GetPartitionStatsResp response = client.getPartitionStats(GetPartitionStatsReq.builder()
    .collectionName("books")
    .partitionName("history")
    .build());
Map<String, String> stats = response.getStats();
```
