---
title: "dropPartition() | Java | v2"
slug: /java/java/v2-Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作从当前 collection 中删除指定的 partition。 | Java | v2"
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

此操作从当前 collection 中删除指定的 partition。

在删除 partition 之前，您必须先将其释放。

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

**BUILDER 方法：**

- `databaseName(String databaseName)`

    目标 collection 所属数据库的名称。

- `collectionName(String collectionName)`

    （必需）现有 collection 的名称。

- `partitionName(String partitionName)`

    （必需）要删除的 partition 名称。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.DropPartitionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop partition "test_partition"
DropPartitionReq dropPartitionReq = DropPartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.dropPartition(dropPartitionReq);
```

