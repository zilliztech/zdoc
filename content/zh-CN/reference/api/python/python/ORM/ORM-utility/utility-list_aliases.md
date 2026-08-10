---
title: "list_aliases() | Python | ORM"
slug: /python/python/utility-list_aliases
sidebar_label: "list_aliases()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出特定 Collection 的所有现有别名。 | Python | ORM"
type: docx
token: XBwxdP96Go8ITyx7UuNcL7EonPd
sidebar_position: 22
keywords: 
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - 开源向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - list_aliases()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_aliases()

此操作会列出特定 Collection 的所有现有别名。

## 请求语法\{#request-syntax}

```python
list_aliases(
    collection_name: str,
    using: str,
    timeout: float | None
)
```

**参数：**

- **collection_name** (*str*) -

    **【必需】**

    要列出其别名的 Collection 名称。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任何响应或发生任何错误时超时。

**返回类型：**

*list*

**返回值：**

指定 Collection 的别名列表。如果该 Collection 没有别名，则返回空列表。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **BaseException**

    当此操作失败时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, Collection, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get an existing collection
collection_1 = Collection("collection_1")

# Create an alias for collection_1
utility.create_alias(collection_name="collection_1", alias="bob")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['bob']

# Create another alias for collection_1
utility.create_alias(collection_name="collection_1", alias="tom")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['bob', 'tom']
```

## 相关操作\{#related-operations}

以下操作与 `drop_alias()` 相关：

- [alter_alias()](./utility-alter_alias)

- [create_alias()](./utility-create_alias)

- [drop_alias()](./utility-drop_alias)

