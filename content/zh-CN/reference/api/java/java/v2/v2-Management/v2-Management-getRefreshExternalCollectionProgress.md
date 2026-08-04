---
title: "getRefreshExternalCollectionProgress() | Java | v2"
slug: /java/java/v2-Management-getRefreshExternalCollectionProgress
sidebar_label: "getRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回先前已启动的外部集合刷新任务的进度和当前状态。 | Java | v2"
type: docx
token: FzEydqTwRoajhnxZOftcKxKpndg
sidebar_position: 29
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - getRefreshExternalCollectionProgress()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getRefreshExternalCollectionProgress()

此操作返回先前已启动的外部集合刷新任务的进度和当前状态。

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

**BUILDER METHODS：**

- `jobId(long jobId)` -

    **[REQUIRED]**

    由 `refreshExternalCollection()` 返回的任务 ID。

**返回：**

*GetRefreshExternalCollectionProgressResp*

该响应封装了一个可通过 `getJobInfo()` 访问的 `RefreshExternalCollectionJobInfo`。任务信息中的字段包括：

- `jobId` (*long*) - 任务标识符。

- `collectionName` (*String*) - 目标集合名称。

- `state` (*String*) - 当前任务状态（例如 `"PENDING"`、`"RUNNING"`、`"SUCCEEDED"`、`"FAILED"`）。

- `progress` (*int*) - 完成百分比（0–100）。

- `reason` (*String*) - 如果 `state` 为 `"FAILED"`，则表示失败原因；否则为空。

- `externalSource` (*String*) - 任务使用的外部数据源。

- `startTime` (*long*) - 任务开始时间戳（epoch 毫秒）。

- `endTime` (*long*) - 任务结束时间戳（epoch 毫秒）；如果仍在运行，则为 0。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

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
