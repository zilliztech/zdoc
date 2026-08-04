---
title: "wait_for_index_building_complete() | Python | ORM"
slug: /python/python/utility-wait_for_index_building_complete
sidebar_label: "wait_for_index_building_complete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会阻塞当前进程，直到指定索引构建完成。 | Python | ORM"
type: docx
token: MfR8dw5TioPvw3xvrstcgYixnUb
sidebar_position: 43
keywords: 
  - 向量索引
  - 开源向量数据库
  - open source vector db
  - 向量数据库示例
  - zilliz
  - zilliz cloud
  - 云
  - wait_for_index_building_complete()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# wait_for_index_building_complete()

此操作会阻塞当前进程，直到指定索引构建完成。

## 请求语法\{#request-syntax}

```python
wait_for_index_building_complete(
    collection_name: str,
    index_name: str = "",
    timeout: float | None,
    using: str = "default",
)
```

**参数：**

- **collection_name** (*str*) -

    **[必填]**

    已存在的 collection 名称。

    如果将其设置为不存在的 collection，会导致 **CollectionNotExistException**。

- **index_name** (*str*) -

    此操作目标索引的名称。

    如果未指定，则使用默认索引。如果 collection 有多个索引，则此参数为必填。

    如果将其设置为不存在的索引，会导致 **IndexNotExistException**。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **CollectionNotExistException**

    如果指定的 collection 不存在，将引发此异常。

- **IndexNotExistException**

    如果指定的索引不存在，将引发此异常。

- **AmbiguousIndexName**

    如果存在多个索引但未指定索引名称，将引发此异常。

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

# Connection to YOUR_CLUSTER_ENDPOINT
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

# Wait for the index being built
utility.wait_for_index_building_complete(
    collection_name="test_collection",
    index_name="_default_idx_100",
)
```

## 相关操作\{#related-operations}

以下操作与 `wait_for_index_building_complete()` 相关：

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [list_indexes()](./utility-list_indexes)

