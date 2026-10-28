---
title: "get_restore_snapshot_state() | Python | MilvusClient"
slug: /python/python/Snapshot-get_restore_snapshot_state
sidebar_label: "get_restore_snapshot_state()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、非同期のスナップショット復元ジョブのステータスと進行状況を照会します。 | Python | MilvusClient"
type: docx
token: Ky0pdpA6WorUvbxwN3ucwUjgnec
sidebar_position: 4
keywords: 
  - managed milvus
  - Serverless ベクトルデータベース
  - milvus open source
  - how does milvus work
  - zilliz
  - zilliz cloud
  - cloud
  - get_restore_snapshot_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_restore_snapshot_state()

この操作は、非同期のスナップショット復元ジョブのステータスと進行状況を照会します。

## Request Syntax\{#request-syntax}

```python
get_restore_snapshot_state(
    job_id: int,
    timeout: Optional[float] = None,
    **kwargs
) -> RestoreSnapshotJobInfo
```

**PARAMETERS:**

- **job_id** (*int*) -<br/>
  **[REQUIRED]**<br/>
  `restore_snapshot()` によって返される復元ジョブ ID。

- **timeout** (*Optional[float]*) -<br/>
  RPC に許可する時間（秒単位）を指定するオプションです。

**RETURN TYPE:**

*RestoreSnapshotJobInfo*

**RETURNS:**

以下のフィールドを含む、復元ジョブ情報を格納したデータクラスです。

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

    復元ジョブ ID。

- **snapshot_name** (*str*) -

    復元するスナップショットの名前。

- **db_name** (*str*) -

    ターゲットデータベースの名前。

- **collection_name** (*str*) -

    ターゲットコレクションの名前。

- **state** (*str*) -

    現在の状態。指定可能な値は *RestoreSnapshotNone*、*RestoreSnapshotPending*、*RestoreSnapshotExecuting*、*RestoreSnapshotCompleted*、*RestoreSnapshotFailed* です。

- **progress** (*int*) -

    進行状況の割合（0〜100）。

- **reason** (*str*) -

    ジョブが失敗した場合のエラー理由。

- **start_time** (*int*) -

    開始タイムスタンプ（ミリ秒）。

- **time_cost** (*int*) -

    所要時間（ミリ秒）。

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
