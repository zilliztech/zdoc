---
title: "flush_all() | Python | ORM"
slug: /python/python/utility-flush_all
sidebar_label: "flush_all()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会封存所有分段。 | Python | ORM"
type: docx
token: Uwsfd443boKKgyx2zZTcYDqKnCe
sidebar_position: 12
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - flush_all()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush_all()

此操作会封存所有分段。

## 请求语法\{#request-syntax}

```python
flush_all(
    using: str = "default",
    timeout: float | None,
    **kwargs,
)
```

**参数：**

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

N/A

## 示例\{#examples}

```python
from pymilvus import (
    connections, 
    Collection, 
    FieldSchema, 
    CollectionSchema, 
    DataType, 
    utility,
)

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a collection
collection = Collection(
    name="test_collection_flush", 
    schema=CollectionSchema(fields=[
        FieldSchema("film_id", DataType.INT64, is_primary=True),
        FieldSchema("films", dtype=DataType.FLOAT_VECTOR, dim=128)
    ])
)

# Insert data
collection.insert([[1, 2], [[1.0, 2.0], [3.0, 4.0]]])

utility.flush_all(_async=False) # synchronized flush_all
# or use `future` to flush_all asynchronously

future = utility.flush_all(_async=True)
future.done() # flush_all finished
```

## 相关操作\{#related-operations}

以下操作与 `flush_all()` 方法相关：

- [drop_collection()](./utility-drop_collection)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

