---
title: "getRestoreSnapshotState() | Java | v2"
slug: /java/java/v2-Snapshots-getRestoreSnapshotState
sidebar_label: "getRestoreSnapshotState()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作获取恢复快照任务的状态和进度。 | Java | v2"
type: docx
token: KXdUdGpt7oD3dkxHZcfcIAQBnNg
sidebar_position: 4
keywords: 
  - 图像搜索
  - LLMs
  - 机器学习
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getRestoreSnapshotState()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getRestoreSnapshotState()

此操作获取恢复快照任务的状态和进度。

```java
public GetRestoreSnapshotStateResp getRestoreSnapshotState(GetRestoreSnapshotStateReq request)
```

## 请求语法\{#request-syntax}

```java
getRestoreSnapshotState(GetRestoreSnapshotStateReq.builder()
    .jobId(Long jobId)
    .build()
)
```

**构建器方法：**

- `jobId(Long jobId)`

    由 `restoreSnapshot()` 返回的恢复快照任务 ID。

**返回类型：**

*GetRestoreSnapshotStateResp*

**返回：**

包含恢复任务状态、进度、原因、时间和 Collection 元数据的响应。

**参数：**

- **jobInfo** (*RestoreSnapshotJobInfo*) -

    恢复快照任务的信息。任务信息包含以下字段：

    - **jobId** (*Long*) -

        恢复快照任务的 ID。

    - **snapshotName** (*String*) -

        正在恢复的快照的名称。

    - **dbName** (*String*) -

        目标 Database 的名称。

    - **collectionName** (*String*) -

        目标 Collection 的名称。

    - **state** (*String*) -

        恢复任务的当前状态：RestoreSnapshotNone、RestoreSnapshotPending、RestoreSnapshotExecuting、RestoreSnapshotCompleted 或 RestoreSnapshotFailed。

    - **progress** (*Integer*) -

        恢复任务的进度，以百分比表示。

    - **reason** (*String*) -

        任务失败时的失败原因。

    - **startTime** (*Long*) -

        恢复任务的开始时间。

    - **timeCost** (*Long*) -

        恢复任务的耗时。

**异常：**

- **MilvusClientException**

    当缺少必需参数、数值参数超出范围，或服务器针对此操作返回错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.snapshot.request.GetRestoreSnapshotStateReq;
import io.milvus.v2.service.snapshot.response.GetRestoreSnapshotStateResp;

GetRestoreSnapshotStateReq request = GetRestoreSnapshotStateReq.builder()
    .jobId(123456789L)
    .build();

GetRestoreSnapshotStateResp response = client.getRestoreSnapshotState(request);
```
