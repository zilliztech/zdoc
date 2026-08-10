---
title: "release() | Python | ORM"
slug: /python/python/Partition-release
sidebar_label: "release()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将当前 Partition 的数据从内存中释放。 | Python | ORM"
type: docx
token: ZQ2RdE2AOoH9bfx4k3Sc3Ny0ngb
sidebar_position: 9
keywords: 
  - 机器学习
  - RAG
  - NLP
  - 神经网络
  - zilliz
  - zilliz cloud
  - 云
  - release()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# release()

此操作会将当前 Partition 的数据从内存中释放。

## 请求语法\{#request-syntax}

```python
release(
    timeout: float | None
)
```

**参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时间。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作才会超时。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，会引发此异常。

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
partition = Partition(collection, name="comedy", description="comedy films")

# Load the partition data
partition.load()

# Release the partition data
partition.release()
```

## 相关操作\{#related-operations}

以下操作与 `release()` 相关：

- [drop()](./Partition-drop)

- [get_replicas()](./Partition-get_replicas)

- [load()](./Partition-load)

