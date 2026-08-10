---
title: "delete() | Python | ORM"
slug: /python/python/Collection-delete
sidebar_label: "delete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用布尔表达式删除 Entity。 | Python | ORM"
type: docx
token: TJMVdi4U2oBFnAxO95jctzVAnzg
sidebar_position: 6
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
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

此操作使用布尔表达式删除 Entity。

## 请求语法\{#request-syntax}

```python
delete(
    expr: str, 
    partition_name: str | None, 
    timeout: float | None
)
```

**参数：**

- **expr** (*string*) -

    **[必需]** 

    用于筛选待删除 Entity 的布尔表达式。

- **partition_name** (*string*) -

    要从中删除匹配 Entity 的 Partition 名称。

    如果指定了 Partition，则仅其包含的 Entity 会参与筛选。否则，Collection 中的所有 Entity 都会参与。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*MutationResult*

**返回值：**

包含以下字段的 **MutationResult** 对象：

- **insert_count** (*int*)

    已插入 Entity 的数量。

- **delete_count** (*int*)

    已删除 Entity 的数量。

- **upsert_count** (*int*)

    已 upsert 的 Entity 数量。

- **succ_count** (*int*)

    此操作中成功执行的次数。

- **succ_index** (*list*)

    一个从 0 开始的索引号列表，每个索引号表示一次成功的操作。

- **err_count** (*int*)

    此操作中执行失败的次数。

- **err_index** (*list*)

    一个从 0 开始的索引号列表，每个索引号表示一次失败的操作。

- **primary_keys** (*list*)

    已插入 Entity 的主键列表。

- **timestamp** (*int*)

    此操作完成时的时间戳。

**异常：**

- **MilvusException**

    如果此操作期间发生任何错误，将引发此异常。

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
collection.insert(
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
res = collection.delete("id in [ 0, 1 ]")
```

## 相关操作\{#related-operations}

以下操作与 `delete()` 相关：

- [insert()](./Collection-insert)

- [search()](./Collection-search)

- [search_iterator()](./Collection-search_iterator)

- [query()](./Collection-query)

- [query_iterator()](./Collection-query_iterator)

- [upsert()](./Collection-upsert)

