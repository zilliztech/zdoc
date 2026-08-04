---
title: "get_restore_snapshot_state() | Python | MilvusClient"
slug: /python/python/Snapshot-get_restore_snapshot_state
sidebar_label: "get_restore_snapshot_state()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于查询异步恢复快照作业的状态和进度。 | Python | MilvusClient"
type: docx
token: Ky0pdpA6WorUvbxwN3ucwUjgnec
sidebar_position: 4
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - zilliz
  - zilliz cloud
  - cloud
  - get_restore_snapshot_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_restore_snapshot_state()

此操作用于查询异步恢复快照作业的状态和进度。

## 请求语法\{#request-syntax}

```python
get_restore_snapshot_state(
    job_id: int,
    timeout: Optional[float] = None,
    **kwargs
) -> RestoreSnapshotJobInfo
```

**参数：**

- **job_id** (*int*) -<br/>
  **[必需]**<br/>
  `restore_snapshot()` 返回的恢复作业 ID。

- **timeout** (*Optional[float]*) -<br/>
  RPC 允许的可选持续时间，单位为秒。

**返回类型：**

*RestoreSnapshotJobInfo*

**返回值：**

一个包含恢复作业信息的数据类，具有以下字段：

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

    恢复作业 ID。

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

    如果作业失败，表示错误原因。

- **start_time** (*int*) -

    开始时间戳，单位为毫秒。

- **time_cost** (*int*) -

    耗时，单位为毫秒。

**异常：**

- **MilvusException**

    如果作业 ID 无效或操作失败。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

state = client.get_restore_snapshot_state(job_id=12345)
print(f"State: {state.state}")
print(f"Progress: {state.progress}%")

if state.state == "RestoreSnapshotFailed":
    print(f"Error: {state.reason}")
```
