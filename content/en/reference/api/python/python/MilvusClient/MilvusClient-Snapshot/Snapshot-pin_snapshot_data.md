---
title: "pin_snapshot_data() | Python | MilvusClient"
slug: /python/python/Snapshot-pin_snapshot_data
sidebar_label: "pin_snapshot_data()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation pins snapshot data for a period of time so garbage collection does not remove it while you export or back up files. | Python | MilvusClient"
type: docx
token: NqWDdRxKYoi6uTxHaYEcafx9nGc
sidebar_position: 7
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - pin_snapshot_data()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# pin_snapshot_data()

This operation pins snapshot data for a period of time so garbage collection does not remove it while you export or back up files.

## Request Syntax\{#request-syntax}

```python
pin_snapshot_data(
```

**PARAMETERS:**

- **snapshot_name** (*str*) -

    The snapshot name to pin.

- **collection_name** (*str*) -

    The collection that owns the snapshot.

- **db_name** (*str*) -

    The database name. Leave empty to use the active database.

- **ttl_seconds** (*int*) -

    An option that pin lifetime in seconds. 0 uses the server default TTL.

- **timeout** (*Optional[float]*) -

    The timeout for this operation in seconds.

- **kwargs** (*dict*) -

    Additional request options passed to the underlying RPC.

**RETURN TYPE:**

*int*

**RETURNS:**

The pin_id used to release this pin with unpin_snapshot_data().

**EXCEPTIONS:**

- **MilvusException**

    Raised when the snapshot cannot be pinned or the request fails. Raised when the snapshot cannot be pinned or the request fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

pin_id = client.pin_snapshot_data(
    snapshot_name="backup_20260509",
    collection_name="products",
    ttl_seconds=3600,
)

# Copy snapshot data to external storage here.

client.unpin_snapshot_data(pin_id=pin_id)
```
