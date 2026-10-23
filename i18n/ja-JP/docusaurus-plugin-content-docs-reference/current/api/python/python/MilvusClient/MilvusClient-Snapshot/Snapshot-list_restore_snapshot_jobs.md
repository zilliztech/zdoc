---
title: "list_restore_snapshot_jobs() | Python | MilvusClient"
slug: /python/python/Snapshot-list_restore_snapshot_jobs
sidebar_label: "list_restore_snapshot_jobs()"
beta: PRIVATE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、すべての復元スナップショットジョブを一覧表示します。必要に応じてコレクション名でフィルタリングし、特定のコレクションを対象とする復元ジョブを確認できます。 | Python | MilvusClient"
type: docx
token: PtHQdGNfaoI4Mux05rbcRWTVnMp
sidebar_position: 5
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - ベクトル埋め込み
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

この操作は、すべての復元スナップショットジョブを一覧表示します。必要に応じてコレクション名でフィルタリングし、特定のコレクションを対象とする復元ジョブを確認できます。

## Request Syntax\{#request-syntax}

```python
list_restore_snapshot_jobs(
```

**PARAMETERS:**

- **collection_name** (*str*) -

    復元ジョブをフィルタリングするためのオプションのコレクション名です。空の場合、すべての復元ジョブが一覧表示されます。

- **db_name** (*str*) -

    復元ジョブをフィルタリングするためのオプションのデータベース名です。空の場合、デフォルトのデータベースが使用されます。

- **timeout** (*Optional[float]*) -

    RPC に許容される時間を秒単位で指定するオプションです。

**RETURN TYPE:**

*List[RestoreSnapshotJobInfo]*

**RETURNS:**

RestoreSnapshotJobInfo オブジェクトのリストです。各オブジェクトには、以下のフィールドを含む復元ジョブ情報が格納されます。

**EXCEPTIONS:**

- **MilvusException**

    操作が失敗した場合。操作が失敗した場合。

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
