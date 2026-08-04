---
title: "list_usernames() | Python | ORM"
slug: /python/python/utility-list_usernames
sidebar_label: "list_usernames()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有现有用户的名称。 | Python | ORM"
type: docx
token: RXi3dgtNYogU0cxmTsgcdT72nsc
sidebar_position: 29
keywords: 
  - 什么是 milvus
  - milvus 数据库
  - milvus lite
  - milvus 基准测试
  - zilliz
  - zilliz cloud
  - cloud
  - list_usernames()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_usernames()

此操作列出所有现有用户的名称。

## 请求语法\{#request-syntax}

```python
list_usernames(
    using: str,
    timeout: float | None
)
```

**参数：**

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任何响应或发生任何错误时超时。

**返回类型：**

*list*

**返回：**

一个包含所有现有用户名称的列表。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# List all existing usernames
users = utility.list_usernames()
```

## 相关操作\{#related-operations}

以下操作与 `list_usernames()` 相关

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

