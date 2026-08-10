---
title: "has_partition() | Python | ORM"
slug: /python/python/Collection-has_partition
sidebar_label: "has_partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检查当前 Collection 中是否存在指定的 Partition。 | Python | ORM"
type: docx
token: QsOsda2lRoJP32xNSLWcbgMOnKI
sidebar_position: 16
keywords: 
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - zilliz
  - zilliz cloud
  - 云
  - has_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_partition()

此操作检查当前 Collection 中是否存在指定的 Partition。

## 请求语法\{#request-syntax}

```python
has_partition(
    partition_name: str, 
    timeout: float | None,
)
```

**参数：**

- **partition_name** (*str*) -

    要删除的 Partition 的名称。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*bool*

**返回：**

一个布尔值，表示当前 Collection 是否具有指定的 Partition

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

以下操作与 `has_collection()` 相关：

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [create_partition()](./Collection-create_partition)

- [partition()](./Collection-partition)

- [drop_partition()](./Collection-drop_partition)

