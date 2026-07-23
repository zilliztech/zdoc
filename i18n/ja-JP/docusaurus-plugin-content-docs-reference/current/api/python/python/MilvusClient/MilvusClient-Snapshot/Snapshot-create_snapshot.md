---
title: "create_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-create_snapshot
sidebar_label: "create_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection の特定時点の snapshot を作成します。snapshot は、災害復旧や移行のために collection のデータとメタデータをバックアップする際に使用します。 | Python | MilvusClient"
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

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_snapshot()

この操作は、collection の特定時点の snapshot を作成します。snapshot は、災害復旧や移行のために collection のデータとメタデータをバックアップする際に使用します。

## Request Syntax\{#request-syntax}

```python
create_snapshot(
    collection_name: str,
    snapshot_name: str,
    description: str = "",
    timeout: Optional[float] = None,
    **kwargs
) -> None
```

**PARAMETERS:**

- **collection_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  snapshot を作成する collection の名前です。

- **snapshot_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  snapshot の一意な名前です。既存の snapshot 名と重複してはいけません。

- **description** (*str*) -<br/>
  snapshot の任意の人が読める説明です。

- **timeout** (*Optional[float]*) -<br/>
  RPC に許可する秒単位の任意の時間です。指定しない場合は、クライアント側のデフォルトのタイムアウトが使用されます。

**RETURN TYPE:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    collection が存在しない場合、snapshot 名がすでに使用されている場合、またはその他の理由で操作に失敗した場合。

## Examples\{#examples}

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
