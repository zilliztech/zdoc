---
title: "update_user() | Python | MilvusClient"
slug: /python/python/Authentication-update_user
sidebar_label: "update_user()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更新现有用户的描述。 | Python | MilvusClient"
type: docx
token: ScbQdPbi5obs0ex85uucaO2Mnzd
sidebar_position: 23
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - Zilliz
  - Zilliz Cloud
  - 云
  - update_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# update_user()

此操作会更新现有用户的描述。

## 请求语法\{#request-syntax}

```python
update_user(
    user_name: str,
    description: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**参数：**

- **user_name** (*str*) -

    **[必需]**

    要更新的用户账户的名称。

- **description** (*str*) -

    **[必需]**

    用户账户的新描述。

- **timeout** (*Optional[float]*) -

    等待 RPC 完成的最长时间，单位为秒。

- **kwargs** (*Any*) -

    附加的请求上下文选项。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息，以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.update_user(
    user_name="alice",
    description="Analytics team",
)
```
