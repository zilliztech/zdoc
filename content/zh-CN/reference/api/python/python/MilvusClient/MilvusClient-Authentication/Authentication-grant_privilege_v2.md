---
title: "grant_privilege_v2() | Python | MilvusClient"
slug: /python/python/Authentication-grant_privilege_v2
sidebar_label: "grant_privilege_v2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将指定的权限或权限组授予指定角色。 | Python | MilvusClient"
type: docx
token: EiTMdIbTgoc9vVxDHUQc1zPpnch
sidebar_position: 11
keywords: 
  - 私有 llms
  - nn 搜索
  - llm 评测
  - 稀疏 vs 稠密
  - zilliz
  - zilliz cloud
  - 云
  - grant_privilege_v2()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# grant_privilege_v2()

此操作会将指定的权限或权限组授予指定角色。

## 请求语法\{#request-syntax}

```python
grant_privilege_v2(
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

    **[必需]**

    要授予权限的角色名称。

- **privilege** (*str*) -

    **[必需]**

    要授予的权限名称。

    有关详细信息，请参见 [Users and Roles](https://milvus.io/docs/users_and_roles.md) 页面表格中的 **Privilege name** 列。

- **collection_name** (*str*) - 

    **[必需]**

    Collection 的名称。要授予与当前 Database 中所有 Collection 相关的权限，请将此参数设置为 `*`。

- **db_name** (*str*) -

    Database 的名称。

    此参数为可选。设置此参数会将权限授予限制在指定的 Database 内。

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将此参数设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回类型：**

*NoneType*

**返回值：**

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
```

