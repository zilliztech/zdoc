---
title: "create_database() | Python | ORM"
slug: /python/python/db-create_database
sidebar_label: "create_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用提供的数据库名称创建数据库。 | Python | ORM"
type: docx
token: G4Ftde3kxoHAJbxVNXncI7mpngb
sidebar_position: 1
keywords: 
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - create_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_database()

此操作使用提供的数据库名称创建数据库。

## 请求语法\{#request-syntax}

```python
create_database(
    db_name: str,
    using: str,
    timeout: float | None
)
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    要创建的数据库名称。

- **using** (*string*) -

    连接的别名。默认为 **default**。

- **timeout** (*float* | *None*)

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

None

**返回：**

None

**异常：**

None

## 示例\{#examples}

```python
from pymilvus import connections, db

conn = connections.connect(
    host="127.0.0.1", 
    port=19530
)

db.create_database(db_name="test")
```

## 相关操作\{#related-operations}

以下操作与 `create_database()` 相关：

- [drop_database()](./db-drop_database)

- [list_database()](./db-list_database)

- [using_database()](./db-using_database)

