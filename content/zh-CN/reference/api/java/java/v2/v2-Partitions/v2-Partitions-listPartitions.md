---
title: "listPartitions() | Java | v2"
slug: /java/java/v2-Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作列出指定集合中的分区。 | Java | v2"
type: docx
token: Bjs5dej7ZoBKhXxZzMjclPCynmd
sidebar_position: 5
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - listPartitions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listPartitions()

此操作列出指定集合中的分区。

```java
public List<String> listPartitions(ListPartitionsReq request)
```

## 请求语法\{#request-syntax}

```java
listPartitions(ListPartitionsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标集合所属数据库的名称。

- `collectionName(String collectionName)`

    现有集合的名称。

**返回类型：**

*List\<String\>*

**返回值：**

分区名称列表。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ListPartitionsReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List partitions in collection
ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("test")
        .build();
List<String> res = client.listPartitions(listPartitionsReq);
```

