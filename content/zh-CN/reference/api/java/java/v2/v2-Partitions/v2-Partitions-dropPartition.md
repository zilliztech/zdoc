---
title: "dropPartition() | Java | v2"
slug: /java/java/v2-Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会从当前集合中删除指定分区。 | Java | v2"
type: docx
token: CSaVdr3zao9zFpxaJBgcCTCYnPd
sidebar_position: 2
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - dropPartition()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropPartition()

此操作会从当前集合中删除指定分区。

在删除分区之前，您必须先将其释放。

```java
public void dropPartition(DropPartitionReq request)
```

## 请求语法\{#request-syntax}

```java
dropPartition(DropPartitionReq.builder()
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

    （必需）现有集合的名称。

- `partitionName(String partitionName)`

    （必需）要删除的分区名称。

**RETURNS：**

*void*

**EXCEPTIONS：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.DropPartitionReq;

// 1. 设置客户端
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. 删除分区 "test_partition"
DropPartitionReq dropPartitionReq = DropPartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.dropPartition(dropPartitionReq);
```

