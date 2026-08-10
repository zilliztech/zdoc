---
title: "list_database() | Python | ORM"
slug: /python/python/db-list_database
sidebar_label: "list_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回已连接的 Milvus 实例中的 Database 名称列表。 | Python | ORM"
type: docx
token: PV1PdliWZooAB8xAE5scZO2Nn6K
sidebar_position: 3
keywords: 
  - Chroma vs Milvus
  - Annoy 向量搜索
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - list_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_database()

此操作返回已连接的 Milvus 实例中的 Database 名称列表。

```python
list_database(
    using: str,
    timeout: float | None
)
```

## 请求语法\{#request-syntax}

```python
from pymilvs import db

db.list_database()
```

**参数：**

- **using** (*string*) -

    连接的别名。默认为 **default**。

- **timeout** (*float* | *None*)

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*List*

**返回值：**

Database 名称列表。

**异常：**

无

## 示例\{#examples}

```python
from pymilvus import connections, db

conn = connections.connect(
    host="127.0.0.1", 
    port=19530
)

db.list_database()

# Output
# ["default", "test"]
```

## 相关操作\{#related-operations}

以下操作与 `list_database()` 相关：

- [create_database()](./db-create_database)

- [drop_database()](./db-drop_database)

- [using_database()](./db-using_database)

