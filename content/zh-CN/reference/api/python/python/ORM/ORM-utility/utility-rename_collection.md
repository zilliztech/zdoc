---
title: "rename_collection() | Python | ORM"
slug: /python/python/utility-rename_collection
sidebar_label: "rename_collection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会重命名现有 Collection，并可选择将该 Collection 移动到新的 Database。 | Python | ORM"
type: docx
token: M0qRdF1cLokrxvxyrXScJ64FnEe
sidebar_position: 37
keywords: 
  - 幻觉 llm
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - zilliz
  - zilliz cloud
  - 云
  - rename_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# rename_collection()

此操作会重命名现有 Collection，并可选择将该 Collection 移动到新的 Database。

<Admonition type="info" icon="📘" title="Notes">

为目标 Collection 创建的别名在此操作后将保持不变。

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
    目标 Collection 的原始名称。

    如果将其设置为不存在的 Collection，将导致 **MilvusException**。

- **new_collection_name** (*str*) -

    **[必需]**

    此操作后目标 Collection 的名称。

    如果将其设置为 **old_collection_name** 的值，将导致 **MilvusException**。

- **new_db_name** (*str*) -

    此操作后该 Collection 所属的 Database 名称。

    该值默认为 **default**。如果将其设置为与此操作前该 Collection 所属 Database 不同的 Database，则会将该 Collection 移动到指定的 Database。

    如果将其设置为不存在的 Database，将导致 **MilvusException**。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示在收到任何响应或发生任何错误时，此操作才会超时。

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

