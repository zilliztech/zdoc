---
title: "drop_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-drop_snapshot
sidebar_label: "drop_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会永久删除一个快照。删除后，快照数据将无法恢复。 | Python | MilvusClient"
type: docx
token: UknCdYmtRoVIZ9xWcLnc02b0ndZ
sidebar_position: 3
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_snapshot()

此操作会永久删除一个快照。删除后，快照数据将无法恢复。

## 请求语法\{#request-syntax}

```python
drop_snapshot(
    snapshot_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> None
```

**参数：**

- **snapshot_name** (*str*) -
**[必需]**
要删除的快照名称。

- **timeout** (*Optional[float]*) -
RPC 允许的可选持续时间，单位为秒。

**返回类型：**

*None*

**异常：**

- **MilvusException**

    如果快照不存在或操作失败。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.drop_snapshot(snapshot_name="backup_20260401")
```
