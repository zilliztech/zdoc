---
title: "releasePartitions() | Java | v2"
slug: /java/java/v2-Partitions-releasePartitions
sidebar_label: "releasePartitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将指定集合中的分区从内存中释放。 | Java | v2"
type: docx
token: VsyQdDkXnoloWYxfjXNchc0dnng
sidebar_position: 7
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - releasePartitions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# releasePartitions()

此操作会将指定集合中的分区从内存中释放。

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

    集合所属数据库的名称。

- `collectionName(String collectionName)`

    现有集合的名称。

- `partitionNames(List<String> partitionNames)`

    要释放的分区名称列表。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;

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

