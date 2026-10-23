---
title: "getCompactionPlans() | Java | v2"
slug: /java/java/v2-Management-getCompactionPlans
sidebar_label: "getCompactionPlans()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作返回特定 Compaction 作业的 Compaction 计划，包括显示将合并哪些 Segment 的合并计划。 | Java | v2"
type: docx
token: BDNBdbEOioqnlKxRd3DcY7wRncg
sidebar_position: 23
keywords: 
  - 什么是向量 Database
  - 向量 Database 比较
  - Faiss
  - 视频搜索
  - zilliz
  - zilliz cloud
  - 云
  - getCompactionPlans()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getCompactionPlans()

此操作返回特定 Compaction 作业的 Compaction 计划，包括显示将合并哪些 Segment 的合并计划。

```java
public GetCompactionPlansResp getCompactionPlans(GetCompactionPlansReq request)
```

## 请求语法\{#request-syntax}

```java
getCompactionPlans(GetCompactionPlansReq.builder()
    .compactionID(Long compactionID)
    .build()
);
```

**构建器方法：**

- `compactionID(Long compactionID)` -

    **[必需]**

    由 `compact()` 返回的 Compaction 作业 ID。

**返回类型：**

*GetCompactionPlansResp*

**返回：**

响应包含 Compaction 状态和合并计划。

**参数：**

- **compactionId** (*Long*) -

    Compaction 作业的 ID。

- **state** (*CompactionState*) -

    Compaction 作业的状态。可选值为：`UndefiedState(0)`、`Executing(1)` 和 `Completed(2)`。

- **plans** (*List&lt;CompactionPlan&gt;*) -

    合并计划列表，其中每个合并计划都是一个 **CompactionPlan** 对象，包含以下字段：

    - **target** (*Long*) -

        目标 Segment 的 ID，源 Segment 将合并到该目标 Segment 中。

    - **sources** (*List&lt;Long&gt;*) -

        要合并到目标 Segment 中的源 Segment 的 ID。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.utility.request.GetCompactionPlansReq;
import io.milvus.v2.service.utility.response.GetCompactionPlansResp;

GetCompactionPlansResp plans = client.getCompactionPlans(
    GetCompactionPlansReq.builder()
        .compactionID(jobId)
        .build()
);
System.out.println(plans);
```
