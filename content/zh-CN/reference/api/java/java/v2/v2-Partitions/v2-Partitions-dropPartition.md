---
title: "dropPartition() | Java | v2"
slug: /java/java/v2-Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会从当前 Collection 中删除指定的 Partition。 | Java | v2"
type: docx
token: CSaVdr3zao9zFpxaJBgcCTCYnPd
sidebar_position: 2
keywords: 
  - 语义搜索
  - 异常检测
  - sentence transformers
  - 推荐系统
  - zilliz
  - zilliz cloud
  - 云
  - dropPartition()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropPartition()

此操作会从当前 Collection 中删除指定的 Partition。

删除 Partition 之前，您必须先将其释放。

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

**构建器方法：**

- `databaseName(String databaseName)`

    目标 Collection 所属 Database 的名称。

- `collectionName(String collectionName)`

    （必需）现有 Collection 的名称。

- `partitionName(String partitionName)`

    （必需）要删除的 Partition 的名称。

**返回值：**

*void*

**异常：**

- **MilvusClientExceptions**

    在此操作期间发生任何错误时，都会引发此异常。

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

