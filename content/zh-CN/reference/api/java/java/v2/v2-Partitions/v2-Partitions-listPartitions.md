---
title: "listPartitions() | Java | v2"
slug: /java/java/v2-Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出指定 Collection 中的 Partition。 | Java | v2"
type: docx
token: Jj60dRCiVoLLRzxVCiGcjI37nHc
sidebar_position: 5
keywords: 
  - 向量化
  - k 近邻算法
  - ANNS
  - 向量搜索
  - zilliz
  - Zilliz Cloud
  - 云
  - listPartitions()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listPartitions()

此操作会列出指定 Collection 中的 Partition。

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

    目标 Collection 所属的 Database 名称。

- `collectionName(String collectionName)`

    现有 Collection 的名称。

**返回类型：**

*List&lt;String&gt;*

**返回：**

Partition 名称列表。

**参数：**

- **partitionNames** (*List&lt;String&gt;*) -

    指定 Collection 中的 Partition 名称列表。

**异常：**

- **MilvusClientException**

    此操作过程中发生错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ListPartitionsReq;
import java.util.List;
import java.util.Set;

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
