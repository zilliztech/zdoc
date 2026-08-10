---
title: "createPartition() | Java | v2"
slug: /java/java/v2-Partitions-createPartition
sidebar_label: "createPartition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作将在目标 Collection 中创建一个 Partition。 | Java | v2"
type: docx
token: WE4gduIjooCgQUxcKyLcwQe1n3g
sidebar_position: 1
keywords: 
  - 相似性搜索
  - 多模态 RAG
  - llm 幻觉
  - 混合搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - createPartition()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createPartition()

此操作将在目标 Collection 中创建一个 Partition。

```java
public void createPartition(CreatePartitionReq request)
```

## 请求语法\{#request-syntax}

```java
createPartition(CreatePartitionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标 Collection 所属的 Database 名称。

- `collectionName(String collectionName)`

    （必需）现有 Collection 的名称。

- `partitionName(String partitionName)`

    （必需）要创建的 Partition 名称。

**返回值：**

*void*

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.CreatePartitionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a partition "test_partition" in collection "test"
CreatePartitionReq createPartitionReq = CreatePartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.createPartition(createPartitionReq);
```

