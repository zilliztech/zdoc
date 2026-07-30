---
title: "grant() | Python | ORM"
slug: /python/python/Role-grant
sidebar_label: "grant()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作向当前角色授予权限。 | Python | ORM"
type: docx
token: BapSdVXjQoQXnbxnRYScCagAn1f
sidebar_position: 5
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - grant()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# grant()

此操作向当前角色授予权限。

## 请求语法\{#request-syntax}

```python
grant(
    object: str,
    object_name: str,
    privilege: str,
    db_name: str
) 
```

**参数：**

- **object** (*string*)

    **[REQUIRED]**

    要授予权限的对象类型。

    该值区分大小写。详情请参见 Users & Roles。

- **object_name** (*string*)

    **[REQUIRED]**

    在 **object** 中指定类型的目标对象名称。

    它可以是 collection 名称、用户名或通配符（*）。

- **privilege** (*string*)

    **[REQUIRED]**

    要授予的权限名称。

    详情请参见 Users & Roles。

    <Admonition type="info" icon="📘" title="说明">

    - 要向某一类对象授予所有权限，例如 **[Collection](./ORM-Collection)**、**Global**、**User**，请将权限名称设为 `*`。
    
    - 当 `object` 设置为 `Global` 时，将 `privilege` 设为 `\*` 并不等同于将其设为 `All`。`All` 权限包含所有权限，包括针对任何 collection 和 user 对象的权限。

    </Admonition>

- **db_name** (*string*)

    对象所属数据库的名称。如果未指定，则使用默认数据库。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(role_name)

# Grant a privilege to the current role 
role.grant("Collection", collection_name, "Insert")
```

## 相关操作\{#related-operations}

以下操作与 `grant()` 相关：

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

- [revoke()](./Role-revoke)

