---
title: "reset_password() | Python | ORM"
slug: /python/python/utility-reset_password
sidebar_label: "reset_password()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会重置特定用户的密码。 | Python | ORM"
type: docx
token: K1Npdj5Ddod6UWxRN2ecf6K4nxf
sidebar_position: 38
keywords: 
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - zilliz
  - zilliz cloud
  - 云
  - reset_password()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# reset_password()

此操作会重置特定用户的密码。 

<Admonition type="info" icon="📘" title="Notes">

此操作与 **update_password()** 的不同之处在于，它还会使用新设置的凭据重置当前连接。

</Admonition>

## 请求语法\{#request-syntax}

```python
reset_password(
    user: str,
    old_password: str,
    new_password: str,
    using: str,
    timeout: float | None
)
```

**参数：**

- **user** (*str*) - 

    **[必需]**

    要重置密码的特定用户。

- **old_password** (*str*) - 

    **[必需]**

    指定用户的原始密码。

    如果将其设置为错误的密码，将导致 **MilvusException**。

- **new_password** (*str*) - 

    **[必需]**

    指定用户的新密码。 

    密码必须是一个 8 到 64 个字符的字符串，并且必须至少包含以下字符类型中的三种：大写字母、小写字母、数字和特殊字符。

- **using** (*string*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a user
user = utility.create_user(user="admin", password="123456")

# Reset the password for the user.
reset_password(
    user="admin",
    old_password="123456",
    new_password="123456Abc*",
    using="default"
)
```

## 相关操作\{#related-operations}

以下操作与 `reset_password()` 相关

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [update_password()](./utility-update_password)

