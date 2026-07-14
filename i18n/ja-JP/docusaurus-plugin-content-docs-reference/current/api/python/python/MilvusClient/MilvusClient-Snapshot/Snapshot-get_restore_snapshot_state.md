---
title: "get_restore_snapshot_state() | Python | MilvusClient"
slug: /python/python/Snapshot-get_restore_snapshot_state
sidebar_label: "get_restore_snapshot_state()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、非同期の restore snapshot ジョブのステータスと進行状況を照会します。 | Python | MilvusClient"
type: docx
token: Ky0pdpA6WorUvbxwN3ucwUjgnec
sidebar_position: 4
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - milvus はどのように動作するか
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

この操作は、非同期の restore snapshot ジョブのステータスと進行状況を照会します。

## Request Syntax\{#request-syntax}

```python
get_restore_snapshot_state(
    job_id: int,
    timeout: Optional[float] = None,
    **kwargs
) -> RestoreSnapshotJobInfo
```

**PARAMETERS:**

- **job_id** (*int*) -
**[REQUIRED]**
`restore_snapshot()` によって返される restore ジョブ ID。

- **timeout** (*Optional[float]*) -
RPC に許可する秒単位のオプションの時間。

**RETURN TYPE:**

*RestoreSnapshotJobInfo*

**RETURNS:**

以下のフィールドを含む restore ジョブ情報を格納した dataclass:

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

**PARAMETERS:**

- **job_id** (*int*) -

    restore ジョブ ID。

- **snapshot_name** (*str*) -

    復元対象の snapshot 名。

- **db_name** (*str*) -

    対象データベース名。

- **collection_name** (*str*) -

    対象 collection 名。

- **state** (*str*) -

    現在の状態。指定可能な値: *RestoreSnapshotNone*, *RestoreSnapshotPending*, *RestoreSnapshotExecuting*, *RestoreSnapshotCompleted*, *RestoreSnapshotFailed*。

- **progress** (*int*) -

    進行率（0～100）。

- **reason** (*str*) -

    ジョブが失敗した場合のエラー理由。

- **start_time** (*int*) -

    ミリ秒単位の開始タイムスタンプ。

- **time_cost** (*int*) -

    ミリ秒単位の所要時間。

**EXCEPTIONS:**

- **MilvusException**

    ジョブ ID が無効な場合、または操作が失敗した場合。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

state = client.get_restore_snapshot_state(job_id=12345)
print(f"State: {state.state}")
print(f"Progress: {state.progress}%")

if state.state == "RestoreSnapshotFailed":
    print(f"Error: {state.reason}")
```
