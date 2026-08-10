---
title: "create_partition() | Python | ORM"
slug: /python/python/Collection-create_partition
sidebar_label: "create_partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将在目标 Collection 中创建一个 Partition。 | Python | ORM"
type: docx
token: Sh7HdgJOIoJipXx5AoNcicjMnyd
sidebar_position: 5
keywords: 
  - knn algorithm
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - zilliz
  - zilliz cloud
  - cloud
  - create_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_partition()

此操作将在目标 Collection 中创建一个 Partition。

## 请求语法\{#request-syntax}

```python
create_partition(
    partition_name: str, 
    description: str | None, 
)
```

**参数：**

- **partition_name** (*string*)

    **[必需]**

    要创建的 Partition 的名称。

- **description** (*string*)

    此 Partition 的描述。

**返回类型：**

*[Partition](./ORM-Partition)*

**返回：**

一个 Partition 对象。

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
partition = collection.create_partition(partition_name="test_partition")

# Output
# {"name":"test_partition","collection_name":"test_collection","description":""}
```

## 相关操作\{#related-operations}

以下操作与 `create_partition()` 相关：

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [partition()](./Collection-partition)

- [drop_partition()](./Collection-drop_partition)

- [has_partition()](./Collection-has_partition)

