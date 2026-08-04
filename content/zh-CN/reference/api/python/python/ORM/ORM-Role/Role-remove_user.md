---
title: "remove_user() | Python | ORM"
slug: /python/python/Role-remove_user
sidebar_label: "remove_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将用户从当前角色中移除。移除后，该用户将失去当前角色所允许的权限。 | Python | ORM"
type: docx
token: SlmSdaD7rocMJsxThNHcOtEknVd
sidebar_position: 9
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - remove_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_user()

此操作会将用户从当前角色中移除。移除后，该用户将失去当前角色所允许的权限。

## 请求语法\{#request-syntax}

```python
remove_user(
    username: str
)
```

**参数：**

- **username** (*str*) -

    **[必需]**

    要从角色中移除的用户名称。

**返回类型：**

*NoneType*

**返回：**

*None*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name=role_name)

# Remove the specified user from the current role
role.remove_user(username)

# List all users of the current role
users = role.get_users()
```

## 相关操作\{#related-operations}

以下操作与 `add_user()` 相关：

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

