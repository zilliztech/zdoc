---
title: "getRefreshExternalCollectionProgress() | Java | v2"
slug: /java/java/v2-Management-getRefreshExternalCollectionProgress
sidebar_label: "getRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回先前启动的外部 Collection 刷新任务的进度和当前状态。 | Java | v2"
type: docx
token: FzEydqTwRoajhnxZOftcKxKpndg
sidebar_position: 29
keywords: 
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - zilliz
  - Zilliz Cloud
  - 云
  - getRefreshExternalCollectionProgress()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getRefreshExternalCollectionProgress()

此操作返回先前启动的外部 Collection 刷新任务的进度和当前状态。

```java
public GetRefreshExternalCollectionProgressResp getRefreshExternalCollectionProgress(GetRefreshExternalCollectionProgressReq request)
```

## 请求语法\{#request-syntax}

```java
getRefreshExternalCollectionProgress(GetRefreshExternalCollectionProgressReq.builder()
    .jobId(long jobId)
    .build()
);
```

**构建器方法：**

- `jobId(long jobId)` -

    **[必需]**

    由 `refreshExternalCollection()` 返回的任务 ID。

**返回类型：**

*GetRefreshExternalCollectionProgressResp*

**返回：**

**GetRefreshExternalCollectionProgressResp** 对象封装了一个 `RefreshExternalCollectionJobInfo`，可通过 `getJobInfo()` 访问。任务信息包含以下字段：

**参数：**

- **jobInfo** （*RefreshExternalCollectionJobInfo*） -

    刷新外部 Collection 任务的信息，包含以下字段：

    - **jobId** （*long*） -

        刷新任务的 ID。

    - **collectionName** （*String*） -

        目标 Collection 的名称。

    - **state** （*String*） -

        当前任务状态（例如 `"PENDING"`、`"RUNNING"`、`"SUCCEEDED"`、`"FAILED"`）。

    - **progress** （*int*） -

        完成百分比（0 到 100）。

    - **reason** （*String*） -

        如果任务状态为 `"FAILED"`，则为失败原因；否则为空。

    - **externalSource** （*String*） -

        任务使用的外部源。

    - **externalSpec** （*String*） -

        外部数据源的规范。

    - **startTime** （*long*） -

        任务开始时间戳（epoch 毫秒）。

    - **endTime** （*long*） -

        任务结束时间戳（epoch 毫秒）；如果任务仍在运行，则为 0。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.utility.request.GetRefreshExternalCollectionProgressReq;
import io.milvus.v2.service.utility.response.GetRefreshExternalCollectionProgressResp;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionJobInfo;

GetRefreshExternalCollectionProgressResp resp = client.getRefreshExternalCollectionProgress(
    GetRefreshExternalCollectionProgressReq.builder()
        .jobId(jobId)
        .build()
);
RefreshExternalCollectionJobInfo info = resp.getJobInfo();
System.out.println(info.getState() + " " + info.getProgress() + "%");
```
