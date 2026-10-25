---
title: "create_user() | Python | MilvusClient"
slug: /python/python/Authentication-create_user
sidebar_label: "create_user()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于创建用户。 | Python | MilvusClient"
type: docx
token: EglSdm1jkozDSlxq6SEc4CRonVe
sidebar_position: 4
keywords: 
  - 句子转换器
  - 推荐系统
  - 信息检索
  - 降维
  - Zilliz
  - Zilliz Cloud
  - 云
  - create_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_user()

此操作用于创建用户。

## 请求语法\{#request-syntax}

```python
create_user(
    user_name: str,
    password: str,
    timeout: Optional[float] = None,
    description: Optional[str] = None,
    **kwargs
)
```

**参数：**

- **user_name** （*str*） -

    **[必需]**

    要创建的用户名。

- **password** （*str*） -

    **[必需]**

    要创建的用户密码。

- **description** （*Optional[str]*） -

    要创建用户的描述。

- **timeout** （*float | None*） -

    此操作的超时时长。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时会引发此异常。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)
client.create_user(
    user_name="alice",
    password="P@ssw0rd",
    description="Analytics team",
)
```
