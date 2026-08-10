---
title: "revoke() | Python | ORM"
slug: /python/python/Role-revoke
sidebar_label: "revoke()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会撤销授予当前角色的权限。 | Python | ORM"
type: docx
token: UUJWdoEnjoXx69xahsScdMVSnzf
sidebar_position: 10
keywords: 
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - revoke()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke()

此操作会撤销授予当前角色的权限。

## 请求语法\{#request-syntax}

```python
revoke(
    object: str,
    object_name: str,
    privilege: str,
    db_name: str
) 
```

**参数：**

- **object** (*string*)

    **[必需]**

    要授予权限的对象类型。

    该值区分大小写。详情请参见 Users & Roles。

- **object_name** (*string*)

    **[必需]**

    由 **object** 指定类型的目标对象名称。

    它可以是 Collection 名称、用户名或通配符（*）。

- **privilege** (*string*)

    **[必需]**

    要授予的权限名称。

    详情请参见 Users & Roles。

    <Admonition type="info" icon="📘" title="Notes">

    - 要向某类对象授予所有权限，例如 **[Collection](./ORM-Collection)**、**Global**、**User**，请使用 `*` 作为权限名称。
    
    - 当 `object` 设置为 `Global` 时，将 `privilege` 设置为 `\*` 并不等同于将其设置为 `All`。`All` 权限包含所有许可，包括任何 Collection 和用户对象。

    </Admonition>

- **db_name** (*string*)

    对象所属 Database 的名称。如果未指定，则使用默认 Database。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- **MilvusException**

    在此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(role_name)

# Grant a privilege to the current role 
role.revoke("Collection", collection_name, "Insert")
```

## 相关操作\{#related-operations}

以下操作与 `revoke()` 相关：

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

