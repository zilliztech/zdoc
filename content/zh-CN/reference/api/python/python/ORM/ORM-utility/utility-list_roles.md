---
title: "list_roles() | Python | ORM"
slug: /python/python/utility-list_roles
sidebar_label: "list_roles()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有现有角色的信息。 | Python | ORM"
type: docx
token: ClLXdDs64oixJBxlIrCcEB2dngb
sidebar_position: 27
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - zilliz
  - zilliz cloud
  - cloud
  - list_roles()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_roles()

此操作列出所有现有角色的信息。

## 请求语法\{#request-syntax}

```python
list_roles(
    include_user_info: bool,
    using: str,
    timeout: float | None
)
```

**参数：**

- **include_user_info** (*bool*) - 

    **[必需]**

    Zilliz Cloud 是否列出与所列角色关联的用户。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任何响应或发生任何错误时超时。

**返回类型：**

*RoleInfo*

**返回：**

一个 **RoleInfo** 对象，其中包含 **RoleItem** 对象列表。

```python
├── RoleInfo
│   └── groups  
│       └── RoleItem
│           ├── role_name
│           ├── users
```

一个 **RoleItem** 对象包含以下字段：

- **role_name** (*str*)

    角色名称。

- **users** (*str*)

    被授予该角色的用户。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, Role, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a user
user = utility.create_user(user="admin", password="123456")

# Create a role
role=Role(
    name="admin",
)

role.create()

# Add the user to the role
role.add_user(username="admin")

# List role information
utility.list_roles(include_user_info=True)

# RoleInfo groups:
# - RoleItem: <role_name:admin>, <users:('admin',)>
# - RoleItem: <role_name:public>, <users:()>
```

## 相关操作\{#related-operations}

以下操作与 `list_roles()` 相关：

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

