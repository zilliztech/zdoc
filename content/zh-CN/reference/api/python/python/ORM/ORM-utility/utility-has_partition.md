---
title: "has_partition() | Python | ORM"
slug: /python/python/utility-has_partition
sidebar_label: "has_partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检查分区是否存在。 | Python | ORM"
type: docx
token: KsmadNcXRoElO2xJi5HcJO57nwb
sidebar_position: 18
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - has_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_partition()

此操作检查分区是否存在。

## 请求语法\{#request-syntax}

```python
has_partition(
    collection_name: str,
    partition_name: str,
    using: str = "default",
    timeout: float | None,
)
```

**参数：**

- **collection_name** (*str*) -

    **[REQUIRED]**
    已存在的 collection 名称。

    如果将其设置为不存在的 collection，则会导致 **MilvusException**。

- **partition_name** (*str*) -

    **[REQUIRED]**
    分区名称。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作才会超时。

**返回类型：**

*bool*

**返回：**
布尔值，表示指定分区是否存在。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时将引发此异常，尤其是在指定别名不存在时。

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get an existing collection
collection = Collection(name="test_collection")

# Check whether a partition exist
collection.has_partition(
    collection_name="test_collection",
    partition_name="test_partition",
) # True
```

## 相关操作\{#related-operations}

以下操作与 `has_partition()` 相关：

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

