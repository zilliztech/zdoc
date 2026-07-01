---
title: "drop_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-drop_snapshot
sidebar_key: python/Snapshot-drop_snapshot
sidebar_label: "drop_snapshot()"
added_since: v3.0.x
last_modified: false
deprecate_since: false
beta: PRIVATE
notebook: false
description: "This operation permanently deletes a snapshot. Once dropped, the snapshot data cannot be recovered. | Python | MilvusClient"
type: docx
token: UknCdYmtRoVIZ9xWcLnc02b0ndZ
sidebar_position: 3
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_snapshot()

This operation permanently deletes a snapshot. Once dropped, the snapshot data cannot be recovered.

## Request Syntax\{#request-syntax}

```python
drop_snapshot(
    snapshot_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> None
```

**PARAMETERS:**

- **snapshot_name** (*str*) -
**[REQUIRED]**
The name of the snapshot to drop.

- **timeout** (*Optional[float]*) -
An optional duration of time in seconds to allow for the RPC.

**RETURN TYPE:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    If the snapshot does not exist or the operation fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.drop_snapshot(snapshot_name="backup_20260401")
```
