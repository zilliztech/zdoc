---
title: "AsyncMilvusClient | Python | MilvusClient"
slug: /python/python/Client-AsyncMilvusClient
sidebar_label: "AsyncMilvusClient"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "AsyncMilvusClient 实例表示一个连接到特定 Zilliz Cloud 集群的异步 Python 客户端。它提供与 MilvusClient 相同的参数集和行为，唯一的区别在于调用它们的方式。 | Python | MilvusClient"
type: docx
token: MIKkdpGuuoEaGWx1m7Fcw52inKg
sidebar_position: 3
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - AsyncMilvusClient
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AsyncMilvusClient

**AsyncMilvusClient** 实例表示一个连接到特定 Zilliz Cloud 集群的异步 Python 客户端。它提供与 **[MilvusClient](./Client-MilvusClient)** 相同的参数集和行为，唯一的区别在于调用它们的方式。

```python
pymilvus.AsyncMilvusClient
```

## Constructor\{#constructor}

为常见使用场景构造一个客户端。

<Admonition type="info" icon="📘" title="说明">

- 此接口仍处于早期阶段，未来版本中可能会有较大变动。建议不要在生产环境中使用。

- 要调用 **AsyncMilvusClient**，您需要从 asyncio 获取一个事件循环来管理请求处理。详情请参见 [教程：结合 asyncio 使用 AsyncMilvusClient](https://milvus.io/docs/use-async-milvus-client-with-asyncio.md#Tutorial-Use-AsyncMilvusClient-with-asyncio)。

</Admonition>

```python
AsyncMilvusClient(
    uri: str,
    user: str,
    password: str,
    db_name: str,
    token: str,
    timeout=None,
    **kwargs
)
```

**参数：**

- **uri** (*string*) -

    Zilliz Cloud 集群的 URI。例如：

    - **集群端点**

        - **Free & Serverless**

            `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

        - **Dedicated**

            `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

    - **项目端点（按需）**

        `https://{project-id}.{region}.api.zillizcloud.com`

- **user** (*string*) -

    用于连接指定 Zilliz Cloud 集群的有效用户名。

    应与 **password** 搭配使用。

- **password** (*string*) -

    用于连接指定 Zilliz Cloud 集群的有效密码。

    应与 **user** 搭配使用。

- **db_name** (*string*) -

    目标 Milvus 实例所属数据库的名称。

- **token** (*string*) -

    用于访问指定 Zilliz Cloud 集群的有效访问令牌。

    可作为分别设置 **user** 和 **password** 的推荐替代方式。

    设置此字段时，请注意：

    有效的 token 可以是以下任一形式：

    - 具有足够权限的 [API key](/docs/manage-api-keys)，或者

    - 用于访问目标集群的一组 [username and password ](/docs/cluster-credentials)，并通过冒号 (:) 连接。例如，您可以将其设置为 `username:p@ssw0rd`。这仅适用于使用集群端点的情况。

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将其设置为 **None** 表示该操作会在收到任意响应或发生任意错误时超时。

## Examples\{#examples}

```python
import asyncio
from pymilvus import MilvusClient

# Get an event loop from asyncio
loop = asyncio.get_event_loop()

# Authentication enabled with a cluster user
client = AsyncMilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token,
    db_name="default"
)
```

<Admonition type="info" icon="📘" title="说明">

请将 **uri** 设置为您的集群端点。**token** 参数可以是具有足够权限的 Zilliz Cloud API key，也可以是格式为 `username:p@ssw0rd` 的集群用户凭据。

</Admonition>

