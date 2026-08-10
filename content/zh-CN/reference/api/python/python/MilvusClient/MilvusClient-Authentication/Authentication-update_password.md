---
title: "update_password() | Python | MilvusClient"
slug: /python/python/Authentication-update_password
sidebar_label: "update_password()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "更新用户凭证/description-related签名行为。异步版本与同步方法共享相同的参数和响应约定。 | Python | MilvusClient"
type: docx
token: Q8QIdA1DioRRL9xUtlgcCPLHnPc
sidebar_position: 20
keywords: 
  - Agentic RAG
  - rag llm 架构
  - 私有 llms
  - nn 搜索
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

更新用户凭证/description-related签名行为。异步版本与同步方法共享相同的参数和响应约定。

## 请求语法\{#request-syntax}

```python
update_password(
    user_name: str,
    old_password: str,
    new_password: str,
    reset_connection: Optional[bool] = False,
    timeout: Optional[float] = None,
    description: Optional[str] = None,
    **kwargs,
) -> None
```

**参数：**

- **user_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  要更改密码的用户名。

- **old_password** (*str*) -<br/>
  **[REQUIRED]**<br/>
  用户的当前密码。

- **new_password** (*str*) -<br/>
  **[REQUIRED]**<br/>
  用户的新密码。

- **reset_connection** (*Optional[bool]*) -<br/>
  默认值：`False`<br/>
  更新后使用新密码重新连接客户端的标志。

- **timeout** (*Optional[float]*) -<br/>
  默认值：`None`<br/>
  等待 RPC 完成的最长时间，单位为秒。

- **description** (*Optional[str]*) -<br/>
  默认值：`None`<br/>
  用户账户的可选更新描述。

- **kwargs** (*Any*) -<br/>
  附加请求上下文选项。

**返回类型：**

*None*

**返回值：**

密码成功更新后，不返回任何值。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败详情。

## 示例\{#examples}

演示 update password 的用法。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")
client.create_user("analyst", "Milvus123", description="Analytics account")
client.update_user("analyst", description="Updated analytics account")
client.create_role("read_only", description="Read-only role")
client.alter_role("read_only", description="Updated read-only role")
print(client.describe_user("analyst"))
print(client.describe_role("read_only"))
```
