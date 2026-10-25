---
title: "releasePartitions() | Java | v2"
slug: /java/java/v2-Partitions-releasePartitions
sidebar_label: "releasePartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从内存中释放指定 Collection 中的 Partition。 | Java | v2"
type: docx
token: DykedGfgOo5JM7x6ZmncT5i9nVf
sidebar_position: 7
keywords: 
  - ANNS
  - 向量搜索
  - kNN 算法
  - HNSW
  - Zilliz
  - Zilliz Cloud
  - 云
  - releasePartitions()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# releasePartitions()

此操作会从内存中释放指定 Collection 中的 Partition。

```java
public void releasePartitions(ReleasePartitionsReq request)
```

## 请求语法\{#request-syntax}

```java
releasePartitions(ReleasePartitionsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    该 Collection 所属的 Database 名称。

- `collectionName(String collectionName)`

    现有 Collection 的名称。

- `partitionNames(List<String> partitionNames)`

    要释放的 Partition 名称列表。

**异常：**

- **MilvusClientException**

    此操作中发生任何错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;
import java.util.Collections;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Release partition in collection
ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
        .collectionName("test_partition")
        .partitionNames(Collections.singletonList("test_partition"))
        .build();
client.releasePartitions(releasePartitionsReq);
```
