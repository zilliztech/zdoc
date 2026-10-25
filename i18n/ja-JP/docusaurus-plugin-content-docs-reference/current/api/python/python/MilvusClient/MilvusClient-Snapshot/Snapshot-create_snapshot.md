---
title: "create_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-create_snapshot
sidebar_label: "create_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a point-in-time snapshot of a コレクション. Use snapshots to back up コレクション data and metadata for disaster recovery or migration. | Python | MilvusClient"
type: docx
token: C8vld732kopQNMxbHyLcrORNnze
sidebar_position: 1
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - create_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_snapshot()

This operation creates a point-in-time snapshot of a コレクション. Use snapshots to back up コレクション data and metadata for disaster recovery or migration.

## リクエスト構文\{#request-syntax}

```python
create_snapshot(
    collection_name: str,
    snapshot_name: str,
    description: str = "",
    timeout: Optional[float] = None,
    **kwargs
) -> None
```

**パラメータ:**

- **collection_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  The name of the コレクション to snapshot.

- **snapshot_name** (*str*) -<br/>
  **[必須]**<br/>
  スナップショットの一意な名前。既存のスナップショット名と競合してはいけません。

- **description** (*str*) -<br/>
  スナップショットの任意の人間が読める説明。

- **timeout** (*Optional[float]*) -<br/>
  RPC に許可される秒単位の任意の時間。指定しない場合は、デフォルトのクライアント側タイムアウトが使用されます。

**戻り値の型:**

*None*

**例外:**

- **MilvusException**

    If the コレクション does not exist, the snapshot name is already taken, or the operation fails for any other reason.

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Recommended: flush before creating snapshot to persist in-memory data
client.flush(collection_name="my_collection")

client.create_snapshot(
    collection_name="my_collection",
    snapshot_name="backup_20260418",
    description="Daily backup before schema change",
)
```
