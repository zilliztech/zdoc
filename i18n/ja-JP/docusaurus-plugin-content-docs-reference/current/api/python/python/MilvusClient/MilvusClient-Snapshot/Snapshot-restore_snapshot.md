---
title: "restore_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-restore_snapshot
sidebar_label: "restore_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スナップショットを対象の collection に復元します。復元は非同期で実行されます — 進行状況の監視には `getrestoresnapshotstate()` を使用します。 | Python | MilvusClient"
type: docx
token: I2OZdk40IomugOx9MTqcooVcnEf
sidebar_position: 8
keywords: 
  - 深層学習
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - cloud
  - restore_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# restore_snapshot()

この操作は、スナップショットを対象の collection に復元します。復元は非同期で実行されます — 進行状況の監視には `get_restore_snapshot_state()` を使用します。

## リクエスト構文\{#request-syntax}

```python
restore_snapshot(
    collection_name: str,
    snapshot_name: str,
    rewrite_data: bool = False,
    timeout: Optional[float] = None,
    **kwargs
) -> int
```

**パラメータ:**

- **collection_name** (*str*) -<br/>
  **[必須]**<br/>
  スナップショットの復元先となる対象 collection の名前。

- **snapshot_name** (*str*) -<br/>
  **[必須]**<br/>
  復元するスナップショットの名前。

- **rewrite_data** (*bool*) -<br/>
  対象 collection 内の既存データを上書きするかどうか。デフォルトは *False* です。

- **timeout** (*Optional[float]*) -<br/>
  RPC に許容する秒単位のオプションの時間。

**戻り値の型:**

*int*

復元ジョブ ID。この ID を `get_restore_snapshot_state()` と共に使用して、復元の進行状況を追跡します。

**例外:**

- **MilvusException**

    スナップショットが存在しない場合、対象 collection を利用できない場合、または操作が失敗した場合。

## 例\{#examples}

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
