---
title: "drop_index() | Python | ORM"
slug: /python/python/Collection-drop_index
sidebar_label: "drop_index()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除当前 Collection 中的索引。 | Python | ORM"
type: docx
token: AtkDdtMAWodFzExARxnco5xLnsg
sidebar_position: 9
keywords: 
  - RAG 向量 Database
  - 什么是向量数据库
  - 什么是向量 Database
  - 向量 Database 对比
  - zilliz
  - zilliz cloud
  - cloud
  - drop_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_index()

此操作会删除当前 Collection 中的索引。

## 请求语法\{#request-syntax}

```python
drop_index(timeout: float | None)
```

**参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*None*

**返回值：**

*NoneType*

**异常：**

- **MilvusException**

    在此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Set the index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {
        "nprobe": 10
    }
}

# Create an index
collection.create_index(
    field_name="test_collection", 
    index_params=index_params, 
    timeout=None
)

# Check the index
collection.has_index() # True

# Drop the index
collection.drop_index()

# Check the index
collection.has_index() # False
```

## 相关操作\{#related-operations}

以下操作与 `drop_index()` 相关：

- [create_index()](./Collection-create_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

