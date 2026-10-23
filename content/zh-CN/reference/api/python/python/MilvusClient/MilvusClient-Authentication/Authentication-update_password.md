---
title: "update_password() | Python | MilvusClient"
slug: /python/python/Authentication-update_password
sidebar_label: "update_password()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于更新指定用户的密码。 | Python | MilvusClient"
type: docx
token: ZbGcdPeOZoyFpPxfKwnclTv5ncf
sidebar_position: 20
keywords: 
  - Agentic RAG
  - rag llm 架构
  - 私有 LLM
  - 最近邻搜索
  - zilliz
  - zilliz cloud
  - 云
  - update_password()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# update_password()

此操作用于更新指定用户的密码。

## 请求语法\{#request-syntax}

```python
update_password(
    user_name: str,
    old_password: str,
    new_password: str,
    timeout: Optional[float] = None,
    description: Optional[str] = None,
    **kwargs
)
```

**参数：**

- **user_name** (*str*) -

    **[必填]**

    现有用户的名称。

- **old_password** (*str*) -

    **[必填]**

    用户的原始密码。

- **new_password** (*str*) -

    **[必填]**

    用户的新密码。

- **reset_connection** (*bool*) -

    用于重置绑定到该用户的连接，使其使用新凭据重新进行身份验证的标志。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息，以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)
client.update_password(
    user_name="alice",
    old_password="OldP@ss",
    new_password="NewP@ss",
    reset_connection=True,
)
```
