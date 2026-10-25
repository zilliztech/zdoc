---
title: "getPersistentSegmentInfo() | Java | v2"
slug: /java/java/v2-Management-getPersistentSegmentInfo
sidebar_label: "getPersistentSegmentInfo()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作从数据节点获取 Collection 中持久化 Segment 的信息，包括 Entity 数量。 | Java | v2"
type: docx
token: Qg8wdRoRdoan3pxQnJLcOW5jnub
sidebar_position: 20
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - Zilliz
  - Zilliz Cloud
  - 云
  - getPersistentSegmentInfo()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getPersistentSegmentInfo()

此操作从数据节点获取 Collection 中持久化 Segment 的信息，包括 Entity 数量。

```java
public GetPersistentSegmentInfoResp getPersistentSegmentInfo(GetPersistentSegmentInfoReq request)
```

## 请求语法\{#request-syntax}

```java
getPersistentSegmentInfo(GetPersistentSegmentInfoReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标 Collection 所属 Database 的名称。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

**返回类型：**

*GetPersistentSegmentInfoResp*

**返回：**

一个 **GetPersistentSegmentInfoResp** 对象，包含指定 Collection 中持久化 Segment 的详细信息，其中包括每个 Segment 的 Entity 数量。该对象具有以下参数：

**参数：**

- **segmentInfos** （*List&lt;PersistentSegmentInfo&gt;*） -

    Segment 列表，每个 Segment 由一个 PersistentSegmentInfo 对象表示，该对象具有以下字段。

    - **segmentID** （*Long*） -

        当前 Segment 的 ID。

    - **collectionID** （*Long*） -

        当前 Segment 所属 Collection 的 ID。

    - **partitionID** （*Long*） -

        当前 Segment 所属 Partition 的 ID。

    - **collectionName** （*String*） -

        当前 Segment 所属 Collection 的名称。

    - **numOfRows** （*Long*） -

        当前 Segment 中的 Entity 数量。

    - **state** （*String*） -

        当前 Segment 的状态。可能的值包括："Growing"、"Sealed"、"Flushed"、"Flushing"、"Dropped"、"Importing"。

    - **level** （*String*） -

        当前 Segment 的 Compaction 级别。可能的值包括："Legacy"、"L0"、"L1"、"L2"。

    - **storageVersion** （*Long*） -

        当前 Segment 的存储格式版本。

    - **isSorted** （*Boolean*） -

        当前 Segment 中的 Entity 是否已排序。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.GetPersistentSegmentInfoReq;
import io.milvus.v2.service.utility.response.GetPersistentSegmentInfoResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get segment info
GetPersistentSegmentInfoResp segInfoResp = client.getPersistentSegmentInfo(GetPersistentSegmentInfoReq.builder()
        .collectionName(randomCollectionName)
        .build());
```
