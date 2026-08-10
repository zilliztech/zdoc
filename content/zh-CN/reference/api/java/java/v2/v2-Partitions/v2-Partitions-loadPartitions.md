---
title: "loadPartitions() | Java | v2"
slug: /java/java/v2-Partitions-loadPartitions
sidebar_label: "loadPartitions()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会将指定 Collection 中的 Partition 从内存中释放。 | Java | v2"
type: docx
token: MH8cdNxkgoliJ5xU0f9cBKqunYe
sidebar_position: 6
keywords: 
  - RAG 向量 Database
  - 什么是向量数据库
  - 什么是向量 Database
  - 向量 Database 对比
  - zilliz
  - zilliz cloud
  - 云
  - loadPartitions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# loadPartitions()

此操作会将指定 Collection 中的 Partition 从内存中释放。

```java
public void loadPartitions(LoadPartitionsReq request)
```

## 请求语法\{#request-syntax}

```java
loadPartitions(LoadPartitionsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .numReplicas(Integer numReplicas)
    .sync(Boolean sync)
    .timeout(Long timeout)
    .refresh(Boolean refresh)
    .loadFields(List<String> loadFields)
    .skipLoadDynamicField(Boolean skipLoadDynamicField)
    .resourceGroups(List<String> resourceGroups)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 名称。若未指定，则默认为当前 Database。

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `partitionNames(List<String> partitionNames)` -

    要操作的 Partition 名称列表。

- `numReplicas(Integer numReplicas)` -

    要加载的副本数量。

- `sync(Boolean sync)` -

    是否同步等待操作完成。

- `timeout(Long timeout)` -

    超时时长（以毫秒为单位）。

- `refresh(Boolean refresh)` -

    是否刷新加载内容以包含新字段。

- `loadFields(List<String> loadFields)` -

    要加载的特定字段名称列表。

- `skipLoadDynamicField(Boolean skipLoadDynamicField)` -

    是否跳过加载动态字段。

- `resourceGroups(List<String> resourceGroups)` -

    用于负载均衡的资源组名称列表。

**返回值：**

*void*

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.LoadPartitionsReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Load partition in collection
LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq.builder()
        .collectionName("test")
        .partitionNames(Collections.singletonList("test_partition"))
        .build();
client.loadPartitions(loadPartitionsReq);
```
