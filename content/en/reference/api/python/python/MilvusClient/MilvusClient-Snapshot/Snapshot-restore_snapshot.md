---
title: "restore_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-restore_snapshot
sidebar_label: "restore_snapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation restores a snapshot to a new target collection, optionally across databases. The restore runs asynchronously — use `getrestoresnapshotstate()` to monitor progress. | Python | MilvusClient"
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

---

import Admonition from '@theme/Admonition';


# restore_snapshot()

This operation restores a snapshot to a new target collection, optionally across databases. The restore runs asynchronously — use `get_restore_snapshot_state()` to monitor progress.

<Admonition type="info" title="Note">

The target collection must not already exist; an existing collection causes the restore job to fail. The source_collection_name is required to uniquely identify the snapshot, because snapshot names are only unique within a collection.

</Admonition>

## Request Syntax\{#request-syntax}

```python
client.restore_snapshot(
```

**PARAMETERS:**

- **snapshot_name** (*str*) -

    **[REQUIRED]**

    The name of the snapshot to restore.

- **source_collection_name** (*str*) -

    **[REQUIRED]**

    The collection that the snapshot belongs to. Required to uniquely identify the snapshot.

- **target_collection_name** (*str*) -

    **[REQUIRED]**

    The collection that the snapshot is restored into. Must not already exist.

- **source_db_name** (*str*) -

    The source database name. Defaults to the active database.

- **target_db_name** (*str*) -

    The target database name. Defaults to the active database.

- **timeout** (*Optional[float]*) -

    An optional duration of time in seconds to allow for the RPC.

**RETURN TYPE:**

*int*

**RETURNS:**

The restore job ID. Use this ID with get_restore_snapshot_state() to track the restore progress.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when the snapshot does not exist, the target collection already exists, or the operation fails. This exception will be raised when the snapshot does not exist, the target collection already exists, or the operation fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient
import time

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Start restore and get the job ID
job_id = client.restore_snapshot(
    snapshot_name="backup_20260418",
    source_collection_name="my_collection",
    target_collection_name="restored_collection",
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
