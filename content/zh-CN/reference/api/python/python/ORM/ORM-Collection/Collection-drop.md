---
title: "drop() | Python | ORM"
slug: /python/python/Collection-drop
sidebar_label: "drop()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将删除当前集合。 | Python | ORM"
type: docx
token: L8UTdDNkPoeew0x6LoDcfHx4nof
sidebar_position: 8
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - drop()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop()

此操作将删除当前集合。

## 请求语法\{#request-syntax}

```python
drop(
    timeout: float | None
)
```

**参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*NoneType*

**返回：**

None

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

# Drop the collection
collection.drop()
```

## 相关操作\{#related-operations}

以下操作与 `drop()` 相关：

- [describe()](./Collection-describe)

- [flush()](./Collection-flush)

- [get_replicas()](./Collection-get_replicas)

- [set_properties()](./Collection-set_properties)

