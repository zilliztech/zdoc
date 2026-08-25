---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取指定角色的描述信息及权限。 | Python | MilvusClient"
type: docx
token: TYczdPuSNoV9lExR8iCcNIg9nGe
sidebar_position: 5
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_role()

此操作用于获取指定角色的描述信息及权限。

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
  **[必填]**<br/>
  待查询角色的名称。

- **timeout** (*Optional[float]*) -<br/>
  默认值：`None`<br/>
  等待 RPC 完成的最大时长（秒）。

- **kwargs** (*Any*) -<br/>
  额外的请求上下文选项。

**返回类型：**

*dict*

**返回值：**

包含角色、描述及权限信息的字典。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以了解具体的失败原因。

## 示例\{#examples}

演示 describe_role 的用法。

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
