---
title: "insert() | Python | ORM"
slug: /python/python/Collection-insert
sidebar_label: "insert()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将数据插入当前 Collection。 | Python | ORM"
type: docx
token: CbCodEGY9o6pKuxowNdctUppn7d
sidebar_position: 19
keywords: 
  - 图像搜索
  - LLMs
  - 机器学习
  - RAG
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

此操作会将数据插入当前 Collection。

## 请求语法\{#request-syntax}

```python
insert(
    data: List | pandas.DataFrame | Dict, 
    partition_name: str | None, 
    timeout: float | None, 
)
```

**参数：**

- **data** (*list* | *dict* | *pandas.DataFrame*) -

    **[必需]**

    要插入到当前 Collection 中的数据。

    要插入的数据应与当前 Collection 的 Schema 匹配。您可以按以下方式组织数据：

    - 列列表

        每一列都是该列中所有 Entity 的值列表。

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

        您可以用任意方式构造数据框，如[此页面](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html)的 **示例** 部分所示。

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

- **partition_name** (*string* | *None*) -

    当前 Collection 中某个 Partition 的名称。 

    如果指定了该参数，数据将被插入到指定的 Partition 中。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*MutationResult*

**返回：**

包含以下字段的 **MutationResult** 对象：

- **insert_count** (*int*)

    已插入 Entity 的数量。

- **delete_count** (*int*)

    已删除 Entity 的数量。

- **upsert_count** (*int*)

    已执行 upsert 的 Entity 数量。

- **succ_count** (*int*)

    此操作中成功执行的次数。

- **succ_index** (*list*)

    从 0 开始的索引编号列表，每个编号表示一次成功的操作。

- **err_count** (*int*)

    此操作中执行失败的次数。

- **err_index** (*list*)

    从 0 开始的索引编号列表，每个编号表示一次失败的操作。

- **primary_keys** (*list*)

    已插入 Entity 的主键列表。

- **timestamp** (*int*)

    此操作完成时的时间戳。

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

# Insert a data frame
import pandas as pd

res = collection.insert(
    data=pd.DataFrame({
        "id": [5,6,7,8,9],
        "vector": [
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ]
    })
)

# Insert a list of dictionaries
res = collection.insert(
    data=[
        {"id": 10, "vector": [0.1,0.2,-0.3,-0.4,0.5]},
        {"id": 11, "vector": [0.3,-0.1,-0.2,-0.6,0.7]},
        {"id": 12, "vector": [-0.6,-0.3,0.2,0.8,0.7]},
        {"id": 13, "vector": [0.6,0.2,-0.3,-0.8,0.5]},
        {"id": 14, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
    ]
)

# Insert a dictionary
res = collection.insert(
    data={"id": 16, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
)
```

## 相关操作\{#related-operations}

以下操作与 `insert()` 相关：

- [delete()](./Collection-delete)

- [search()](./Collection-search)

- [search_iterator()](./Collection-search_iterator)

- [query()](./Collection-query)

- [query_iterator()](./Collection-query_iterator)

- [upsert()](./Collection-upsert)

