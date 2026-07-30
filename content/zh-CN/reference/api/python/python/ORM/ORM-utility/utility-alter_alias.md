---
title: "alter_alias() | Python | ORM"
slug: /python/python/utility-alter_alias
sidebar_label: "alter_alias()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将一个集合的别名重新分配给另一个集合。 | Python | ORM"
type: docx
token: MfTsdrbGcoO9JqxjgPtcMZTvncc
sidebar_position: 1
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - alter_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# alter_alias()

此操作将一个集合的别名重新分配给另一个集合。

## 请求语法\{#request-syntax}

```python
alter_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

```python
from pymilvus import utility

# Alter collection alias
alter_alias(
    collection_name="string",
    alias="string",
    using="default"
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    要重新分配别名的目标集合名称。

- **alias** (*str*) -

    **[必需]**

    集合的别名。请注意，该别名必须事先已存在。

    <Admonition type="info" icon="📘" title="说明">

    什么是[集合](./ORM-Collection)别名？
    
        [集合](./ORM-Collection)别名是集合的附加名称。当您希望将应用程序切换到新集合而无需修改代码时，集合别名会非常有用。 
    
        在 中，[集合](./ORM-Collection)别名是全局唯一标识符。一个别名只能分配给一个集合。反之，一个集合可以有多个别名。
    
        下面是将一个集合的别名重新分配给另一个集合的示例：
    
        假设有两个集合：`collection_1` 和 `collection_2`。还有一个名为 `bob` 的集合别名，它原本分配给 `collection_1`：
    
        - `collection_1` 的别名 = ["bob"]
    
        - `collection_2` 的别名 = []
    
        调用 `alter_alias("collection_2", "bob")` 后：
    
        - `collection_1` 的别名 = []
    
        - `collection_2` 的别名 = ["bob"]

    </Admonition>

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

无

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常，尤其是在指定的别名不存在时。

## 示例\{#examples}

```python
from pymilvus import connections, Collection, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get two existing collections
collection_1 = Collection("collection_1")
collection_2 = Collection("collection_2")

# Create an alias for collection_1
utility.create_alias(collection_name="collection_1", alias="bob")

# List aliases for both collections
utility.list_aliases(collection_name="collection_1") # ['bob']
utility.list_aliases(collection_name="collection_2") # []
        
# Reassigns the alias to collection_2
utility.alter_alias(collection_name="test_collection_2", alias="bob")

# List aliases for both collections
utility.list_aliases(collection_name="collection_1") # []
utility.list_aliases(collection_name="collection_2") # ['bob']
```

## 相关操作\{#related-operations}

以下操作与 `alter_alias()` 相关：

- [create_alias()](./utility-create_alias)

- [drop_alias()](./utility-drop_alias)

- [list_aliases()](./utility-list_aliases)

