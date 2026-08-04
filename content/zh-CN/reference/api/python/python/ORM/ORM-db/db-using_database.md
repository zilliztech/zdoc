---
title: "using_database() | Python | ORM"
slug: /python/python/db-using_database
sidebar_label: "using_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将一个数据库设置为当前连接的默认数据库。 | Python | ORM"
type: docx
token: GXXTd7JIgoUKhzxiI6ncWtwjnVc
sidebar_position: 4
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - using_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# using_database()

此操作将一个数据库设置为当前连接的默认数据库。

## 请求语法\{#request-syntax}

Milvus 集群附带一个名为 **default** 的默认数据库。所有集合操作都在默认数据库中执行。您可以使用此方法更改默认数据库。

```python
using_database(
    db_name: str,
    using: str
)
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    要设置为默认数据库的数据库名称。

- **using** (*string*) -

    连接的别名。默认为 **default**。

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

db.using_database("test")

## You can directly use a database upon the connection as follows.
## However, the specified database should exist beforehand.
conn = connections.connect(host="127.0.0.1", port=19530, db_name="test")
```

## 相关操作\{#related-operations}

以下操作与 `using_database()` 相关：

- [create_database()](./db-create_database)

- [drop_database()](./db-drop_database)

- [list_database()](./db-list_database)

