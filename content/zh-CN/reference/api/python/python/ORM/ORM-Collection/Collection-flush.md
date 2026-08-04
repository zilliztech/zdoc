---
title: "flush() | Python | ORM"
slug: /python/python/Collection-flush
sidebar_label: "flush()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会封存集合中的所有段。此操作之后的任何插入都会生成一个新段。 | Python | ORM"
type: docx
token: VdiwdqQ9iofbkoxcc8Kcqk5gnhZ
sidebar_position: 11
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush()

此操作会封存集合中的所有段。此操作之后的任何插入都会生成一个新段。

## 请求语法\{#request-syntax}

```python
flush(
    timeout: float | None
)   
```

<Admonition type="info" icon="📘" title="注意">

我可以在每次插入数据后都调用 `flush()` 吗？

插入新数据时，数据会写入增长中的段。一旦增长中段的大小达到其上限，Zilliz Cloud 会自动封存该段。 

持续调用此操作会产生许多较小的已封存段，这会逐渐降低搜索性能。 

建议等待 Zilliz Cloud 封存所有段之后，再执行任何搜索。

</Admonition>

**参数：**

- **参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

无

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

