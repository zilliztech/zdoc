---
title: "getQuerySegmentInfo() | Java | v2"
slug: /java/java/v2-Management-getQuerySegmentInfo
sidebar_label: "getQuerySegmentInfo()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作从查询节点获取 Collection 的持久化 Segment 信息，包括 Entity 数量。 | Java | v2"
type: docx
token: QuXrdxjjro2u25xZChncXfBunlO
sidebar_position: 21
keywords: 
  - 向量 Database 比较
  - OpenAI 向量 Database
  - 自然语言处理 Database
  - 低成本向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - getQuerySegmentInfo()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getQuerySegmentInfo()

此操作从查询节点获取 Collection 的持久化 Segment 信息，包括 Entity 数量。

```java
public GetQuerySegmentInfoResp getQuerySegmentInfo(GetQuerySegmentInfoReq request)
```

## 请求参数\{#request-parameters}

```java
getQuerySegmentInfo(GetQuerySegmentInfoReq.builder()
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

*GetQuerySegmentInfoResp*

**返回值：**

一个 **GetQuerySegmentInfoResp** 对象，包含指定 Collection 中持久化 Segment 的详细信息，包括每个 Segment 中的 Entity 数量。该对象具有以下参数：

**参数：**

- **segmentInfos** (*List&lt;QuerySegmentInfo&gt;*) -

    Segment 列表，其中每个 Segment 均由 **QuerySegmentInfo** 对象表示，该对象具有以下字段：

    - **collectionName** (*String*) -

        当前 Segment 所属 Collection 的名称。

    - **segmentID** (*Long*) -

        当前 Segment 的 ID。

    - **collectionID** (*Long*) -

        当前 Segment 所属 Collection 的 ID。

    - **partitionID** (*Long*) -

        当前 Segment 所属 Partition 的 ID。

    - **memSize** (*Long*) -

        当前 Segment 占用的内存大小。

    - **numOfRows** (*Long*) -

        当前 Segment 中的 Entity 数量。

    - **indexName** (*String*) -

        与当前 Segment 关联的索引的名称。

    - **indexID** (*Long*) -

        与当前 Segment 关联的索引的 ID。

    - **state** (*String*) -

        当前 Segment 的状态。可选值为："Growing"、"Sealed"、"Flushed"、"Flushing"、"Dropped" 和 "Importing"。

    - **level** (*String*) -

        当前 Segment 的 Compaction 级别。可选值为："Legacy"、"L0"、"L1" 和 "L2"。

    - **nodeIDs** (*List&lt;Long&gt;*) -

        查询节点 ID 列表。

    - **storageVersion** (*Long*) -

        当前 Segment 的存储格式版本。

    - **isSorted** (*Boolean*) -

        当前 Segment 中的 Entity 是否已排序。

**异常：**

- **MilvusClientException**

    此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.GetQuerySegmentInfoReq;
import io.milvus.v2.service.utility.response.GetQuerySegmentInfoResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get segment info
GetQuerySegmentInfoResp segInfoResp = client.getQuerySegmentInfo(GetQuerySegmentInfoReq.builder()
        .collectionName("test")
        .build());
```
