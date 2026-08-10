---
title: "loading_progress() | Python | ORM"
slug: /python/python/utility-loading_progress
sidebar_label: "loading_progress()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回特定 Collection 的加载进度。 | Python | ORM"
type: docx
token: HQiHd82orov0XvxAzLWcl5xRnzc
sidebar_position: 31
keywords: 
  - milvus 向量 Database
  - milvus 数据库
  - milvus 向量 db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - 云
  - loading_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# loading_progress()

此操作返回特定 Collection 的加载进度。

## 请求语法\{#request-syntax}

```python
loading_progress(
    collection_name: str,
    partition_names: list[str] | None,
    using: str = "default",
    timeout: float | None,
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    Collection 的名称。

- **partition_names** (*list[str]*) -

    Partition 名称列表。

    如果指定了任何 Partition 名称，则释放其中任意一个 Partition 都会返回 **NotLoad** 状态。

- **using** (*string*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*dict*

**返回值：**

包含 index_building 进度信息的字典。

该字典包含以下键：

- **loading_progress** (*str*)

    指定 Collection 的加载进度。

**异常：**

- **MilvusException**

    在此操作期间发生任何错误时，将引发此异常。

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

# Get the load progress
utility.loading_progress(
    collection_name="test_collection",
) # {loading_progress: '100%' }
```

## 相关操作\{#related-operations}

以下操作与 `loading_progress()` 相关：

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [release()](./Collection-release)

- [load_state()](./utility-load_state)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

