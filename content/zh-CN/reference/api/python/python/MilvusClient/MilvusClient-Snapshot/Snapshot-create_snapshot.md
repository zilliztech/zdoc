---
title: "create_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-create_snapshot
sidebar_label: "create_snapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建 Collection 的时间点快照。您可以使用快照备份 Collection 数据和元数据，以便进行灾难恢复或迁移。 | Python | MilvusClient"
type: docx
token: C8vld732kopQNMxbHyLcrORNnze
sidebar_position: 1
keywords: 
  - Faiss
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - Zilliz
  - Zilliz Cloud
  - 云
  - create_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_snapshot()

此操作会创建 Collection 的时间点快照。您可以使用快照备份 Collection 数据和元数据，以便进行灾难恢复或迁移。

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

- **collection_name** （*str*） -<br/>
  **[必需]**<br/>
  要创建快照的 Collection 的名称。

- **snapshot_name** （*str*） -<br/>
  **[必需]**<br/>
  快照的唯一名称。不得与现有快照名称冲突。

- **description** （*str*） -<br/>
  快照的可选人类可读描述。

- **timeout** （*Optional[float]*） -<br/>
  允许 RPC 执行的持续时间，单位为秒，此参数为可选。如果未提供，则使用默认的客户端超时时间。

**返回类型：**

*None*

**异常：**

- **MilvusException**

    如果 Collection 不存在、快照名称已被使用，或操作因任何其他原因失败，则会引发此异常。

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
