---
title: "index_building_progress() | Python | ORM"
slug: /python/python/utility-index_building_progress
sidebar_label: "index_building_progress()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回索引构建过程的进度。 | Python | ORM"
type: docx
token: OVfodiKa6o3qTGxadYicI975nhh
sidebar_position: 21
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - index_building_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# index_building_progress()

此操作返回索引构建过程的进度。

## 请求语法\{#request-syntax}

```python
index_building_progress(
    collection_name: str,
    index_name: str = "",
    using: str = "default",
    timeout: float | None,
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有 collection 的名称。

    将其设置为不存在的 collection 会导致 **CollectionNotExistException**。

- **index_name** (*str*) -

    此操作目标索引的名称。

    如果未指定，则使用默认索引。如果 collection 有多个索引，则此参数为必填项。

    将其设置为不存在的索引会导致 **IndexNotExistException**。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作超时。

**返回类型：**

*dict*

**返回：**
一个字典，包含指定 collection 中已建立索引的实体数量以及实体总数。
该字典包含以下键：

- **total_rows** (*int*)

    指定 collection 中的实体总数。

- **indexed_rows** (*int*)

    指定 collection 中已建立索引的实体数量。

- **pending_index_rows** (*int*)

    等待建立索引的实体数量。

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

# Get the building progress of a specific index
utility.index_building_progress(
    collection_name="test_collection",
    index_name="_default_idx_101"
)
```

## 相关操作\{#related-operations}

以下操作与 `index_building_progress()` 相关：

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

