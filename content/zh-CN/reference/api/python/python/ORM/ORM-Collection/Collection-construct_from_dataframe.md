---
title: "construct_from_dataframe() | Python | ORM"
slug: /python/python/Collection-construct_from_dataframe
sidebar_label: "construct_from_dataframe()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用指定的 dataframe 创建集合。 | Python | ORM"
type: docx
token: ISZadjHwyopWr5xRdJ2cqxVanEg
sidebar_position: 3
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - construct_from_dataframe()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dataframe()

此操作使用指定的 dataframe 创建集合。 

## 请求语法\{#request-syntax}

```python
construct_from_dataframe(
    name: str, 
    primary_field: str,
    dataframe: pandas.DataFrame
)
```

**参数：**

- **name** (*string*) -

    **[必填]**

    要创建的集合名称。

- **primary_field** (*string*) -

    **[必填]**

    主字段的名称。它应当是以下 dataframe 中的某个列标签。

- **dataframe** (*pandas.DataFrame*) 

    **[必填]**

    包含要插入到集合中的数据的 dataframe。

    你可以通过任意方式构造一个 data frame，如[此页面](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html)中的 **Example** 部分所示。

    ```python
    dataframe = pd.DataFrame({
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

**返回类型：**

*tuple (Collection, MutationResults)*

**返回：**

一个元组，包含集合以及由 **insert()** 操作返回的 **MutationResult** 对象。

**MutationResult** 对象包含以下字段：

- **insert_count** (*int*)

    已插入实体的数量。

- **delete_count** (*int*)

    已删除实体的数量。

- **upsert_count** (*int*)

    已 upsert 实体的数量。

- **succ_count** (*int*)

    此操作期间成功执行的次数。

- **succ_index** (*list*)

    从 0 开始的索引编号列表，其中每个编号表示一次成功的操作。

- **err_count** (*int*)

    此操作期间失败执行的次数。

- **err_index** (*list*)

    从 0 开始的索引编号列表，其中每个编号表示一次失败的操作。

- **primary_keys** (*list*)

    已插入实体的主键列表。

- **timestamp** (*int*)

    此操作完成时的时间戳。

**异常：**

- **SchemaNotReadyException**

    当指定的主字段无效时，将引发此异常。

## 示例\{#examples}

```python
import pandas as pd
from pymilvus import Collection

collection, results = Collection.construct_from_dataframe(
    name="test_collection",
    primary_field="id",
    dataframe=pd.DataFrame({
        "id": [0,1,2,3,4],
        "vector": [
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ]
    }),
)
```

## 相关操作\{#related-operations}

以下操作与 `construct_from_dataframe()` 相关：

- [Collection](./ORM-Collection)

- [CollectionSchema](./ORM-CollectionSchema)

- [FieldSchema](./ORM-FieldSchema)

