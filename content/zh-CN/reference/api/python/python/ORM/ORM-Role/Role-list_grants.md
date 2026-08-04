---
title: "list_grants() | Python | ORM"
slug: /python/python/Role-list_grants
sidebar_label: "list_grants()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出授予当前角色的所有权限。 | Python | ORM"
type: docx
token: YRoGdgQmWoIEaJx84ICcHTILnMe
sidebar_position: 8
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - list_grants()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_grants()

此操作会列出授予当前角色的所有权限。

## 请求语法\{#request-syntax}

```python
list_grants(
    db_name: str
)
```

**参数：**

- **db_name** (*str*)

    Zilliz Cloud 在其中执行此操作的数据库名称。

    如果指定的数据库不存在，则返回空结果。

**返回类型：**

*GrantInfo*

**返回：**

一个 **GrantInfo** 对象，其中包含一个 **GrantItem** 对象列表。

```python
├── GrantInfo
│   └── groups  
│       └── GrantItem
│           ├── object
│           ├── object_name
│           ├── role_name
│           ├── grantor_name
│           ├── privilege
│           └── db_name
```

**GrantItem** 对象包含以下字段：

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="root")

# List all privileges granted to the current role.
res = list_grants(
    db_name="test_db"
)
```

## 相关操作\{#related-operations}

以下操作与 `get_replicas()` 相关：

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [remove_user()](./Role-remove_user)

