---
title: "list_snapshots() | Python | MilvusClient"
slug: /python/python/Snapshot-list_snapshots
sidebar_key: python/Snapshot-list_snapshots
sidebar_label: "list_snapshots()"
added_since: v3.0.x
last_modified: false
deprecate_since: false
beta: PRIVATE
notebook: false
description: "This operation lists all snapshot names. Optionally filter by collection name to list snapshots belonging to a specific collection. | Python | MilvusClient"
type: docx
token: WgmLdM6nUogd7LxGtmfc5dBKnku
sidebar_position: 6
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - list_snapshots()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_snapshots()

This operation lists all snapshot names. Optionally filter by collection name to list snapshots belonging to a specific collection.

## Request Syntax\{#request-syntax}

```python
list_snapshots(
    collection_name: str = "",
    timeout: Optional[float] = None,
    **kwargs
) -> List[str]
```

**PARAMETERS:**

- **collection_name** (*str*) -
An optional collection name to filter snapshots. If empty, all snapshots are listed.

- **timeout** (*Optional[float]*) -
An optional duration of time in seconds to allow for the RPC.

**RETURN TYPE:**

*List[str]*

A list of snapshot names.

**EXCEPTIONS:**

- **MilvusException**

    If the operation fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# List all snapshots for a specific collection
snapshots = client.list_snapshots(collection_name="my_collection")
print(snapshots)
# ['backup_20260401', 'backup_20260418']

# List all snapshots across all collections
all_snapshots = client.list_snapshots()
```
