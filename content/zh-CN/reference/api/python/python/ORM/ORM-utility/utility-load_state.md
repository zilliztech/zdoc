---
title: "load_state() | Python | ORM"
slug: /python/python/utility-load_state
sidebar_label: "load_state()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回特定 Collection 的加载状态。 | Python | ORM"
type: docx
token: BJysdlj1MoksHZxNRxicHn9fnSh
sidebar_position: 33
keywords: 
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - zilliz
  - zilliz cloud
  - 云
  - load_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load_state()

此操作返回特定 Collection 的加载状态。

## 请求语法\{#request-syntax}

```python
load_state(
    collection_name: str,
    partition_names: list[str] | None
    using: str = "default",
    timeout: float | None
) -> LoadState
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    Collection 的名称。

- **partition_names** (*list[str]*) -

    Partition 名称列表。

    如果指定了任意 Partition 名称，释放其中任意一个 Partition 都会返回 **NotLoad** 状态。

- **using** (*string*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回类型：**

*LoadState*

**返回：**
表示指定 Collection 加载状态的 **LoadState** 对象。

可能的状态如下：

- **Loaded**

    表示指定 Collection 已加载。

- **Loading**

    表示指定 Collection 正在加载。

- **NotExist**

    表示指定 Collection 不存在。 

    如果在 **partition_names** 中包含不存在的 Partition，则会导致 **MilvusException**。

- **NotLoad**

    表示指定 Collection 未加载。

**异常：**

- **MilvusException**

    当此操作期间发生任意错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import (
    connections, 
    Collection, 
    CollectionSchema, 
    FieldSchema, 
    DataType, 
    utility,
)

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a collection
collection = Collection(
    name="test_collection",
    schema=CollectionSchema([
        FieldSchema("id", DataType.INT64, is_primary=True),
        FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
    ])
)

# Set the index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {
        "nprobe": 10
    }
}

# Create an index on the vector field
collection.create_index(
    field_name="vector", 
    index_params=index_params, 
    timeout=None
)

# Load the collection
collection.load()

# Create two partitions
partition1 = collection.create_partition("partition1")
partition2 = collection.create_partition("partition2")

# Check the load
utility.load_state(
    collection_name="test_collection",
    partition_names=["partition1", "partition2"],
    using=using,
    timeout=timeout,
) # <LoadState: Loaded>

# Release a partition
partition2.release()

utility.load_state(collection_name="test_collection") # <LoadState: Loaded>

utility.load_state(
    collection_name="test_collection",
    partition_names=["partition1", "partition2"],
) # <LoadState: NotLoad>
```

## 相关操作\{#related-operations}

以下操作与 `load_state()` 相关：

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [release()](./Collection-release)

- [loading_progress()](./utility-loading_progress)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

