---
title: "search_iterator() | Python | ORM"
slug: /python/python/Collection-search_iterator
sidebar_label: "search_iterator()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回一个 Python 迭代器，供您遍历搜索结果。当搜索结果包含大量数据时，这一点尤其有用。 | Python | ORM"
type: docx
token: HrnndnWtKoPuenxvsXBchF1wnnh
sidebar_position: 26
keywords: 
  - 非结构化数据
  - 向量 Database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - search_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search_iterator()

此操作返回一个 Python 迭代器，供您遍历搜索结果。当搜索结果包含大量数据时，这一点尤其有用。

## 请求语法\{#request-syntax}

```python
search_iterator(
    data: list[list[float]], 
    anns_field: str, 
    param: dict, 
    batch_size: int, 
    limit: int, 
    expr: str | None, 
    partition_names: list[str] | None, 
    output_fields: list[str] | None, 
    timeout: float | None, 
    round_decimal: int,
)
```

**参数：**

- **data** (*list[list[float]]*) - 

    **[必填]**

    向量嵌入列表。

    Zilliz Cloud 会搜索与指定向量嵌入最相似的向量嵌入。

- **anns_field** (str) -

    **[必填]**

    当前 Collection 中向量字段的名称。

- **param** (dict) -

    **[必填]**

    此操作专用的参数设置。

    - **metric_type** (*str*) -

        应用于此操作的度量类型。该值应与为上述指定向量字段创建索引时使用的度量类型相同。

        可能的值包括 **L2**、**IP** 和 **COSINE**。

    - **params** (dict) -

        附加参数

        - **radius** (float) -

            确定最低相似度阈值。当将 `metric_type` 设置为 `L2` 时，请确保该值大于 **range_filter** 的值。否则，该值应小于 **range_filter** 的值。

        - **range_filter**  (float) -  

            将搜索进一步限定为特定相似度范围内的向量。当将 `metric_type` 设置为 `IP` 或 `COSINE` 时，请确保该值大于 **radius** 的值。否则，该值应小于 **radius** 的值。

    有关其他适用搜索参数的详细信息，请阅读 [AUTOINDEX Explained](/docs/autoindex-explained) 了解更多内容。

- **batch_size** (*int*) -

    每次在当前迭代器上调用 `next()` 时返回的 Entity 数量。

    该值默认为 **1000**。请将其设置为合适的值，以控制每次迭代返回的 Entity 数量。

- **limit** (*int*) -

    要返回的 Entity 总数。

    该值默认为 **-1**，表示将返回所有匹配的 Entity。

- **expr** (*str*) -

    用于筛选匹配 Entity 的标量过滤条件。

    该值默认为 **None**，表示忽略标量过滤。要构建标量过滤条件，请参阅 [Boolean Expression Rules](https://milvus.io/docs/boolean.md)。

- **output_fields** (*list*) -

    返回结果中每个 Entity 要包含的字段名称列表。

    该值默认为 **None**。如果未指定，则仅包含主字段。

- **partition_names** (*list*) -

    Partition 名称列表。

    该值默认为 **None**。如果指定，则仅在指定的 Partition 中执行查询。

- **timeout** (*float*)  -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

- **round_decimal** (int) -

    Zilliz Cloud 对计算距离保留的小数位数。

    该值默认为 **-1**，表示 Zilliz Cloud 跳过对计算距离进行舍入，并返回原始值。

**返回类型：**

*SearchIterator*

**返回值：**

一个 **SearchIterator**，供您遍历搜索结果。

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

BATCH_SIZE = 2
LIMIT = 10

param = {
    "metric_type": "COSINE",
    "params": {
        "nprobe": 1024,
        "radius": 0.2,
        "range_filter": 1.0
    }
}

# Create a search iterator
iterator = collection.search_iterator(
    data=[[0.1,0.2,-0.3,-0.4,0.5]],
    anns_field="vector",
    param=param,
    batch_size=BATCH_SIZE,
    limit=LIMIT,
    expr="id > 3",
    output_fields=["id", "vector"]
)

while True:
    res = iterator.next()
    
    # Get distances
    res.distances()
    
    # Get ids
    res.ids()
    
    if not res.ids():
        iterator.close()
        break

```

## 相关操作\{#related-operations}

以下操作与 `search_iterator()` 相关：

- [delete()](./Collection-delete)

- [insert()](./Collection-insert)

- [search()](./Collection-search)

- [query()](./Collection-query)

- [query_iterator()](./Collection-query_iterator)

- [upsert()](./Collection-upsert)

