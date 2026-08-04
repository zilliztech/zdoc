---
title: "unpin_snapshot_data() | Python | MilvusClient"
slug: /python/python/Snapshot-unpin_snapshot_data
sidebar_label: "unpin_snapshot_data()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会释放由 `pinsnapshotdata()` 创建的快照固定，以便正常的快照数据垃圾回收可以恢复。 | Python | MilvusClient"
type: docx
token: RSOkdriHRoRd8ixyVZOch1l9nDd
sidebar_position: 9
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - unpin_snapshot_data()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# unpin_snapshot_data()

此操作会释放由 `pin_snapshot_data()` 创建的快照固定，以便正常的快照数据垃圾回收可以恢复。

## 请求语法\{#request-syntax}

```python
unpin_snapshot_data(
    self,
    pin_id: int,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**参数：**

- **pin_id** (*int*) -

    `pin_snapshot_data()` 返回的 pin ID。

- **timeout** (*Optional[float]*) -

    此操作的超时时间，单位为秒。

- **kwargs** (*dict*) -

    传递给底层 RPC 的其他请求选项。

**返回类型：**

*NoneType*

此操作不返回数据。

**异常：**

- **MilvusException**

    当 pin 不存在、已过期，或请求失败时抛出。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

pin_id = client.pin_snapshot_data(
    snapshot_name="backup_20260509",
    collection_name="products",
)

client.unpin_snapshot_data(pin_id=pin_id)
```
