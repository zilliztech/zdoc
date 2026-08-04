---
title: "create_user() | Python | ORM"
slug: /python/python/ORM-utility/utility-create_user
sidebar_label: "create_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个带有对应密码的新用户。 | Python | ORM"
type: docx
token: N44ndTSrgoEBx7xCID5cXRS7n1c
sidebar_position: 5
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - create_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# create_user()

此操作会创建一个带有对应密码的新用户。

## 请求语法\{#request-syntax}

```python
create_user(
    user: str,
    password: str,
    using: str,
    timeout: float | None
)
```

```python
from pymilvus import utility

# Create a new user
utility.create_user(
    user="string",
    password="string",
    using="default"
)
```

**参数：**

- **user** (*string*) - 

    **[必需]**

    要创建的新用户的名称。该值应以字母开头，并且只能包含下划线、字母和数字。

- **password** (*string*) - 

    **[必需]**

    要创建的新用户对应的密码。

    密码必须是一个长度为 8 到 64 个字符的字符串，并且必须至少包含以下字符类型中的三种：大写字母、小写字母、数字和特殊字符。

- **using** (*string*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将此参数设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

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
```

## 相关操作\{#related-operations}

以下操作与 `create_user()` 相关：

- [Role](./ORM-Role)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

