---
title: "alter_role() | Python | MilvusClient"
slug: /python/python/Authentication-alter_role
sidebar_label: "alter_role()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更改现有角色的描述。 | Python | MilvusClient"
type: docx
token: Nz26dTDqnoSqmhxRRK5cUNVunQd
sidebar_position: 21
keywords: 
  - 深度学习
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - Zilliz
  - Zilliz Cloud
  - 云
  - alter_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# alter_role()

此操作会更改现有角色的描述。

## 请求语法\{#request-syntax}

```python
alter_role(
    role_name: str,
    description: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**参数：**

- **role_name** （*str*）-

    **[必需]**

    要更新的角色名称。

- **description** （*str*）-

    **[必需]**

    该角色的新描述。

- **timeout** （*Optional[float]*）-

    等待 RPC 完成的最长时间，单位为秒。

- **kwargs** （*Any*）-

    其他请求上下文选项。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息以了解确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.alter_role(
    role_name="reader",
    description="Read-only access to collections",
)
```
