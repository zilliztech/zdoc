---
title: "drop_database() | Python | ORM"
slug: /python/python/db-drop_database
sidebar_label: "drop_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用提供的 Database 名称删除 Database。 | Python | ORM"
type: docx
token: Y7pOdKR4MoqmvVxcS1TcjqUynMc
sidebar_position: 2
keywords: 
  - milvus 向量数据库
  - Zilliz Cloud
  - 什么是 milvus
  - milvus Database
  - zilliz
  - zilliz cloud
  - 云
  - drop_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_database()

此操作使用提供的 Database 名称删除 Database。

## 请求语法\{#request-syntax}

```python
drop_database(
    db_name: str,
    using: str,
    timeout: float | None
)
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    要删除的 Database 名称。

- **using** (*string*) -

    连接的别名。默认为 **default**。

- **timeout** (*float* | *None*)

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

None

**返回值：**

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

db.drop_database(db_name="test")
```

## 相关操作\{#related-operations}

以下操作与 `drop_database()` 相关：

- [create_database()](./db-create_database)

- [list_database()](./db-list_database)

- [using_database()](./db-using_database)

