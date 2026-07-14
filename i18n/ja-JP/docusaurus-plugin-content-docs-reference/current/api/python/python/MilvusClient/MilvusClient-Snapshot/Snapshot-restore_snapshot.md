---
title: "restore_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-restore_snapshot
sidebar_label: "restore_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はスナップショットを対象 collection に復元します。復元は非同期で実行されるため、進行状況の監視には `getrestoresnapshotstate()` を使用します。 | Python | MilvusClient"
type: docx
token: I2OZdk40IomugOx9MTqcooVcnEf
sidebar_position: 8
keywords: 
  - Deep Learning
  - ナレッジベース
  - 自然言語処理
  - AIチャットボット
  - zilliz
  - zilliz cloud
  - クラウド
  - restore_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# restore_snapshot()

この操作はスナップショットを対象 collection に復元します。復元は非同期で実行されるため、進行状況の監視には `get_restore_snapshot_state()` を使用します。

## Request Syntax\{#request-syntax}

```python
restore_snapshot(
    collection_name: str,
    snapshot_name: str,
    rewrite_data: bool = False,
    timeout: Optional[float] = None,
    **kwargs
) -> int
```

**PARAMETERS:**

- **collection_name** (*str*) -
**[REQUIRED]**
スナップショットの復元先となる対象 collection の名前です。

- **snapshot_name** (*str*) -
**[REQUIRED]**
復元するスナップショットの名前です。

- **rewrite_data** (*bool*) -
対象 collection 内の既存データを上書きするかどうかを指定します。デフォルトは *False* です。

- **timeout** (*Optional[float]*) -
RPC に許可する秒単位の任意の継続時間です。

**RETURN TYPE:**

*int*

復元ジョブ ID。`get_restore_snapshot_state()` とともにこの ID を使用して、復元の進行状況を追跡します。

**EXCEPTIONS:**

- **MilvusException**

    スナップショットが存在しない場合、対象 collection が利用できない場合、または操作に失敗した場合。

## Examples\{#examples}

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
