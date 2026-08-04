---
title: "drop_collection() | Python | ORM"
slug: /python/python/utility-drop_collection
sidebar_label: "drop_collection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作删除特定 collection。 | Python | ORM"
type: docx
token: FHcYdN4apoI5TIx0LxScISvtn0f
sidebar_position: 10
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection()

此操作删除特定 collection。

## 请求语法\{#request-syntax}

```python
drop_collection(
    collection_name: str,
    timeout: float | None,
    using: str = "default",
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    要删除的 collection 名称。

- **timeout** (*float*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

**返回类型：**

*NoneType*

**返回：**

None

**异常：**

N/A

### 示例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Drop a specific collection
utility.drop_collection(
    collection_name="test_collection",
)
```

## 相关操作\{#related-operations}

以下操作与 `drop_collection()` 方法相关：

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

