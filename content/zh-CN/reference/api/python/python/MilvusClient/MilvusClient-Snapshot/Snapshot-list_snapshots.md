---
title: "list_snapshots() | Python | MilvusClient"
slug: /python/python/Snapshot-list_snapshots
sidebar_label: "list_snapshots()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有快照名称。也可以按集合名称进行筛选，以列出属于特定集合的快照。 | Python | MilvusClient"
type: docx
token: WgmLdM6nUogd7LxGtmfc5dBKnku
sidebar_position: 6
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - list_snapshots()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_snapshots()

此操作会列出所有快照名称。也可以按集合名称进行筛选，以列出属于特定集合的快照。

## 请求语法\{#request-syntax}

```python
list_snapshots(
    collection_name: str = "",
    timeout: Optional[float] = None,
    **kwargs
) -> List[str]
```

**参数：**

- **collection_name** (*str*) -
用于筛选快照的可选集合名称。如果为空，则列出所有快照。

- **timeout** (*Optional[float]*) -
允许 RPC 执行的可选时长，单位为秒。

**返回类型：**

*List[str]*

快照名称列表。

**异常：**

- **MilvusException**

    如果操作失败。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# 列出特定集合的所有快照
snapshots = client.list_snapshots(collection_name="my_collection")
print(snapshots)
# ['backup_20260401', 'backup_20260418']

# 列出所有集合中的全部快照
all_snapshots = client.list_snapshots()
```
