---
title: "create_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-create_snapshot
sidebar_label: "create_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection の特定時点のスナップショットを作成します。スナップショットを使用して、災害復旧や移行のために collection データとメタデータをバックアップします。 | Python | MilvusClient"
type: docx
token: C8vld732kopQNMxbHyLcrORNnze
sidebar_position: 1
keywords: 
  - Faiss
  - 動画検索
  - AI 幻覚
  - AI エージェント
  - zilliz
  - zilliz cloud
  - cloud
  - create_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_snapshot()

この操作は、collection の特定時点のスナップショットを作成します。スナップショットを使用して、災害復旧や移行のために collection データとメタデータをバックアップします。

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

**パラメーター:**

- **collection_name** (*str*) -
**[必須]**
スナップショットを作成する collection の名前。

- **snapshot_name** (*str*) -
**[必須]**
スナップショットの一意の名前。既存のスナップショット名と競合してはいけません。

- **description** (*str*) -
スナップショットの任意の人間が読める説明。

- **timeout** (*Optional[float]*) -
RPC に許可する時間の長さ（秒単位）の任意値。指定しない場合は、クライアント側のデフォルトタイムアウトが使用されます。

**戻り値の型:**

*None*

**例外:**

- **MilvusException**

    collection が存在しない場合、スナップショット名がすでに使用されている場合、またはその他の理由で操作が失敗した場合。

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
