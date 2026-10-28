---
title: "listRestoreSnapshotJobs() | Java | v2"
slug: /java/java/v2-Snapshots-listRestoreSnapshotJobs
sidebar_label: "listRestoreSnapshotJobs()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出恢复快照任务，并可选择限定到某个 Database 和 Collection。 | Java | v2"
type: docx
token: I98vddTeco48kYxHEkOccG9ynYe
sidebar_position: 5
keywords: 
  - LLM 幻觉
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - listRestoreSnapshotJobs()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listRestoreSnapshotJobs()

此操作会列出恢复快照任务，并可选择限定到某个 Database 和 Collection。

```java
public ListRestoreSnapshotJobsResp listRestoreSnapshotJobs(ListRestoreSnapshotJobsReq request)
```

## 请求语法\{#request-syntax}

```java
listRestoreSnapshotJobs(ListRestoreSnapshotJobsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    包含该 Collection 的 Database 名称。如果省略，则使用当前 Database。

- `collectionName(String collectionName)`

    与快照操作关联的 Collection 名称。

**返回类型：**

*ListRestoreSnapshotJobsResp*

**返回值：**

包含与请求筛选条件匹配的恢复快照任务的响应。

**参数：**

- **jobs** （*List&lt;RestoreSnapshotJobInfo&gt;*）-

    恢复快照任务列表，其中每个任务都是一个 **RestoreSnapshotJobInfo** 对象，包含以下字段：

    - **jobId** （*Long*）-

        恢复快照任务的 ID。

    - **snapshotName** （*String*）-

        正在恢复的快照名称。

    - **dbName** （*String*）-

        目标 Database 名称。

    - **collectionName** （*String*）-

        目标 Collection 名称。

    - **state** （*String*）-

        恢复任务的当前状态：RestoreSnapshotNone、RestoreSnapshotPending、RestoreSnapshotExecuting、RestoreSnapshotCompleted 或 RestoreSnapshotFailed。

    - **progress** （*Integer*）-

        恢复任务的进度，以百分比表示。

    - **reason** （*String*）-

        任务失败时的失败原因。

    - **startTime** （*Long*）-

        恢复任务的开始时间。

    - **timeCost** （*Long*）-

        恢复任务的时间开销。

**异常：**

- **MilvusClientException**

    当缺少必需参数、数值参数超出范围，或服务器对此操作返回错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.snapshot.request.ListRestoreSnapshotJobsReq;
import io.milvus.v2.service.snapshot.response.ListRestoreSnapshotJobsResp;

ListRestoreSnapshotJobsReq request = ListRestoreSnapshotJobsReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .build();

ListRestoreSnapshotJobsResp response = client.listRestoreSnapshotJobs(request);
```
