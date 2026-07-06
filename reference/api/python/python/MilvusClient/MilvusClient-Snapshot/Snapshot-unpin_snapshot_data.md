---
title: "unpin_snapshot_data() | Python | MilvusClient"
slug: /python/python/Snapshot-unpin_snapshot_data
sidebar_label: "unpin_snapshot_data()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation releases a snapshot pin created by `pinsnapshotdata()` so normal snapshot data garbage collection can resume. | Python | MilvusClient"
type: docx
token: RSOkdriHRoRd8ixyVZOch1l9nDd
sidebar_position: 9
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - unpin_snapshot_data()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# unpin_snapshot_data()

This operation releases a snapshot pin created by `pin_snapshot_data()` so normal snapshot data garbage collection can resume.

## Request Syntax\{#request-syntax}

```python
unpin_snapshot_data(
    self,
    pin_id: int,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**PARAMETERS:**

- **pin_id** (*int*) -

    The pin ID returned by `pin_snapshot_data()`.

- **timeout** (*Optional[float]*) -

    The timeout for this operation in seconds.

- **kwargs** (*dict*) -

    Additional request options passed to the underlying RPC.

**RETURN TYPE:**

*NoneType*

This operation does not return data.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the pin does not exist, has already expired, or the request fails.

## Example\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

pin_id = client.pin_snapshot_data(
    snapshot_name="backup_20260509",
    collection_name="products",
)

client.unpin_snapshot_data(pin_id=pin_id)
```
