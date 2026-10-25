---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于描述特定角色。 | Python | MilvusClient"
type: docx
token: KoC3dcgn8oiJkNx8uZNcHvE4nxe
sidebar_position: 5
keywords: 
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_role()

此操作用于描述特定角色。

## 请求语法\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> dict
```

**参数：**

- **role_name** （*str*） -

    **[必需]**

    要描述的角色名称。

- **timeout** （*float | None*） -

    此操作的超时时长。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

**返回类型：**

*dict*

**返回：**

一个包含角色名称、角色描述和授予该角色的权限的字典。

**参数：**

- **role** （*str*） -

    所描述角色的名称。

- **description** （*str*） -

    角色的描述。

- **privileges** （*list[dict]*） -

    授予该角色的权限。每个字典包含一项授权。

    - **object_type** （*str*） -

        授予该角色的资源对象的类型。可选值为 Collection、Global 和 User。

    - **object_name** （*str*） -

        授予该角色的资源对象的名称。建议使用星号（&ast;）。

    - **db_name** （*str*） -

        该角色可访问的 Database 名称。

    - **role_name** （*str*） -

        所指定角色的名称。

    - **privilege** （*str*） -

        授予该角色的权限名称。

    - **grantor_name** （*str*） -

        授予该权限的用户的名称。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息，以了解确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
roles = client.describe_role(role_name="reader")
for item in roles:
    print(
        item.role_name,
        item.description,
    )
```
