---
title: "grant_role() | Python | MilvusClient"
slug: /python/python/Authentication-grant_role
sidebar_label: "grant_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为用户授予角色。 | Python | MilvusClient"
type: docx
token: DsnpdZuDGo77TYxFuYvcDpOgnIf
sidebar_position: 12
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - grant_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# grant_role()

此操作为用户授予角色。

## 请求语法\{#request-syntax}

```python
grant_role(
    user_name: str,
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

**参数：**

- **user_name** (*str*) -

    **[必需]**

    现有用户的名称。

- **role_name** (*str*) -

    **[必需]**

    要分配的角色名称。

- **timeout** (*float* | *None*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

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

# 2. Grant the role to the user
client.grant_role(user_name="user_1", role_name="db_ro")
```

<Admonition type="info" icon="📘" title="说明">

每个 Zilliz Cloud 集群都有三个内置角色，即 **db\_ro**、**db\_rw** 和 **db\_admin**。详情请参见 [集群内置角色](/docs/cluster-roles#built-in-cluster-roles)。

</Admonition>

