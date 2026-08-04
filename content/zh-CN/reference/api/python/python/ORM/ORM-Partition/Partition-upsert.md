---
title: "upsert() | Python | ORM"
slug: /python/python/Partition-upsert
sidebar_label: "upsert()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将新记录插入数据库或更新已有记录。 | Python | ORM"
type: docx
token: MQMzddDnao5Zz0xmSRncZM2nn5b
sidebar_position: 11
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# upsert()

此操作将新记录插入数据库或更新已有记录。

<Admonition type="info" icon="📘" title="说明">

Upsert 是一种数据级操作：如果集合中已存在指定字段，则会覆盖已有实体；如果指定值尚不存在，则会插入一个新实体。

</Admonition>

## 请求语法\{#request-syntax}

```python
upsert(
    data: List | pandas.DataFrame | Dict,, 
    timeout=float | None
)
```

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection(name="string")

# Get an existing partition
partition = Partition(name="string")

# Prepare your data
data = ...

# Upsert data into partition
partition.upsert(
    data=data,
    timeout=None
)
```

**参数：**

- **data** (*list* | *dict* | *pandas.DataFrame*) -

    **[必需]**

    要插入到当前集合中的数据。

    要插入的数据应与当前集合的 schema 匹配。你可以按以下方式组织数据：

    - 列表形式的列数据

        每一列都是该列中所有实体值的列表。

        ```python
        data = [
            [0,1,2,3,4],                         # id
            [                                    # vector
                [0.1,0.2,-0.3,-0.4,0.5],
                [0.3,-0.1,-0.2,-0.6,0.7],
                [-0.6,-0.3,0.2,0.8,0.7],
                [0.6,0.2,-0.3,-0.8,0.5],
                [0.3,0.1,-0.2,-0.6,-0.7],
            ],
        ]
        ```

    - 一个 **pandas.DataFrame**

        你可以用任意方式构造数据框，如 [此页面](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html) 中 **Example** 部分所示。

        ```python
        data = pd.DataFrame({
            "id": [5,6,7,8,9],
            "vector": [
                [0.1,0.2,-0.3,-0.4,0.5],
                [0.3,-0.1,-0.2,-0.6,0.7],
                [-0.6,-0.3,0.2,0.8,0.7],
                [0.6,0.2,-0.3,-0.8,0.5],
                [0.3,0.1,-0.2,-0.6,-0.7],
            ]
        })
        ```

    - 行列表或单行数据

        每一行都是一个表示实体的字典。

        ```python
        data = [
            {"id": 10, "vector": [0.1,0.2,-0.3,-0.4,0.5]},
            {"id": 11, "vector": [0.3,-0.1,-0.2,-0.6,0.7]},
            {"id": 12, "vector": [-0.6,-0.3,0.2,0.8,0.7]},
            {"id": 13, "vector": [0.6,0.2,-0.3,-0.8,0.5]},
            {"id": 14, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
        ]
        
        # or 
        
        data = {"id": 15, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
        ```

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回类型：**

*MutationResult*

**返回值：**

一个 **MutationResult** 对象，包含以下字段：

- **insert_count** (*int*)

    已插入实体的数量。

- **delete_count** (*int*)

    已删除实体的数量。

- **upsert_count** (*int*)

    已执行 upsert 的实体数量。

- **succ_count** (*int*)

    此操作中执行成功的数量。

- **succ_index** (*list*)

    从 0 开始的索引编号列表，每个编号表示一次成功的操作。

- **err_count** (*int*)

    此操作中执行失败的数量。

- **err_index** (*list*)

    从 0 开始的索引编号列表，每个编号表示一次失败的操作。

- **primary_keys** (*list*)

    已插入实体的主键列表。

- **timestamp** (*int*)

    此操作完成时的时间戳。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Collection, Partition, FieldSchema, CollectionSchema, DataType

# Define collection schema    
schema = CollectionSchema([
    FieldSchema("film_id", DataType.INT64, is_primary=True),
    FieldSchema("films", dtype=DataType.FLOAT_VECTOR, dim=2)
])

# Get an existing collection
collection = Collection("test_partition_insert", schema)

# Get an existing partition in the current collection
partition = Partition(collection, "comedy", "comedy films")

# Prepare the data to insert
data = [
    [i for i in range(10)],
    [[float(i) for i in range(2)] for _ in range(10)]
]

# Upsert data
res = partition.upsert(data)

# Return the count of upserted entities
res.upsert_count
10
```

## 相关操作\{#related-operations}

以下操作与 `upsert()` 相关：

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [search()](./Partition-search)

