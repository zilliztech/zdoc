---
title: "revoke_role() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_role
sidebar_label: "revoke_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会撤销分配给用户的角色。 | Python | MilvusClient"
type: docx
token: JJOId59ePoMLefxz1ChcBZ6inOh
sidebar_position: 19
keywords: 
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - revoke_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke_role()

此操作会撤销分配给用户的角色。

## 请求语法\{#request-syntax}

```python
revoke_role(
    user_name: str,
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

**参数：**

- **user_name** (*str*) -

    **[必需]**

    现有用户的名称。

- **role_name** (*str*) -

    **[必需]**

    要撤销的角色名称。

- **timeout** (*float* | *None*)  

    此操作的超时时长。 

    将此参数设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。

- **BaseException**

    此操作失败时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. Grant the role to the user
client.grant_role(user_name="user_1", role_name="db_ro")

# 4. Revoke the role from the user
client.revoke_role(user_name="user_1", role_name="db_ro")
```

