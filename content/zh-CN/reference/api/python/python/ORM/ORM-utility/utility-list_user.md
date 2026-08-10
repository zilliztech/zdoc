---
title: "list_user() | Python | ORM"
slug: /python/python/utility-list_user
sidebar_label: "list_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出特定用户的信息。 | Python | ORM"
type: docx
token: JeG6d5Sg2oPmXPxEhnyciq4snNd
sidebar_position: 28
keywords: 
  - Faiss
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - zilliz
  - zilliz cloud
  - 云
  - list_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_user()

此操作列出特定用户的信息。

## 请求语法\{#request-syntax}

```python
list_user(
    username: str,
    include_role_info: bool,
    using: str,
    timeout: float | None
)
```

**参数**

- **username** (*string*) - 

    **[必需]**

    要列出信息的用户名。

- **include_role_info** (*bool*) - 

    **[必需]**

    是否让 Zilliz Cloud 列出授予指定用户的角色。

- **using** (*string*) - 

    所用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作将超时。

**返回类型：**

*UserInfo*

**返回：**

一个包含用户信息的 **UserInfo** 对象。

```python
├── UserInfo
│   └── groups  
│       └── UserItem
│           ├── username
│           ├── roles
```

**UserItem** 对象包含以下字段：

- **username** (*str*)

    用户名称。

- **roles** (*str*)

    分配给该用户的角色。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, Role, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# List the information of a specific user
users = utility.list_user(
    username="admin", 
    include_role_info=True,
    using="default"
)

# UserInfo groups:
# - UserItem: <username:admin>, <roles:('admin',)>
```

## 相关操作\{#related-operations}

以下操作与 `list_user()` 相关：

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

