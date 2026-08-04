---
title: "drop_user() | Python | MilvusClient"
slug: /python/python/Authentication-drop_user
sidebar_label: "drop_user()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个用户。 | Python | MilvusClient"
type: docx
token: WtyZdeFKMoSv5exaYRxcPLCSndg
sidebar_position: 9
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - drop_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_user()

此操作会删除一个用户。

## 请求语法\{#request-syntax}

```python
drop_user(
    user_name: str,
    timeout: Optional[float] = None
)
```

**参数：**

- **user_name** (*str*) -

    **[必需]**

    要删除的用户名称。

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

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. Drop the user
client.drop_user(user_name="user_1")
```

## 相关方法\{#related-methods}

- [create_user()](./utility-create_user)

- [describe_user()](./Authentication-describe_user)

- [list_users()](./Authentication-list_users)

- [update_password()](./Authentication-update_password)

