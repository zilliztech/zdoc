---
title: "load_balance() | Python | ORM"
slug: /python/python/utility-load_balance
sidebar_label: "load_balance()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为特定 collection 的两个 query node 建立负载均衡组。 | Python | ORM"
type: docx
token: XYNMdg3Vpo3SE7xTRVqcJNvrn0d
sidebar_position: 32
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - load_balance()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load_balance()

此操作会为特定 collection 的两个 query node 建立负载均衡组。

## 请求语法\{#request-syntax}

```python
load_balance(
    collection_name: str,
    src_node_id: int,
    dst_node_ids: list[int] | None,
    sealed_segment_ids: list[int] | None,
    timeout: float | None,
    using: str = "default",
)
```

**参数：**

- **collection_name** (*str*) -<br/>
  **[必需]**

    要为其建立负载均衡组的现有 collection 名称。

- **src_node_id** (*int*) -<br/>
  **[必需]**

    当前该 collection 所使用的 query node 的 ID。

- **dst_node_ids** (*list[int]*) -

    要添加到负载均衡组中的 query node 的 ID。

- **sealed_segment_ids** (*list[int]*) -

    要进行负载均衡的 sealed segment 的 ID。

- **timeout** (*float*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

**返回类型：**

*NoneType*

**返回：**
None

**异常：**

N/A

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

utility.load_balance(
    collection_name="test_collection",
    src_node_id=446781855410073001,
    dst_node_ids=[478798283048914039],
    sealed_segment_ids=None,
)
```

