---
title: "create_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-create_snapshot
sidebar_label: "create_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a point-in-time snapshot of a collection. Use snapshots to back up collection data and metadata for disaster recovery or migration. | Python | MilvusClient"
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

This operation creates a point-in-time snapshot of a collection. Use snapshots to back up collection data and metadata for disaster recovery or migration.

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

- **collection_name** (*str*) -
**[REQUIRED]**
The name of the collection to snapshot.

- **snapshot_name** (*str*) -
**[REQUIRED]**
A unique name for the snapshot. Must not conflict with existing snapshot names.

- **description** (*str*) -
An optional human-readable description of the snapshot.

- **timeout** (*Optional[float]*) -
An optional duration of time in seconds to allow for the RPC. If not provided, the default client-side timeout is used.

**RETURN TYPE:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    If the collection does not exist, the snapshot name is already taken, or the operation fails for any other reason.

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
