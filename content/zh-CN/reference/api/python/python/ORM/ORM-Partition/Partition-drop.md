---
title: "drop() | Python | ORM"
slug: /python/python/Partition-drop
sidebar_label: "drop()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除当前 Partition。 | Python | ORM"
type: docx
token: D3sndK8DgoqDkUxaNGcctwcSnuE
sidebar_position: 2
keywords: 
  - 向量数据库对比
  - openai 向量数据库
  - 自然语言处理 Database
  - 低成本向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - drop()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop()

此操作会删除当前 [Partition](./ORM-Partition)。 

## 请求语法\{#request-syntax}

```python
drop(
    timeout: float | None
)
```

**参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- **MilvusException**

    此异常在此操作期间发生任意错误时出现。

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

# Create a partition
partition = Partition(
    collection=collection,
    name="test_partition"
)

# Drop the partition
partition.drop()
```

## 相关操作\{#related-operations}

以下操作与 `drop()` 相关：

- [get_replicas()](./Partition-get_replicas)

- [load()](./Partition-load)

- [release()](./Partition-release)

