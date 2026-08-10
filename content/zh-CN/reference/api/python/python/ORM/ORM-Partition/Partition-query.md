---
title: "query() | Python | ORM"
slug: /python/python/Partition-query
sidebar_label: "query()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用布尔表达式对 Entity 标量字段执行查询。 | Python | ORM"
type: docx
token: N97pdfkjlo9j61xrtL2cbB79nKe
sidebar_position: 8
keywords: 
  - rag 向量 Database
  - 什么是向量数据库
  - 什么是向量 Database
  - 向量 Database 对比
  - zilliz
  - zilliz cloud
  - 云
  - query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query()

此操作使用布尔表达式对 Entity 标量字段执行查询。

## 请求语法\{#request-syntax}

```python
query(
    expr: str, 
    output_fields: List[str] | None, 
    timeout: float | None,
    **kwargs
)
```

**参数：**

- **expr** (*string*) -

    **[必填]** 

    用于筛选 Entity 标量字段的布尔表达式。

- **output_fields** (List[str] | *None*) -

    输出中必须包含的字段名称列表。将其设置为 **None** 表示此操作仅输出主键字段。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

- **kwargs**: 

    附加关键字参数。

    - **consistency_level** (*str* | *int*) -

        目标 Collection 的一致性级别。

        该值默认为您创建当前 Collection 时指定的值，可选项包括 **Strong**（**0**）、**Bounded**（**1**）、**Session**（**2**）和 **Eventually**（**3**）。

        <Admonition type="info" icon="📘" title="Note">

        什么是一致性级别？
        
                分布式 Database 中的一致性，特指确保每个节点或副本在给定时间写入或读取数据时，对数据具有相同视图的属性。
        
                Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认设置为 **Bounded Staleness**。
        
                您可以在执行向量相似性搜索或查询时，轻松调整一致性级别，使其最适合您的应用。

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        一个有效的时间戳。 

        如果设置了此参数，Zilliz Cloud 仅会在此时间戳之前插入的所有 Entity 对查询节点可见时执行查询。 

        <Admonition type="info" icon="📘" title="Notes">

        此参数在使用默认一致性级别时有效。

        </Admonition>

    - **graceful_time** (*int*) -

        一段以秒为单位的时间。

        该值默认为 **5**。如果设置了此参数，Zilliz Cloud 会通过从当前时间戳中减去该值来计算保证时间戳。

        <Admonition type="info" icon="📘" title="Notes">

        此参数在使用非默认一致性级别时有效。

        </Admonition>

    - **offset** (*int*) -

        查询结果中要跳过的记录数。 

        您可以将此参数与 `limit` 结合使用，以启用分页。

        该值与 `limit` 的总和应小于 16,384。 

    - **limit** (*int*) -

        查询结果中要返回的记录数。

        您可以将此参数与 `offset` 结合使用，以启用分页。

        该值与 `offset` 的总和应小于 16,384。 

**返回类型：**

*List*

**返回值：**

查询结果列表。

**异常：**

- **MilvusException**

    此异常会在此操作期间发生任何错误时出现。

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

# Create a partition
partition = Partition(collection, name="test_collection")

# Insert a list of columns
res = partition.insert(
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

# Query without any scalar filtering condition
# This query returns entities with their ids from 0 to 4.
res = partition.query(
    expr="",
    limit=5,
) 

# Query with pagination
# This query returns entities with their ids from 5 to 9.
res = partition.query(
    expr="",
    offset=5
    limit=5
)

# Query with a scalar filtering condition
res = partition.query(
    expr="id in [6,7,8]",
)

# Query with specified output fields
res = partition.query(
    expr="id in [6,7,8]",
    output_fields=["id", "vector"],
)

# Query with a customized consistency level
res = partition.query(
    expr="",
    consistency_level=3,
    graceful_time=6
)
```

## 相关操作\{#related-operations}

以下操作与 `query()` 相关：

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

