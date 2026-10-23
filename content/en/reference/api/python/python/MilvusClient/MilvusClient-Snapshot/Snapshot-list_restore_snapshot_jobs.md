---
title: "list_restore_snapshot_jobs() | Python | MilvusClient"
slug: /python/python/Snapshot-list_restore_snapshot_jobs
sidebar_label: "list_restore_snapshot_jobs()"
beta: PRIVATE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all restore snapshot jobs. Optionally filter by collection name to see restore jobs targeting a specific collection. | Python | MilvusClient"
type: docx
token: PtHQdGNfaoI4Mux05rbcRWTVnMp
sidebar_position: 5
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - list_restore_snapshot_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_restore_snapshot_jobs()

This operation lists all restore snapshot jobs. Optionally filter by collection name to see restore jobs targeting a specific collection.

## Request Syntax\{#request-syntax}

```python
list_restore_snapshot_jobs(
```

**PARAMETERS:**

- **collection_name** (*str*) -

    An optional collection name to filter restore jobs. If empty, all restore jobs are listed.

- **db_name** (*str*) -

    An optional database name to filter restore jobs. If empty, the default database is used.

- **timeout** (*Optional[float]*) -

    An optional duration of time in seconds to allow for the RPC.

**RETURN TYPE:**

*List[RestoreSnapshotJobInfo]*

**RETURNS:**

A list of RestoreSnapshotJobInfo objects, each containing restore job information with the following fields:.

**EXCEPTIONS:**

- **MilvusException**

    If the operation fails. If the operation fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# List all restore jobs
jobs = client.list_restore_snapshot_jobs()
for job in jobs:
    print(f"Job {job.job_id}: {job.snapshot_name} -> {job.collection_name} ({job.state})")

# Filter by target collection
jobs = client.list_restore_snapshot_jobs(collection_name="my_collection")
```
