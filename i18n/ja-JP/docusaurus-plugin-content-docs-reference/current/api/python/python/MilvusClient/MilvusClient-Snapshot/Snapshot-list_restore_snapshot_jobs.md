---
title: "list_restore_snapshot_jobs() | Python | MilvusClient"
slug: /python/python/Snapshot-list_restore_snapshot_jobs
sidebar_label: "list_restore_snapshot_jobs()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、すべてのスナップショットのリストアジョブを一覧表示します。必要に応じてコレクション名で絞り込み、特定のコレクションを対象とするリストアジョブを表示できます。 | Python | MilvusClient"
type: docx
token: PtHQdGNfaoI4Mux05rbcRWTVnMp
sidebar_position: 5
keywords: 
  - kNN アルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - zilliz
  - zilliz cloud
  - クラウド
  - list_restore_snapshot_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_restore_snapshot_jobs()

この操作では、すべてのスナップショットのリストアジョブを一覧表示します。必要に応じてコレクション名で絞り込み、特定のコレクションを対象とするリストアジョブを表示できます。

## リクエスト構文\{#request-syntax}

```python
list_restore_snapshot_jobs(
```

**パラメーター:**

- **collection_name** (*str*) -

    リストアジョブを絞り込むためのコレクション名（省略可能）です。空の場合は、すべてのリストアジョブが一覧表示されます。

- **db_name** (*str*) -

    リストアジョブを絞り込むためのデータベース名（省略可能）です。空の場合は、デフォルトのデータベースが使用されます。

- **timeout** (*Optional[float]*) -

    RPC に許可する時間（秒）を指定します（省略可能）。

**戻り値の型:**

*List[RestoreSnapshotJobInfo]*

**戻り値:**

RestoreSnapshotJobInfo オブジェクトのリストを返します。各オブジェクトには、次のフィールドを含むリストアジョブ情報が格納されます。

**例外:**

- **MilvusException**

    操作が失敗した場合に発生します。操作が失敗した場合に発生します。

## 例\{#examples}

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
