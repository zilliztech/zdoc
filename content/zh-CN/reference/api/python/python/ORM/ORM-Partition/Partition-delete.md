---
title: "delete() | Python | ORM"
slug: /python/python/Partition-delete
sidebar_label: "delete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用布尔表达式从分区中删除实体。 | Python | ORM"
type: docx
token: V9BidASNqoWYrmxo11ecuN99neg
sidebar_position: 1
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# delete()

此操作使用布尔表达式从分区中删除实体。

<Admonition type="info" icon="📘" title="说明">

在 **[Collection](./ORM-Collection)** 对象的 **delete()** 方法中使用 **partition_name** 参数，等同于使用 **[Partition](./ORM-Partition)** 对象的 **delete()** 方法。

</Admonition>

## 请求语法\{#request-syntax}

```python
delete(
    expr: str, 
    timeout: float | None
)
```

**参数：**

- **expr** (*string*) -

    **[必需]** 

    用于筛选待删除实体的布尔表达式。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回类型：**

*MutationResult*

**返回：**

一个 **MutationResult** 对象，包含以下字段：

- **insert_count** (*int*)

    已插入实体的数量。

- **delete_count** (*int*)

    已删除实体的数量。

- **upsert_count** (*int*)

    已 upsert 实体的数量。

- **succ_count** (*int*)

    此操作中成功执行的次数。

- **succ_index** (*list*)

    从 0 开始的索引编号列表，每个编号表示一次成功的操作。

- **err_count** (*int*)

    此操作中执行失败的次数。

- **err_index** (*list*)

    从 0 开始的索引编号列表，每个编号表示一次失败的操作。

- **primary_keys** (*list*)

    已插入实体的主键列表。

- **timestamp** (*int*)

    此操作完成时的时间戳。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时引发。

## 示例\{#examples}

```python
from pymilvus import Collection, Partition, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

partition = Partition(
    collection=collection,
    name="partition_a",
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

# Delete two entities
res = partition.delete("id in [ 0, 1 ]")
```

## 相关操作\{#related-operations}

以下操作与 `delete()` 相关：

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

