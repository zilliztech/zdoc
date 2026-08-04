---
title: "list_indexes() | Python | ORM"
slug: /python/python/utility-list_indexes
sidebar_label: "list_indexes()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出特定集合的所有索引。 | Python | ORM"
type: docx
token: XLepdUCcTow6rpx5vxxcbLXZnyb
sidebar_position: 25
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - list_indexes()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_indexes()

此操作列出特定集合的所有索引。

## 请求语法\{#request-syntax}

```python
list_indexes(
    collection_name: str,
    using: str = "default",
    timeout: float | None,
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有集合的名称。

    如果将其设置为不存在的集合，将导致 **CollectionNotExistException**。

- **index_name** (*str*) -

    此操作目标索引的名称。

    如果未指定，则使用默认索引。如果集合有多个索引，则此参数为必填。

    如果将其设置为不存在的索引，将导致 **IndexNotExistException**。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回类型：**

*list*

**返回：**

以列表形式返回所有已构建索引的名称。

**异常：**

- **CollectionNotExistException**

    如果指定的集合不存在，则会引发此异常。

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

# Create an index on a scalar field
collection.create_index(
    field_name="id"
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

# List all indexes
utility.list_indexes(
    collection_name="test_collection"
) # ['_default_idx_101', '_default_idx_100']
```

## 相关操作\{#related-operations}

以下操作与 `list_indexes()` 相关：

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

