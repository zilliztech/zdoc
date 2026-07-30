---
title: "add_user() | Python | ORM"
slug: /python/python/Role-add_user
sidebar_label: "add_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将现有用户添加到当前角色。添加后，用户将获得当前角色所允许的权限，并可执行某些操作。 | Python | ORM"
type: docx
token: W7GJdpYrYoYhSaxW6uzcVAZinYf
sidebar_position: 1
keywords: 
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - add_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_user()

此操作会将现有用户添加到当前角色。添加后，用户将获得当前角色所允许的权限，并可执行某些操作。

## 请求语法\{#request-syntax}

```python
add_user(
    username: str
)
```

**参数：**

- **username** (*str*) -

    **[必需]**

    要添加到角色中的用户名。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Role, utility

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

以下操作与 `add_user()` 相关：

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

