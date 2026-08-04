---
title: "create_alias() | Python | ORM"
slug: /python/python/utility-create_alias
sidebar_label: "create_alias()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为现有集合创建别名。 | Python | ORM"
type: docx
token: DthMdlg8Lozw89xNz4TcBv1LnOe
sidebar_position: 3
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - create_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_alias()

此操作为现有集合创建别名。

## 请求语法\{#request-syntax}

```python
create_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

**参数：**

- **collection_name** (*str*) -

    **[REQUIRED]**

    要为其创建别名的集合名称。

- **alias** (*str*) -

    **[REQUIRED]**

    集合的别名。在执行此操作前，请确保该别名尚不存在。如果已存在，则会发生异常。

    <Admonition type="info" icon="📘" title="说明">

    什么是集合别名？
    
        集合别名是集合的附加名称。当您希望将应用切换到新集合而无需对代码进行任何修改时，集合别名会非常有用。
    
        集合别名是全局唯一标识符。一个别名只能被分配给且仅能分配给一个集合。反过来，一个集合可以拥有多个别名。
    
        假设有一个集合：`collection_1`。您可以通过调用 `create_alias("collection_1", "bob")` 和 `create_alias("collection_1", "tom")`，为该集合分配两个不同的别名（`bob` 和 `tom`）。

    </Admonition>

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时结束。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常，尤其是在您将 `alias` 设置为已存在的别名时。

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

以下操作与 `create_alias()` 相关：

- [alter_alias()](./utility-alter_alias)

- [drop_alias()](./utility-drop_alias)

- [list_aliases()](./utility-list_aliases)

