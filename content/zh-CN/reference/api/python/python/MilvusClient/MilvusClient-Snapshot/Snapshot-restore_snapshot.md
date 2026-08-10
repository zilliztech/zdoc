---
title: "restore_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-restore_snapshot
sidebar_label: "restore_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将快照恢复到目标 Collection 中。恢复将异步运行——使用 `getrestoresnapshotstate()` 监控进度。 | Python | MilvusClient"
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

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# restore_snapshot()

此操作会将快照恢复到目标 Collection 中。恢复将异步运行——使用 `get_restore_snapshot_state()` 监控进度。

## 请求语法\{#request-syntax}

```python
restore_snapshot(
    collection_name: str,
    snapshot_name: str,
    rewrite_data: bool = False,
    timeout: Optional[float] = None,
    **kwargs
) -> int
```

**参数：**

- **collection_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  要将快照恢复到其中的目标 Collection 名称。

- **snapshot_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  要恢复的快照名称。

- **rewrite_data** (*bool*) -<br/>
  是否覆盖目标 Collection 中的现有数据。默认为 *False*。

- **timeout** (*Optional[float]*) -<br/>
  为 RPC 允许的可选时长，以秒为单位。

**返回类型：**

*int*

恢复作业 ID。使用此 ID 配合 `get_restore_snapshot_state()` 跟踪恢复进度。

**异常：**

- **MilvusException**

    如果快照不存在、目标 Collection 不可用，或操作失败，则会引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient
import time

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Start restore and get job ID
job_id = client.restore_snapshot(
    snapshot_name="backup_20260418",
    collection_name="restored_collection",
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
