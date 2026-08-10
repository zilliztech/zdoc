---
title: "wait_for_loading_complete() | Python | ORM"
slug: /python/python/utility-wait_for_loading_complete
sidebar_label: "wait_for_loading_complete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会阻塞当前进程，直到指定的 Collection 加载完成。 | Python | ORM"
type: docx
token: PLKXdUB1EoNX8gxKHruc9GcEnsg
sidebar_position: 44
keywords: 
  - 托管 Milvus
  - Serverless 向量 Database
  - Milvus 开源
  - Milvus 的工作原理
  - zilliz
  - Zilliz Cloud
  - 云
  - wait_for_loading_complete()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# wait_for_loading_complete()

此操作会阻塞当前进程，直到指定的 Collection 加载完成。

## 请求语法\{#request-syntax}

```python
wait_for_loading_complete(
    collection_name: str,
    partition_names: list[str] | None,
    timeout: float | None,
    using: str = "default",
)
```

**参数：**
**collection_name** (*str*) -

- **partition_names** (*list[str]*) -

    Partition 名称列表。

    如果指定了任何 Partition 名称，此操作会阻塞当前进度，直到指定的 Partition 加载完成。

- **using** (*string*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时间。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get an existing collection
collection = Collection("test_collection")

# Load the collection data
collection.load()

# Wait until the load process completes
utility.wait_for_loading_complete(
    collection_name="test_collection",
    partition_names=["test_partition"],
    timeout=None,
    using="default",
)
```

## 相关操作\{#related-operations}

以下操作与 `wait_for_loading_complete()` 相关：

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [release()](./Collection-release)

- [load_state()](./utility-load_state)

- [loading_progress()](./utility-loading_progress)

