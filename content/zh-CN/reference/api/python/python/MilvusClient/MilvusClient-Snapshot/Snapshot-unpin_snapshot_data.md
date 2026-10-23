---
title: "unpin_snapshot_data() | Python | MilvusClient"
slug: /python/python/Snapshot-unpin_snapshot_data
sidebar_label: "unpin_snapshot_data()"
beta: PRIVATE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会释放由 `pinsnapshotdata()` 创建的快照固定，以便正常的快照数据垃圾回收（Collection）可以恢复。 | Python | MilvusClient"
type: docx
token: RSOkdriHRoRd8ixyVZOch1l9nDd
sidebar_position: 9
keywords: 
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - 异常检测
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

此操作会释放由 `pin_snapshot_data()` 创建的快照固定，以便正常的快照数据垃圾回收（Collection）可以恢复。

## 请求语法\{#request-syntax}

```python
unpin_snapshot_data(
```

**参数：**

- **pin_id** (*int*) -

    由 pin_snapshot_data() 返回的 pin ID。

- **timeout** (*Optional[float]*) -

    此操作的超时时间，以秒为单位。

- **kwargs** (*dict*) -

    传递给底层 RPC 的附加请求选项。

**返回类型：**

*NoneType*

**返回：**

此操作不返回数据。

**异常：**

- **MilvusException**

    当 pin 不存在、已过期或请求失败时引发。当 pin 不存在、已过期或请求失败时引发。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

pin_id = client.pin_snapshot_data(
    snapshot_name="backup_20260509",
    collection_name="products",
)

client.unpin_snapshot_data(pin_id=pin_id)
```
