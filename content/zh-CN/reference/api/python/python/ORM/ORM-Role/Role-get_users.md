---
title: "get_users() | Python | ORM"
slug: /python/python/Role-get_users
sidebar_label: "get_users()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出与当前角色关联的所有用户。 | Python | ORM"
type: docx
token: CCOhd671iog6rRxu8aOcaPncnLK
sidebar_position: 4
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - get_users()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_users()

此操作会列出与当前角色关联的所有用户。

## 请求语法\{#request-syntax}

```python
get_users()
```

**参数**

无

**返回类型：**

*tuple*

**返回：**

一个元组，包含已添加到当前角色的所有用户名称。

## 示例\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="admin")

# List all users associated with the current role
users = role.get_users() # (admin, )
```

## 相关操作\{#related-operations}

以下操作与 `get_users()` 相关：

- [add_user()](./Role-add_user)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

