---
title: "list_snapshots() | Python | MilvusClient"
slug: /python/python/Snapshot-list_snapshots
sidebar_label: "list_snapshots()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有快照名称。您可以选择按 Collection 名称进行筛选，以列出属于特定 Collection 的快照。 | Python | MilvusClient"
type: docx
token: WgmLdM6nUogd7LxGtmfc5dBKnku
sidebar_position: 6
keywords: 
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - Zilliz
  - Zilliz Cloud
  - 云
  - list_snapshots()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_snapshots()

此操作会列出所有快照名称。您可以选择按 Collection 名称进行筛选，以列出属于特定 Collection 的快照。

## 请求语法\{#request-syntax}

```python
list_snapshots(
```

**参数：**

- **collection_name** （*str*） -

    用于筛选快照的可选 Collection 名称。如果为空，则会列出所有快照。

- **db_name** （*str*） -

    用于筛选快照的可选 Database 名称。如果为空，则使用默认 Database。

- **timeout** （*Optional[float]*） -

    允许 RPC 运行的可选持续时间，单位为秒。

**返回类型：**

*List[str]*

**返回：**

快照名称列表。

**异常：**

- **MilvusException**

    如果操作失败。如果操作失败。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# List all snapshots for a specific collection
snapshots = client.list_snapshots(collection_name="my_collection")
print(snapshots)
# ['backup_20260401', 'backup_20260418']

# List snapshots for another collection
all_snapshots = client.list_snapshots(collection_name="my_other_collection")
```
