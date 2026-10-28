---
title: "list_restore_snapshot_jobs() | Python | MilvusClient"
slug: /python/python/Snapshot-list_restore_snapshot_jobs
sidebar_label: "list_restore_snapshot_jobs()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有恢复快照作业。您也可以按 Collection 名称进行筛选，以查看针对特定 Collection 的恢复作业。 | Python | MilvusClient"
type: docx
token: PtHQdGNfaoI4Mux05rbcRWTVnMp
sidebar_position: 5
keywords: 
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - list_restore_snapshot_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_restore_snapshot_jobs()

此操作会列出所有恢复快照作业。您也可以按 Collection 名称进行筛选，以查看针对特定 Collection 的恢复作业。

## 请求语法\{#request-syntax}

```python
list_restore_snapshot_jobs(
```

**参数：**

- **collection_name** (*str*) -

    可选的 Collection 名称，用于筛选恢复作业。如果为空，则列出所有恢复作业。

- **db_name** (*str*) -

    可选的 Database 名称，用于筛选恢复作业。如果为空，则使用默认 Database。

- **timeout** (*Optional[float]*) -

    允许 RPC 执行的可选时长，单位为秒。

**返回类型：**

*List[RestoreSnapshotJobInfo]*

**返回：**

RestoreSnapshotJobInfo 对象列表，每个对象都包含恢复作业信息，字段如下：

**异常：**

- **MilvusException**

    如果操作失败。如果操作失败。

## 示例\{#examples}

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
