---
title: "get_restore_snapshot_state() | Python | MilvusClient"
slug: /python/python/Snapshot-get_restore_snapshot_state
sidebar_key: python/Snapshot-get_restore_snapshot_state
sidebar_label: "get_restore_snapshot_state()"
added_since: v3.0.x
last_modified: false
deprecate_since: false
beta: PRIVATE
notebook: false
description: "This operation queries the status and progress of an asynchronous restore snapshot job. | Python | MilvusClient"
type: docx
token: Ky0pdpA6WorUvbxwN3ucwUjgnec
sidebar_position: 4
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - zilliz
  - zilliz cloud
  - cloud
  - get_restore_snapshot_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_restore_snapshot_state()

This operation queries the status and progress of an asynchronous restore snapshot job.

## Request Syntax\{#request-syntax}

```python
get_restore_snapshot_state(
    job_id: int,
    timeout: Optional[float] = None,
    **kwargs
) -> RestoreSnapshotJobInfo
```

**PARAMETERS:**

- **job_id** (*int*) -
**[REQUIRED]**
The restore job ID returned by `restore_snapshot()`.

- **timeout** (*Optional[float]*) -
An optional duration of time in seconds to allow for the RPC.

**RETURN TYPE:**

*RestoreSnapshotJobInfo*

**RETURNS:**

A dataclass containing restore job information with the following fields:

```python
{
    'job_id': int,
    'snapshot_name': str,
    'db_name': str,
    'collection_name': str,
    'state': str,
    'progress': int,
    'reason': str,
    'start_time': int,
    'time_cost': int
}
```

**PARAMETERS:**

- **job_id** (*int*) -

    The restore job ID.

- **snapshot_name** (*str*) -

    The snapshot name being restored.

- **db_name** (*str*) -

    The target database name.

- **collection_name** (*str*) -

    The target collection name.

- **state** (*str*) -

    Current state. Possible values: *RestoreSnapshotNone*, *RestoreSnapshotPending*, *RestoreSnapshotExecuting*, *RestoreSnapshotCompleted*, *RestoreSnapshotFailed*.

- **progress** (*int*) -

    Progress percentage (0-100).

- **reason** (*str*) -

    Error reason if the job failed.

- **start_time** (*int*) -

    Start timestamp in milliseconds.

- **time_cost** (*int*) -

    Time cost in milliseconds.

**EXCEPTIONS:**

- **MilvusException**

    If the job ID is invalid or the operation fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

state = client.get_restore_snapshot_state(job_id=12345)
print(f"State: {state.state}")
print(f"Progress: {state.progress}%")

if state.state == "RestoreSnapshotFailed":
    print(f"Error: {state.reason}")
```
