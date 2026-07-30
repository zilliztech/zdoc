---
title: "create_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-create_snapshot
sidebar_label: "create_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为集合创建某一时间点的快照。使用快照可备份集合数据和元数据，以便进行灾难恢复或迁移。 | Python | MilvusClient"
type: docx
token: C8vld732kopQNMxbHyLcrORNnze
sidebar_position: 1
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - create_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_snapshot()

此操作会为集合创建某一时间点的快照。使用快照可备份集合数据和元数据，以便进行灾难恢复或迁移。

## 请求语法\{#request-syntax}

```python
create_snapshot(
    collection_name: str,
    snapshot_name: str,
    description: str = "",
    timeout: Optional[float] = None,
    **kwargs
) -> None
```

**参数：**

- **collection_name** (*str*) -
**[必需]**
要创建快照的集合名称。

- **snapshot_name** (*str*) -
**[必需]**
快照的唯一名称。不得与现有快照名称冲突。

- **description** (*str*) -
快照的可选人类可读描述。

- **timeout** (*Optional[float]*) -
可选的 RPC 允许时长，单位为秒。如果未提供，则使用客户端默认超时时间。

**返回类型：**

*None*

**异常：**

- **MilvusException**

    如果集合不存在、快照名称已被占用，或者操作因其他任何原因失败。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Recommended: flush before creating snapshot to persist in-memory data
client.flush(collection_name="my_collection")

client.create_snapshot(
    collection_name="my_collection",
    snapshot_name="backup_20260418",
    description="Daily backup before schema change",
)
```
