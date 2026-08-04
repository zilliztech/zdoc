---
title: "flush() | Python | ORM"
slug: /python/python/Partition-flush
sidebar_label: "flush()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会封存分区中的所有段。此操作之后的任何插入都会生成一个新段。 | Python | ORM"
type: docx
token: VRGwdg75Ao7ZXQx7uANc9wzXnVb
sidebar_position: 3
keywords: 
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db
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

此操作会封存分区中的所有段。此操作之后的任何插入都会生成一个新段。

## 请求语法\{#request-syntax}

```python
flush(
    timeout: float | None
)   
```

<Admonition type="info" icon="📘" title="说明">

我可以在每次插入数据后都调用 `flush()` 吗？

插入新数据时，数据会被写入增长中的段。当增长中的段大小达到上限时，Zilliz Cloud 会自动封存该段。 

持续调用此操作会产生许多已封存但尺寸较小的段，这会逐渐降低搜索性能。 

建议在执行任何搜索之前，先等待 Zilliz Cloud 封存所有段。

</Admonition>

**参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

*None*

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

# Create a partition
partition = Partition(
    collection=collection,
    name="test_partition"
)

# Insert a list of columns
partition.insert(
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
partition.flush()

# Check the number of flushed entities in the partition 
partition.num_entities # 5
```

## 相关操作\{#related-operations}

以下操作与 `flush()` 相关：

- [delete()](./Partition-delete)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

