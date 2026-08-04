---
title: "partition() | Python | ORM"
slug: /python/python/Collection-partition
sidebar_label: "partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取当前 collection 中指定的 partition。 | Python | ORM"
type: docx
token: SvCrdEJIdosGQYxQZhrc2OAXnpd
sidebar_position: 21
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# partition()

此操作获取当前 collection 中指定的 partition。

## 请求语法\{#request-syntax}

```python
partition(
    partition_name: str
)
```

**参数：**

- **partition_name** (*str*) -

    **[必需]**

    要获取的 partition 名称。

**返回类型：**

*Partition* | *NoneType*

**返回：**

一个 **Partition** 对象。如果当前 collection 不存在指定名称的 partition，则返回 **None**。

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
partition = collection.partition(partition_name="test_partition")
```

## 相关操作\{#related-operations}

以下操作与 `partition()` 相关：

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [create_partition()](./Collection-create_partition)

- [drop_partition()](./Collection-drop_partition)

- [has_partition()](./Collection-has_partition)

