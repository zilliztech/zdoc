---
title: "create_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-create_snapshot
sidebar_label: "create_snapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、コレクションの特定時点のスナップショットを作成します。スナップショットは、ディザスタリカバリや移行のためにコレクションデータとメタデータをバックアップする場合に使用します。 | Python | MilvusClient"
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

この操作では、コレクションの特定時点のスナップショットを作成します。スナップショットは、ディザスタリカバリや移行のためにコレクションデータとメタデータをバックアップする場合に使用します。

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

**パラメーター：**

- **collection_name** (*str*) -<br/>
  **[必須]**<br/>
  スナップショットを作成するコレクションの名前です。

- **snapshot_name** (*str*) -<br/>
  **[必須]**<br/>
  スナップショットの一意の名前です。既存のスナップショット名と競合してはいけません。

- **description** (*str*) -<br/>
  スナップショットの人間が読める任意の説明です。

- **timeout** (*Optional[float]*) -<br/>
  RPC に許容される秒単位の任意の時間です。指定しない場合は、デフォルトのクライアント側タイムアウトが使用されます。

**戻り値の型：**

*None*

**例外：**

- **MilvusException**

    コレクションが存在しない場合、スナップショット名がすでに使用されている場合、またはその他の理由で操作が失敗した場合に発生します。

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
