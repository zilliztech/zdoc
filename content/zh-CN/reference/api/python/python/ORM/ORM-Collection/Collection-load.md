---
title: "load() | Python | ORM"
slug: /python/python/Collection-load
sidebar_label: "load()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将当前 collection 的数据加载到内存中。 | Python | ORM"
type: docx
token: HQDndiGwloWKIexgPCUcEZGenOh
sidebar_position: 20
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
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

此操作将当前 collection 的数据加载到内存中。

## 请求语法\{#request-syntax}

```python
load(
    partition_names: list[str] | None, 
    replica_number: int, 
    timeout: float | None, 
)
```

<Admonition type="info" icon="📘" title="说明">

此操作为非阻塞操作。您可以调用 `utility.wait_for_loading_complete()` 来阻塞当前进程。

</Admonition>

**参数：**

- **partition_names** (*list(str)* | *None*) - 

    要加载的当前 collection 的分区。如果未指定，则加载所有分区。

- **timeout** (*float* | *None*)  -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

<Admonition type="warning" icon="🚧" title="警告">

如果您尝试加载一个未建立索引的 collection，将会收到 **MilvusException**。

</Admonition>

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

# Set the index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {
        "nprobe": 10
    }
}

# Create an index on the vector field
collection.create_index(
    field_name="vector", 
    index_params=index_params, 
    timeout=None
)

# Load the entire collection with one replica of the collection data
collection.load()

# Load the entire collection with two replicas of the collection data
collection.load(
    replica_number=2
)

# Load a specific partition with two replicas of the partition data
collection.load(
    partition_names=["partitionA"],
    replica_number=2
)
```

## 相关操作\{#related-operations}

以下操作与 `load()` 相关：

- [Partition](./ORM-Partition)

- [release()](./Collection-release)

- [load_state()](./utility-load_state)

- [loading_progress()](./utility-loading_progress)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

