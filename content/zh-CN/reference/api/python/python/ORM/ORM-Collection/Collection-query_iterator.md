---
title: "query_iterator() | Python | ORM"
slug: /python/python/Collection-query_iterator
sidebar_label: "query_iterator()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会返回一个 Python 迭代器，供您遍历查询结果。在查询结果包含大量数据时，它尤其有用。 | Python | ORM"
type: docx
token: LffbdiHhzoHe08xivF9ccmoen5d
sidebar_position: 23
keywords: 
  - NLP
  - 神经网络
  - 深度学习
  - 知识库
  - zilliz
  - zilliz cloud
  - 云
  - query_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query_iterator()

此操作会返回一个 Python 迭代器，供您遍历查询结果。在查询结果包含大量数据时，它尤其有用。

## 请求语法\{#request-syntax}

```python
query_iterator(
    batch_size: int, 
    limit: int, 
    expr: str | None, 
    output_fields: list[str] | None, 
    partition_names: list[str] | None, 
    timeout: float | None
)
```

**参数：**

- **batch_size** (*int*)

    每次在当前迭代器上调用 `next()` 时返回的 Entity 数量。

    该值默认为 **1000**。请将其设置为合适的值，以控制每次迭代返回的 Entity 数量。

- **limit** (*int*)

    要返回的 Entity 总数。

    该值默认为 **-1**，表示将返回所有匹配的 Entity。

- **expr** (*str*)

    用于筛选匹配 Entity 的标量过滤条件。

    该值默认为 **None**，表示忽略标量过滤。要构建标量过滤条件，请参见 [布尔表达式规则](https://milvus.io/docs/boolean.md)。

- **output_fields** (*list*)

    返回结果中每个 Entity 要包含的字段名称列表。

    该值默认为 **None**。如果未指定，则仅包含主字段。

- **partition_names** (*list*)

    Partition 名称列表。

    该值默认为 **None**。如果已指定，则查询仅涉及指定的 Partition。

- **timeout** (*float*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*QueryIterator*

**返回值：**

一个供您遍历查询结果的 **QueryIterator**。

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

# Insert a list of columns
res = collection.insert(
    data=[
        [0,1,2,3,4,5,6,7,8,9],               # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

# Create a query iterator
iterator = collection.query_iterator(
    batch_size=2,
    limit=10,
    expr="id > 3",
    output_fields=["id", "vector"]
)

# Start iterating
while True:
    res = iterator.next()
    
    if not res:
        res.close()
        break
```

## 相关操作\{#related-operations}

以下操作与 `query_iterator()` 相关：

- [delete()](./Collection-delete)

- [insert()](./Collection-insert)

- [search()](./Collection-search)

- [search_iterator()](./Collection-search_iterator)

- [query()](./Collection-query)

- [upsert()](./Collection-upsert)

