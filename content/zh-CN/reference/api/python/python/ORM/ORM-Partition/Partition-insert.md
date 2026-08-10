---
title: "insert() | Python | ORM"
slug: /python/python/Partition-insert
sidebar_label: "insert()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将数据插入当前 Partition。 | Python | ORM"
type: docx
token: QXDxdv36FoVgjcxDV1gcDwWXnsd
sidebar_position: 5
keywords: 
  - LLM 评估
  - 稀疏 vs 稠密
  - 稠密向量
  - 分层可导航小世界
  - zilliz
  - zilliz cloud
  - 云
  - insert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# insert()

此操作会将数据插入当前 Partition。

<Admonition type="info" icon="📘" title="Notes">

在 **[Collection](./ORM-Collection)** 对象的 **insert()** 方法中使用 **partition_name** 参数，等同于使用 **[Partition](./ORM-Partition)** 对象的 **insert()** 方法。

</Admonition>

## 请求语法\{#request-syntax}

```python
insert(
    data: List | pandas.DataFrame | Dict, 
    timeout: float | None
)
```

**参数：**

- **data** (*list* | *dict* | *pandas.DataFrame*) -

    **[必需]**

    要插入到当前 Collection 中的数据。

    要插入的数据应与当前 Collection 的 Schema 匹配。您可以按以下形式组织数据：

    - 列列表

        每一列都是该列中各个 Entity 值组成的列表。

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

    - **pandas.DataFrame**

        您可以用任意方式构造数据框，具体可参见[本页](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html)中的 **Example** 部分。

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

    - 行列表或单行

        每一行都是一个表示 Entity 的字典。

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

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回类型：**

*MutationResult*

**返回值：**

一个 **MutationResult** 对象，包含以下字段：

- **insert_count** (*int*)

    已插入的 Entity 数量。

- **primary_keys** (*list*)

    已插入 Entity 的主键列表。

**异常：**

- 一个 **MutationResult** 对象，包含以下字段：

    - **insert_count** (*int*)

        已插入的 Entity 数量。

    - **delete_count** (*int*)

        已删除的 Entity 数量。

    - **upsert_count** (*int*)

        已 upsert 的 Entity 数量。

    - **succ_count** (*int*)

        此操作中执行成功的次数。

    - **succ_index** (*list*)

        从 0 开始的索引号列表，每个索引号表示一次成功的操作。

    - **err_count** (*int*)

        此操作中执行失败的次数。

    - **err_index** (*list*)

        从 0 开始的索引号列表，每个索引号表示一次失败的操作。

    - **primary_keys** (*list*)

        已插入 Entity 的主键列表。

    - **timestamp** (*int*)

        此操作完成时的时间戳。

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

# Insert data
res = partition.insert(data)

# Return the count of inserted entities
res.insert_count
10
```

## 相关操作\{#related-operations}

以下操作与 `insert()` 相关：

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [query()](./Partition-query)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

