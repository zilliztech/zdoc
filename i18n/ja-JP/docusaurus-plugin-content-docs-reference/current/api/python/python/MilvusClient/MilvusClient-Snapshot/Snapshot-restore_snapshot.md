---
title: "restore_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-restore_snapshot
sidebar_label: "restore_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スナップショットを新しいターゲットコレクションに復元します。必要に応じて、データベースをまたいで復元することもできます。復元は非同期で実行されます。進行状況を監視するには、`getrestoresnapshotstate()` を使用します。 | Python | MilvusClient"
type: docx
token: I2OZdk40IomugOx9MTqcooVcnEf
sidebar_position: 8
keywords: 
  - Deep Learning
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - cloud
  - restore_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# restore_snapshot()

この操作は、スナップショットを新しいターゲットコレクションに復元します。必要に応じて、データベースをまたいで復元することもできます。復元は非同期で実行されます。進行状況を監視するには、`get_restore_snapshot_state()` を使用します。

<Admonition type="info" title="Note">

ターゲットコレクションはまだ存在しない状態である必要があります。既存のコレクションが存在する場合、復元ジョブは失敗します。スナップショット名はコレクション内でのみ一意であるため、スナップショットを一意に識別するには source_collection_name が必要です。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.restore_snapshot(
```

**パラメータ:**

- **snapshot_name** (*str*) -

    **[必須]**

    復元するスナップショットの名前です。

- **source_collection_name** (*str*) -

    **[必須]**

    スナップショットが属するコレクションです。スナップショットを一意に識別するために必要です。

- **target_collection_name** (*str*) -

    **[必須]**

    スナップショットの復元先となるコレクションです。まだ存在しない状態である必要があります。

- **source_db_name** (*str*) -

    ソースデータベースの名前です。デフォルトでは、アクティブなデータベースが使用されます。

- **target_db_name** (*str*) -

    ターゲットデータベースの名前です。デフォルトでは、アクティブなデータベースが使用されます。

- **timeout** (*Optional[float]*) -

    RPC に許可する秒単位の任意の時間です。

**戻り値の型:**

*int*

**戻り値:**

復元ジョブ ID です。復元の進行状況を追跡するには、この ID を get_restore_snapshot_state() で使用します。

**例外:**

- **MilvusException**

    スナップショットが存在しない場合、ターゲットコレクションがすでに存在する場合、または操作が失敗した場合に、この例外が発生します。スナップショットが存在しない場合、ターゲットコレクションがすでに存在する場合、または操作が失敗した場合に、この例外が発生します。

## 例\{#examples}

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
