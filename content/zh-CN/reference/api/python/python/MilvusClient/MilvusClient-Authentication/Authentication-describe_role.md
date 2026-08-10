---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "响应现可公开角色描述。异步变体与同步方法共享参数和响应约定。中间包装字段已转换为公开的 describerole() 响应字典。 | Python | MilvusClient"
type: docx
token: TYczdPuSNoV9lExR8iCcNIg9nGe
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

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_role()

响应现已包含角色描述。异步变体与同步方法共享参数和响应约定。中间包装字段已转换为公开的 describe_role() 响应字典。

## 请求语法\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> dict
```

**参数：**

- **role_name** (*str*) -<br/>
  **[必需]**<br/>
  要描述的角色名称。

- **timeout** (*Optional[float]*) -<br/>
  默认值：`None`<br/>
  等待 RPC 完成的最长时间（以秒为单位）。

- **kwargs** (*Any*) -<br/>
  附加的请求上下文选项。

**返回类型：**

*dict*

**返回值：**

包含角色、描述和权限的字典。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败详情。

## 示例\{#examples}

演示 describe role 的用法。

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
