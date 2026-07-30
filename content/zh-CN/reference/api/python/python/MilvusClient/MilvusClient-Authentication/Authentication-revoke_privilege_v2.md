---
title: "revoke_privilege_v2() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_privilege_v2
sidebar_label: "revoke_privilege_v2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从指定角色中撤销指定的权限或权限组。 | Python | MilvusClient"
type: docx
token: WazKdTlcOoYoBWxIJEEc7gFMnfC
sidebar_position: 18
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - revoke_privilege_v2()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke_privilege_v2()

此操作会从指定角色中撤销指定的权限或权限组。

## 请求语法\{#request-syntax}

```python
revoke_privilege_v2(
    self,
    role_name: str,
    privilege: str,
    collection_name: str,
    db_name: Optional[str] = None,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**参数：**

- **role_name** (*str*) -

    **[必填]**

    要从中撤销权限的角色名称。

- **privilege** (*str*) -

    **[必填]**

    要撤销的权限名称。

    如需了解详情，请参阅 [Users and Roles](https://milvus.io/docs/users_and_roles.md) 页面表格中的 **Privilege name** 列。

- **collection_name** (*str*) - 

    **[必填]**

    集合名称。要撤销与当前数据库中所有集合相关的权限，请将此参数设置为 `*`。

- **db_name** (*str*) -

    数据库名称。

    此参数为可选项。设置此参数会将权限分配限制在指定数据库内。

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **BaseException**

    当此操作失败时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 1. Prepare a privilege group
client.create_privilege_group(
    group_name="my_privilege_group"
)

client.add_privileges_to_group(
    group_name="my_privilege_group",
    privileges=["ListDatabases", "DescribeDatabase"]
) 

# 2. Create a role
client.create_role(role_name="read_only")

# 3. Grant privileges
client.grant_privilege_v2(
    role_name="db_read_only",
    privilege="my_privilege_group",
    collection_name="*"
)

# 4. Revoke privileges
client.rovke_privilege_v2(
    role_name="db_read_only",
    privilege="my_privilege_group",
    collection_name="*"
)
```

