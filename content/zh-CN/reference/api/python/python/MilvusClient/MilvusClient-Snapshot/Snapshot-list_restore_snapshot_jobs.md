---
title: "list_restore_snapshot_jobs() | Python | MilvusClient"
slug: /python/python/Snapshot-list_restore_snapshot_jobs
sidebar_label: "list_restore_snapshot_jobs()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有快照恢复任务。也可按集合名称进行筛选，以查看针对特定集合的恢复任务。 | Python | MilvusClient"
type: docx
token: PtHQdGNfaoI4Mux05rbcRWTVnMp
sidebar_position: 5
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - list_restore_snapshot_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_restore_snapshot_jobs()

此操作会列出所有快照恢复任务。也可按集合名称进行筛选，以查看针对特定集合的恢复任务。

## 请求语法\{#request-syntax}

```python
list_restore_snapshot_jobs(
    collection_name: str = "",
    timeout: Optional[float] = None,
    **kwargs
) -> List[RestoreSnapshotJobInfo]
```

**参数：**

- **collection_name** (*str*) -<br/>
  可选的集合名称，用于筛选恢复任务。若为空，则列出所有恢复任务。

- **timeout** (*Optional[float]*) -<br/>
  可选的 RPC 超时时长，单位为秒。

**返回类型：**

*List[RestoreSnapshotJobInfo]*

**返回值：**

返回一个 `RestoreSnapshotJobInfo` 对象列表，其中每个对象都包含以下字段的恢复任务信息：

```python
{
    'job_id': int,
    'snapshot_name': str,
    'db_name': str,
    'collection_name': str,
    'state': str,
    'progress': int,
    'reason': str,
    'start_time': int,
    'time_cost': int
}
```

**参数：**

- **job_id** (*int*) -

    恢复任务 ID。

- **snapshot_name** (*str*) -

    正在恢复的快照名称。

- **db_name** (*str*) -

    目标数据库名称。

- **collection_name** (*str*) -

    目标集合名称。

- **state** (*str*) -

    当前状态。可能的值包括：*RestoreSnapshotNone*、*RestoreSnapshotPending*、*RestoreSnapshotExecuting*、*RestoreSnapshotCompleted*、*RestoreSnapshotFailed*。

- **progress** (*int*) -

    进度百分比（0-100）。

- **reason** (*str*) -

    如果任务失败，对应的错误原因。

- **start_time** (*int*) -

    开始时间戳（毫秒）。

- **time_cost** (*int*) -

    耗时（毫秒）。

**异常：**

- **MilvusException**

    如果操作失败。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# List all restore jobs
jobs = client.list_restore_snapshot_jobs()
for job in jobs:
    print(f"Job {job.job_id}: {job.snapshot_name} -> {job.collection_name} ({job.state})")

# Filter by target collection
jobs = client.list_restore_snapshot_jobs(collection_name="my_collection")
```
