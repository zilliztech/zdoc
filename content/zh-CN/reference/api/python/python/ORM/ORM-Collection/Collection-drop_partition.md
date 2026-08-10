---
title: "drop_partition() | Python | ORM"
slug: /python/python/Collection-drop_partition
sidebar_label: "drop_partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从当前 Collection 中删除指定的 Partition。 | Python | ORM"
type: docx
token: Aym2dpBuIo81mExCqyLcSWhunBe
sidebar_position: 10
keywords: 
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - drop_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_partition()

此操作从当前 Collection 中删除指定的 Partition。

```python
drop_partition(
    partition_name: str
    timeout: float | None
)
```

## 请求语法\{#request-syntax}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="string")

# drop an existing partition
collection.drop_partition(
    partition_name="string"
)
```

**参数：**

- **partition_name** (*str*) -

    要删除的 Partition 名称。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*NoneType*

**返回值：**

None

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

# Create a partition
partition = collection.create_partition("test_partition")

# Check whether the partition exists
collection.has_partition("test_partition") # True

# Drop the partition
collection.drop_partition("test_partition")

# Check whether the partition exists
collection.has_partition("test_partition") # False
```

## 相关操作\{#related-operations}

以下操作与 `drop_collection()` 相关：

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [create_partition()](./Collection-create_partition)

- [partition()](./Collection-partition)

- [has_partition()](./Collection-has_partition)

