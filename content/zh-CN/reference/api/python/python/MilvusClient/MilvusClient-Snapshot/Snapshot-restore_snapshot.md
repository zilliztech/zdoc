---
title: "restore_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-restore_snapshot
sidebar_label: "restore_snapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将快照恢复到新的目标 Collection，并可选择跨 Database 执行恢复。恢复过程以异步方式运行，请使用 `getrestoresnapshotstate()` 监控进度。 | Python | MilvusClient"
type: docx
token: I2OZdk40IomugOx9MTqcooVcnEf
sidebar_position: 8
keywords: 
  - 深度学习
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - zilliz
  - zilliz cloud
  - 云
  - restore_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# restore_snapshot()

此操作会将快照恢复到新的目标 Collection，并可选择跨 Database 执行恢复。恢复过程以异步方式运行，请使用 `get_restore_snapshot_state()` 监控进度。

<Admonition type="info" title="Note">

目标 Collection 必须尚不存在；如果 Collection 已存在，恢复作业将失败。由于快照名称仅在 Collection 内唯一，因此必须使用 source_collection_name 来唯一标识快照。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.restore_snapshot(
```

**参数：**

- **snapshot_name** （*str*） -

    **[必需]**

    要恢复的快照的名称。

- **source_collection_name** （*str*） -

    **[必需]**

    快照所属的 Collection。需要用它来唯一标识快照。

- **target_collection_name** （*str*） -

    **[必需]**

    快照要恢复到的 Collection。该 Collection 必须尚不存在。

- **source_db_name** （*str*） -

    源 Database 的名称。该值默认为当前活动的 Database。

- **target_db_name** （*str*） -

    目标 Database 的名称。该值默认为当前活动的 Database。

- **timeout** （*Optional[float]*） -

    允许 RPC 运行的可选时长，单位为秒。

**返回类型：**

*int*

**返回：**

恢复作业 ID。将此 ID 与 get_restore_snapshot_state() 一起使用，以跟踪恢复进度。

**异常：**

- **MilvusException**

    当快照不存在、目标 Collection 已存在或操作失败时，将引发此异常。当快照不存在、目标 Collection 已存在或操作失败时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient
import time

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Start restore and get the job ID
job_id = client.restore_snapshot(
    snapshot_name="backup_20260418",
    source_collection_name="my_collection",
    target_collection_name="restored_collection",
)

# Poll for completion
while True:
    state = client.get_restore_snapshot_state(job_id=job_id)
    if state.state == "RestoreSnapshotCompleted":
        print(f"Restore complete: {state.progress}%")
        break
    elif state.state == "RestoreSnapshotFailed":
        print(f"Restore failed: {state.reason}")
        break
    print(f"In progress: {state.progress}%")
    time.sleep(2)
```
