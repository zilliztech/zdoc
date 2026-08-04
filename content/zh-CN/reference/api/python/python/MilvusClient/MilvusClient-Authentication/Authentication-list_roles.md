---
title: "list_roles() | Python | MilvusClient"
slug: /python/python/Authentication-list_roles
sidebar_label: "list_roles()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有自定义角色。 | Python | MilvusClient"
type: docx
token: MApVdDl17oU8OixzbMPcgceKnOh
sidebar_position: 14
keywords: 
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
  - zilliz
  - zilliz cloud
  - cloud
  - list_roles()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_roles()

此操作列出所有自定义角色。

## 请求语法\{#request-syntax}

```python
list_roles(
    timeout: Optional[float] = None
) -> dict
```

**参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回类型：**

*list*

**返回：**

角色名称列表。

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

# 2. List all roles
client.list_roles()

# ['db_admin', 'db_ro', 'db_rw']
```

<Admonition type="info" icon="📘" title="说明">

每个 Zilliz Cloud 集群都有三个内置角色，即 **db\_ro**、**db\_rw** 和 **db\_admin**。详情请参见 [集群内置角色](/docs/cluster-roles#built-in-cluster-roles)。

</Admonition>

