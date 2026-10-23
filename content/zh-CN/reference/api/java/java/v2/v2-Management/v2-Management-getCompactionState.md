---
title: "getCompactionState() | Java | v2"
slug: /java/java/v2-Management-getCompactionState
sidebar_label: "getCompactionState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作获取特定 Compaction 操作的状态。 | Java | v2"
type: docx
token: A2Vpd1kXsoF5uexKYb8ckcGMnWe
sidebar_position: 8
keywords: 
  - LLM 幻觉
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - zilliz
  - zilliz cloud
  - 云
  - getCompactionState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getCompactionState()

此操作获取特定 Compaction 操作的状态。

```java
public GetCompactionStateResp getCompactionState(GetCompactionStateReq request)
```

## 请求语法\{#request-syntax}

```java
getCompactionState(GetCompactionStateReq.builder()
    .compactionID(Long compactionID)
    .build();
)
```

**构建器方法：**

- `compactionID(Long compactionID)`

    Compaction 操作的 ID，该 ID 由 `compact()` 调用返回。

**返回类型：**

*GetCompactionStateResp*

**返回值：**

一个 GetCompactionStateResp 实例，其中包含以下参数：

**参数：**

- **state** （*CompactionState*） -

    指定 Compaction 操作的当前状态。可能的值包括：

    - UndefiedState(0)

    - Executing(1)

    - Completed(2)

- **executingPlanNo** （*Long*） -

    对应执行计划的 ID。

- **timeoutPlanNo** （*Long*） -

    超时计划的 ID。

- **completedPlanNo** （*Long*） -

    已完成计划的 ID。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CompactReq;
import io.milvus.v2.service.utility.request.GetCompactionStateReq;
import io.milvus.v2.service.utility.response.CompactResp;
import io.milvus.v2.service.utility.response.GetCompactionStateResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.compact(CompactReq.builder()
    .collectionName("my_collection")
    .build());

// 3. Get the compaction status
client.getCompactionState(GetCompactionStateReq.builder()
    .compactionID(3431948932481L)
    .build());
```
