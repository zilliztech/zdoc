---
title: "hasPartition() | Java | v2"
slug: /java/java/v2-Partitions-hasPartition
sidebar_label: "hasPartition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作检查指定集合中是否存在指定分区。 | Java | v2"
type: docx
token: KVSUdHV0ho7nnwxeQKMcEL47nKe
sidebar_position: 4
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - hasPartition()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hasPartition()

此操作检查指定集合中是否存在指定分区。

```java
public Boolean hasPartition(HasPartitionReq request)
```

## 请求语法\{#request-syntax}

```java
hasPartition(HasPartitionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS：**

- `databaseName(String databaseName)`

    目标集合所属数据库的名称。

- `collectionName(String collectionName)`

    现有集合的名称。

- `partitionName(String partitionName)`

    要检查的分区名称。

**返回类型：**

*Boolean*

**返回：**

一个布尔值，表示指定分区是否存在。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.HasPartitionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Check is partition "test_partition" exists in collection
HasPartitionReq hasPartitionReq = HasPartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
Boolean res = client.hasPartition(hasPartitionReq);
```

