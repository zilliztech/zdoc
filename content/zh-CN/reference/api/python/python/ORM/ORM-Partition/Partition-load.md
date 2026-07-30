---
title: "load() | Python | ORM"
slug: /python/python/Partition-load
sidebar_label: "load()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将当前分区的数据加载到内存中。 | Python | ORM"
type: docx
token: TWxddf6iboyM15xK4Kzc8ASknRb
sidebar_position: 6
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - zilliz
  - zilliz cloud
  - cloud
  - load()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load()

此操作会将当前分区的数据加载到内存中。

<Admonition type="info" icon="📘" title="说明">

在 **[Collection](./ORM-Collection)** 对象的 **load()** 方法中使用 **partition_names** 参数，等同于对相应的 **[Partition](./ORM-Partition)** 对象使用 **load()** 方法。

</Admonition>

## 请求语法\{#request-syntax}

```python
load(
    replica_number: int,
    timeout: float | None
)
```

**参数：**

- **replica_number** (*int*)

    要在当前分区中加载的副本数量。默认值为 **1**，表示加载当前分区中的一个副本。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

*None*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时会引发此异常。

## 示例\{#examples}

```python
from pymilvus import Collection, Partition, CollectionSchema, FieldSchema, DataType

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

# Load a partition with one replica of the collection data
partition.load()

# Load a partition with two replicas of the collection data
partition.load(
    replica_number=2
)
```

## 相关操作\{#related-operations}

以下操作与 `load()` 相关：

- [drop()](./Partition-drop)

- [get_replicas()](./Partition-get_replicas)

- [release()](./Partition-release)

