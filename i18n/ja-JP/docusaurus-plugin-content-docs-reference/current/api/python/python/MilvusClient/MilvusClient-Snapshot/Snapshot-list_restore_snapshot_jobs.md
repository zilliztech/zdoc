---
title: "list_restore_snapshot_jobs() | Python | MilvusClient"
slug: /python/python/Snapshot-list_restore_snapshot_jobs
sidebar_label: "list_restore_snapshot_jobs()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべての restore snapshot ジョブを一覧表示します。必要に応じて collection 名でフィルタリングし、特定の collection を対象とする restore ジョブを表示できます。 | Python | MilvusClient"
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

この操作は、すべての restore snapshot ジョブを一覧表示します。必要に応じて collection 名でフィルタリングし、特定の collection を対象とする restore ジョブを表示できます。

## Request Syntax\{#request-syntax}

```python
list_restore_snapshot_jobs(
    collection_name: str = "",
    timeout: Optional[float] = None,
    **kwargs
) -> List[RestoreSnapshotJobInfo]
```

**PARAMETERS:**

- **collection_name** (*str*) -
restore ジョブをフィルタリングするための省略可能な collection 名です。空の場合、すべての restore ジョブが一覧表示されます。

- **timeout** (*Optional[float]*) -
RPC に許可する秒単位の省略可能な時間です。

**RETURN TYPE:**

*List[RestoreSnapshotJobInfo]*

**RETURNS:**

各 restore ジョブ情報を含む RestoreSnapshotJobInfo オブジェクトのリストです。各オブジェクトには次のフィールドが含まれます。

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

    restore ジョブ ID。

- **snapshot_name** (*str*) -

    復元対象の snapshot 名。

- **db_name** (*str*) -

    対象 database 名。

- **collection_name** (*str*) -

    対象 collection 名。

- **state** (*str*) -

    現在の状態。指定可能な値: *RestoreSnapshotNone*, *RestoreSnapshotPending*, *RestoreSnapshotExecuting*, *RestoreSnapshotCompleted*, *RestoreSnapshotFailed*。

- **progress** (*int*) -

    進行率のパーセンテージ (0-100)。

- **reason** (*str*) -

    ジョブが失敗した場合のエラー理由。

- **start_time** (*int*) -

    開始タイムスタンプ（ミリ秒）。

- **time_cost** (*int*) -

    所要時間（ミリ秒）。

**EXCEPTIONS:**

- **MilvusException**

    操作が失敗した場合。

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
