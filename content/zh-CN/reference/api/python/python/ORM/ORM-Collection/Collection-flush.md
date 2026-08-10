---
title: "flush() | Python | ORM"
slug: /python/python/Collection-flush
sidebar_label: "flush()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会封存 Collection 中的所有 Segment。此操作之后的任何插入都会生成一个新的 Segment。 | Python | ORM"
type: docx
token: VdiwdqQ9iofbkoxcc8Kcqk5gnhZ
sidebar_position: 11
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量数据库 db
  - 向量 Database 示例
  - zilliz
  - zilliz cloud
  - 云
  - flush()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush()

此操作会封存 Collection 中的所有 Segment。此操作之后的任何插入都会生成一个新的 Segment。

## 请求语法\{#request-syntax}

```python
flush(
    timeout: float | None
)   
```

<Admonition type="info" icon="📘" title="Note">

我可以在每次插入数据后都调用 `flush()` 吗？

插入新数据时，数据会被写入一个增长中的 Segment。一旦增长中的 Segment 达到其大小上限，Zilliz Cloud 就会自动封存该 Segment。 

持续调用此操作会产生许多体积较小的已封存 Segment，这会逐渐降低搜索性能。 

建议您在执行任何搜索之前，先等待 Zilliz Cloud 封存所有 Segment。

</Admonition>

**参数：**

- **参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，都会引发此异常。

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

# Insert some data
collection.insert(
    data=[
        [0,1,2,3,4],                         # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

# Flush the data 
collection.flush()

# Check the number of flushed entities in the collection 
collection.num_entities # 5
```

## 相关操作\{#related-operations}

以下操作与 `flush()` 相关：

- [describe()](./Collection-describe)

- [drop()](./Collection-drop)

- [get_replicas()](./Collection-get_replicas)

- [set_properties()](./Collection-set_properties)

