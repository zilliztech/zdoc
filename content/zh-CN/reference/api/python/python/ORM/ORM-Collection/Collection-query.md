---
title: "query() | Python | ORM"
slug: /python/python/Collection-query
sidebar_label: "query()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用指定的布尔表达式执行标量过滤。 | Python | ORM"
type: docx
token: JzcYdBQ5zoU4KpxPqUHcPLQonKd
sidebar_position: 22
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query()

此操作使用指定的布尔表达式执行标量过滤。

## 请求语法\{#request-syntax}

```python
query(
    expr: str, 
    output_fields: list[str] | None, 
    partition_names: list[str] | None, 
    timeout: float | None
    **kwargs
)
```

**参数：**

- **expr** (*str*) -

    **[必填]**

    用于筛选匹配实体的标量过滤条件。 

    您可以将此参数设置为空字符串以跳过标量过滤。在这种情况下，您还应设置 `limit` 以限制返回的实体数量。

    有关如何构建标量过滤条件，请参见 [Boolean Expression Rules](https://milvus.io/docs/boolean.md)。 

- **output_fields** (*list*) -

    返回的每个实体中要包含的字段名称列表。

    默认值为 **None**。如果未指定，则仅包含主字段。

- **partition_names** (*list*)

    分区名称列表。

    默认值为 **None**。如果指定，则仅在指定的分区中执行查询。

- **timeout** (*float*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

- **kwargs**: 

    - **consistency_level** (*str* | *int*) -

        目标 collection 的一致性级别。

        该值默认使用创建当前 collection 时指定的级别，可选值包括 **Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**) 和 **Eventually** (**3**)。

        <Admonition type="info" icon="📘" title="说明">

        什么是一致性级别？
        
                分布式数据库中的一致性，特指在给定时间写入或读取数据时，确保每个节点或副本具有相同数据视图的属性。
        
                Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认设置为 **Bounded Staleness**。
        
                在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用程序。

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        一个有效的时间戳。 

        如果设置了此参数，则仅当在该时间戳之前插入的所有实体对 query 节点可见时，才会执行查询。 

        <Admonition type="info" icon="📘" title="注意">

        当使用默认一致性级别时，此参数有效。

        </Admonition>

    - **graceful_time** (*int*) -

        以秒为单位的一段时间。

        默认值为 **5**。如果设置了此参数，则会通过当前时间戳减去该值来计算 guarantee timestamp。

        <Admonition type="info" icon="📘" title="注意">

        当使用非默认一致性级别时，此参数有效。

        </Admonition>

    - **offset** (*int*) -

        在查询结果中要跳过的记录数。 

        您可以将此参数与 `limit` 结合使用，以启用分页。

        此值与 `limit` 的总和应小于 16,384。 

    - **limit** (*int*) -

        查询结果中要返回的记录数。

        您可以将此参数与 `offset` 结合使用，以启用分页。

        此值与 `offset` 的总和应小于 16,384。 

**返回类型：**

*list[dict]*

**返回值：**

由字典组成的列表，其中每个字典表示一个被查询到的实体。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **DataTypeNotMatchException**

    当参数值与所需数据类型不匹配时，将引发此异常。

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

# Query without any scalar filtering condition
# This query returns entities with their ids from 0 to 4.
res = collection.query(
    expr="",
    limit=5,
) 

# Query with pagination
# This query returns entities with their ids from 5 to 9.
res = collection.query(
    expr="",
    offset=5
    limit=5
)

# Query with a scalar filtering condition
res = collection.query(
    expr="id in [6,7,8]",
)

# Query within a partition
res = collection.query(
    expr="id in [6,7,8]",
    partition_names=["partitionA"],
)

# Query with specified output fields
res = collection.query(
    expr="id in [6,7,8]",
    output_fields=["id", "vector"],
)

# Query with a customized consistency level
res = collection.query(
    expr="",
    consistency_level=3,
    graceful_time=6
)
```

## 相关操作\{#related-operations}

以下操作与 `query()` 相关：

- [delete()](./Collection-delete)

- [insert()](./Collection-insert)

- [search()](./Collection-search)

- [search_iterator()](./Collection-search_iterator)

- [query_iterator()](./Collection-query_iterator)

- [upsert()](./Collection-upsert)

