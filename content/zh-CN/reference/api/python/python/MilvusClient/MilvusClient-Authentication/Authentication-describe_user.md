---
title: "describe_user() | Python | MilvusClient"
slug: /python/python/Authentication-describe_user
sidebar_label: "describe_user()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会描述特定用户。 | Python | MilvusClient"
type: docx
token: M1KhdfoEDokSUIxwB8fcKBeMn2b
sidebar_position: 6
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus 基准测试
  - zilliz
  - Zilliz Cloud
  - 云
  - describe_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_user()

此操作会描述特定用户。

## 请求语法\{#request-syntax}

```python
describe_user(
    user_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> dict
```

**参数：**

- **user_name** （*str*） -

    **[必需]**

    要描述的用户名称。

- **timeout** （*float | None*） -

    此操作的超时时长。将其设置为 None 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回类型：**

*dict*

**返回：**

一个包含用户名、已分配角色和描述的字典。如果未找到该用户，则返回空字典。

**参数：**

- **user_name** （*str*） -

    已描述用户账户的名称。

- **roles** （*list[str]*） -

    分配给该用户账户的角色。

- **description** （*str*） -

    为该用户账户存储的描述。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)
users = client.describe_user(user_name="alice")
for item in users:
    print(
        item.user_name,
        item.roles,
        item.description,
    )
```
