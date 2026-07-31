---
title: "getCompactionPlans() | Java | v2"
slug: /java/java/v2-Management-getCompactionPlans
sidebar_label: "getCompactionPlans()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作返回特定 compaction 作业的 compaction 计划，包括显示哪些 segment 将被合并的 merge 计划。 | Java | v2"
type: docx
token: BDNBdbEOioqnlKxRd3DcY7wRncg
sidebar_position: 22
keywords: 
  - 什么是向量数据库
  - 向量数据库对比
  - Faiss
  - 视频搜索
  - zilliz
  - zilliz cloud
  - cloud
  - getCompactionPlans()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getCompactionPlans()

此操作返回特定 compaction 作业的 compaction 计划，包括显示哪些 segment 将被合并的 merge 计划。

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

**BUILDER METHODS：**

- `compactionID(Long compactionID)` -

    **[必需]**

    由 `compact()` 返回的 compaction 作业 ID。

**返回：**

*GetCompactionPlansResp*

响应中包含 compaction 状态和 merge 计划。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

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
