---
title: "restoreSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-restoreSnapshot
sidebar_label: "restoreSnapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会启动一个异步任务，将快照恢复到目标 Collection。 | Java | v2"
type: docx
token: SF5wdcArioRIsxxVzNjcgIhJnrc
sidebar_position: 8
keywords: 
  - LLM 作为评判器
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - restoreSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# restoreSnapshot()

此操作会启动一个异步任务，将快照恢复到目标 Collection。

```java
public RestoreSnapshotResp restoreSnapshot(RestoreSnapshotReq request)
```

## 请求语法\{#request-syntax}

```java
restoreSnapshot(RestoreSnapshotReq.builder()
    .snapshotName(String snapshotName)
    .sourceCollectionName(String sourceCollectionName)
    .targetCollectionName(String targetCollectionName)
    .sourceDbName(String sourceDbName)
    .targetDbName(String targetDbName)
    .build()
)
```

**构建器方法：**

- `snapshotName(String snapshotName)`

    快照的名称。

- `sourceCollectionName(String sourceCollectionName)`

    创建快照时所使用的 Collection 的名称。

- `targetCollectionName(String targetCollectionName)`

    快照要恢复到的 Collection 的名称。

- `sourceDbName(String sourceDbName)`

    包含源 Collection 的 Database。如果省略，则使用当前 Database。

- `targetDbName(String targetDbName)`

    要在其中创建恢复后 Collection 的 Database。如果省略，则使用当前 Database。

**返回类型：**

*RestoreSnapshotResp*

**返回：**

包含恢复快照任务 ID 的响应。

**参数：**

- **jobId** (*Long*) -

    恢复快照任务的 ID。

**异常：**

- **MilvusClientException**

    当缺少必需参数、数值参数超出范围，或服务器为此操作返回错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.snapshot.request.RestoreSnapshotReq;
import io.milvus.v2.service.snapshot.response.RestoreSnapshotResp;

RestoreSnapshotReq request = RestoreSnapshotReq.builder()
    .snapshotName("book_chunks_backup")
    .sourceCollectionName("book_chunks")
    .targetCollectionName("book_chunks_restored")
    .sourceDbName("default")
    .targetDbName("default")
    .build();

RestoreSnapshotResp response = client.restoreSnapshot(request);
```
