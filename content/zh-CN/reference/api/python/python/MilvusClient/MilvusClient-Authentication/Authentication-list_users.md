---
title: "list_users() | Python | MilvusClient"
slug: /python/python/Authentication-list_users
sidebar_label: "list_users()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有现有用户的名称。 | Python | MilvusClient"
type: docx
token: EZ2YdBHoDoRTlxx91tscffm1nSb
sidebar_position: 15
keywords: 
  - milvus 向量数据库
  - Zilliz Cloud
  - 什么是 milvus
  - milvus Database
  - zilliz
  - zilliz cloud
  - 云
  - list_users()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_users()

此操作会列出所有现有用户的名称。

## 请求语法\{#request-syntax}

```python
list_users(
    timeout: Optional[float] = None
) -> List
```

**参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。 

    将此参数设置为 **None** 表示，当收到任何响应或发生任何错误时，此操作才会超时。

**返回类型：**

*list*

**返回值：**

用户名称列表。

**异常：**

- **MilvusException**

    在此操作期间发生任何错误时，将引发此异常。

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

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. List all users
client.list_users()

# ['db_admin', 'user_1']
```

## 相关方法\{#related-methods}

- [create_user()](./utility-create_user)

- [describe_user()](./Authentication-describe_user)

- [drop_user()](./Authentication-drop_user)

- [update_password()](./Authentication-update_password)

