---
title: "create_index() | Python | ORM"
slug: /python/python/Collection-create_index
sidebar_label: "create_index()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "这会为目标字段创建一个命名索引，该字段可以是向量字段，也可以是标量字段。 | Python | ORM"
type: docx
token: J76vdPHNgoyp2wxAiTcceIVJnOe
sidebar_position: 4
keywords: 
  - 非结构化数据
  - 向量 Database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - 云
  - create_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_index()

这会为目标字段创建一个命名索引，该字段可以是向量字段，也可以是标量字段。

<Admonition type="info" icon="📘" title="Notes">

此操作为非阻塞操作。您可以调用 `utility.wait_for_index_building_complete()` 以阻塞当前进程。

</Admonition>

## 请求语法\{#request-syntax}

```python
create_index(
    field_name: str, 
    index_params: dict | None, 
    timeout: float | None
)
```

**参数：**

- **field_name** (*string*) -

    要为其创建索引的字段名称。

- **index_params** (*dict*) - 

    适用于索引构建过程的参数。

    - **index_type** (string) -

        用于构建索引的算法。

        您应始终使用 **AUTOINDEX** 作为索引类型。请参阅 [AUTOINDEX Explained](/docs/autoindex-explained) 了解更多信息。

    - **metric_type** (*string*) - 

        用于构建索引的相似度度量类型。

        可能的值包括 **L2**、**IP** 和 **COSINE**。请参阅 [Similarity Metrics Explained](/docs/search-metrics-explained) 了解更多信息。

    - **params** (*dict*) -

        与所选索引类型对应的索引构建参数。

        有关适用索引构建参数的详细信息，请参阅 [AUTOINDEX Explained](/docs/autoindex-explained)。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*Status*

**返回：**

一个 **Status** 对象，指示此操作是否成功。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

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
```

## 相关操作\{#related-operations}

以下操作与 `create_index()` 相关

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

