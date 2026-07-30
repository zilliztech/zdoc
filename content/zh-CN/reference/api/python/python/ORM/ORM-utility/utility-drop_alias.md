---
title: "drop_alias() | Python | ORM"
slug: /python/python/utility-drop_alias
sidebar_label: "drop_alias()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除指定的集合别名。 | Python | ORM"
type: docx
token: V7BWdrC39oPAauxoWBzcaldwnVc
sidebar_position: 9
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_alias()

此操作会删除指定的[集合](./ORM-Collection)别名。 

## 请求语法\{#request-syntax}

```python
drop_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

**参数：**

- **alias** (*str*) -

    **[必需]**

    要删除的别名。

    <Admonition type="info" icon="📘" title="说明">

    删除别名时，您无需提供集合名称，因为一个别名只能分配给且仅能分配给一个集合。因此，服务器知道指定的别名属于哪个集合。

    </Admonition>

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

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

# Drop the alias bob
utility.drop_alise(alias="bob")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['tom']
```

## 相关操作\{#related-operations}

以下操作与 `drop_alias()` 相关：

- [alter_alias()](./utility-alter_alias)

- [create_alias()](./utility-create_alias)

- [list_aliases()](./utility-list_aliases)

