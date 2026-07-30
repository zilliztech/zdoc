---
title: "index() | Python | ORM"
slug: /python/python/Collection-index
sidebar_label: "index()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取当前 collection 的指定索引。 | Python | ORM"
type: docx
token: RkQ8dnWDHo3DiDxiCVRcP1xPnob
sidebar_position: 18
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# index()

此操作获取当前 collection 的指定索引。

## 请求语法\{#request-syntax}

```python
index(
    **kwargs
)
```

**参数：**

- **kwargs -** 

    附加关键字参数。

    - **index_name** (*str*) -

        索引名称。如果未指定索引，则使用默认索引名称。

        默认索引名称格式如下：`_default_idx_{field_id}`。

**返回类型：**

*Index*

**返回：**

当前 collection 的一个 Index 对象。

**异常：**

- **IndexNotExistException**

    当指定的索引不存在时，将引发此异常。

- **AmbiguousIndexName**

    当存在多个索引但未指定索引名称时，将引发此异常。 

## 示例\{#examples}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="test_collection")

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

# Check the index
collection.has_index() # True

# list all index names
collection.indexes

# [<pymilvus.orm.index.Index at 0x12045f910>,
# <pymilvus.orm.index.Index at 0x12045d0d0>]

# Get a specific index object
collection.index(index_name="_default_idex_101")

# <pymilvus.orm.index.Index at 0x1205b8690>
```

## 相关操作\{#related-operations}

以下操作与 `index()` 相关：

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

