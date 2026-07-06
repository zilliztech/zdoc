---
title: "restore_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-restore_snapshot
sidebar_label: "restore_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation restores a snapshot to a target collection. The restore runs asynchronously — use `getrestoresnapshotstate()` to monitor progress. | Python | MilvusClient"
type: docx
token: I2OZdk40IomugOx9MTqcooVcnEf
sidebar_position: 8
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - restore_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# restore_snapshot()

This operation restores a snapshot to a target collection. The restore runs asynchronously — use `get_restore_snapshot_state()` to monitor progress.

## Request Syntax\{#request-syntax}

```python
restore_snapshot(
    collection_name: str,
    snapshot_name: str,
    rewrite_data: bool = False,
    timeout: Optional[float] = None,
    **kwargs
) -> int
```

**PARAMETERS:**

- **collection_name** (*str*) -
**[REQUIRED]**
The name of the target collection to restore the snapshot into.

- **snapshot_name** (*str*) -
**[REQUIRED]**
The name of the snapshot to restore.

- **rewrite_data** (*bool*) -
Whether to overwrite existing data in the target collection. Defaults to *False*.

- **timeout** (*Optional[float]*) -
An optional duration of time in seconds to allow for the RPC.

**RETURN TYPE:**

*int*

The restore job ID. Use this ID with `get_restore_snapshot_state()` to track the restore progress.

**EXCEPTIONS:**

- **MilvusException**

    If the snapshot does not exist, the target collection is unavailable, or the operation fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient
import time

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Start restore and get job ID
job_id = client.restore_snapshot(
    snapshot_name="backup_20260418",
    collection_name="restored_collection",
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
