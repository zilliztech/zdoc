---
title: "rename_collection() | Python | ORM"
slug: /python/python/utility-rename_collection
sidebar_label: "rename_collection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会重命名现有集合，并可选择将该集合移动到新的数据库中。 | Python | ORM"
type: docx
token: M0qRdF1cLokrxvxyrXScJ64FnEe
sidebar_position: 37
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - rename_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# rename_collection()

此操作会重命名现有集合，并可选择将该集合移动到新的数据库中。

<Admonition type="info" icon="📘" title="说明">

为目标集合创建的别名在此操作后仍会保留。

</Admonition>

## 请求语法\{#request-syntax}

```python
rename_collection(
    old_collection_name: str,
    new_collection_name: str,
    new_db_name: str = "default",
    timeout: float | None,
    using: str = "default",
)
```

**参数：**

- **old_collection_name** (*str*) -

    **[必需]**
    目标集合的原始名称。

    如果将其设置为不存在的集合，将导致 **MilvusException**。

- **new_collection_name** (*str*) -

    **[必需]**

    此操作后目标集合的名称。

    如果将其设置为 **old_collection_name** 的值，将导致 **MilvusException**。

- **new_db_name** (*str*) -

    此操作后该集合所属数据库的名称。

    该值默认为 **default**。如果将其设置为与此操作前集合所属数据库不同的数据库，则会将该集合移动到指定数据库。

    如果将其设置为不存在的数据库，将导致 **MilvusException**。

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

    当此操作期间发生任何错误时，将引发此异常，尤其是在指定别名不存在时。

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Renames a collection
utility.rename_collection(
    old_collection_name="test_collection_1",
    new_collection_name="test_collection_2",
)

# Renames a collection and moves it to a new database
utility.rename_collection(
    old_collection_name="test_collection_1",
    new_collection_name="test_collection_2",
    new_db_name="new_database"
)
```

## 相关操作\{#related-operations}

以下操作与 `rename_collection()` 相关：

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

