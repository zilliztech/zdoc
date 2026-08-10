---
title: "AsyncMilvusClient | Python | MilvusClient"
slug: /python/python/Client-AsyncMilvusClient
sidebar_label: "AsyncMilvusClient"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "AsyncMilvusClient 实例表示一个异步 Python 客户端，用于连接到特定的 Zilliz Cloud 集群。它提供与 MilvusClient 相同的参数集和行为，唯一的区别在于调用方式。 | Python | MilvusClient"
type: docx
token: MIKkdpGuuoEaGWx1m7Fcw52inKg
sidebar_position: 3
keywords: 
  - 语义搜索
  - 异常检测
  - sentence transformers
  - 推荐系统
  - zilliz
  - zilliz cloud
  - 云
  - AsyncMilvusClient
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AsyncMilvusClient

**AsyncMilvusClient** 实例表示一个异步 Python 客户端，用于连接到特定的 Zilliz Cloud 集群。它提供与 **[MilvusClient](./Client-MilvusClient)** 相同的参数集和行为，唯一的区别在于调用方式。

```python
pymilvus.AsyncMilvusClient
```

## 构造函数\{#constructor}

为常见用例构造客户端。

<Admonition type="info" icon="📘" title="Notes">

- 此接口仍处于早期阶段，未来版本中可能会有较大变动。建议您不要在生产环境中使用它。

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

    - **集群 Endpoint**

        - **Free & Serverless**

            `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

        - **Dedicated**

            `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

    - **项目 Endpoint（按需）**

        `https://{project-id}.{region}.api.zillizcloud.com`

- **user** (*string*) -

    用于连接指定 Zilliz Cloud 集群的有效用户名。

    应与 **password** 一起使用。

- **password** (*string*) -

    用于连接指定 Zilliz Cloud 集群的有效密码。

    应与 **user** 一起使用。

- **db_name** (*string*) -

    目标 Milvus 实例所属的 Database 名称。

- **token** (*string*) -

    用于访问指定 Zilliz Cloud 集群的有效访问令牌。

    这可作为分别设置 **user** 和 **password** 的推荐替代方式。

    设置此字段时，请注意：

    有效的 token 应为以下任一形式：

    - 具有足够权限的 [API 密钥](/docs/manage-api-keys)，或

    - 一组用于访问目标集群的 [用户名和密码](/docs/cluster-credentials)，通过冒号（:）连接而成。例如，您可以将其设置为 `username:p@ssw0rd`。这仅在您使用集群 Endpoint 时适用。

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将此项设置为 **None** 表示当收到任何响应或发生任何错误时，此操作才会超时。

## 示例\{#examples}

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

<Admonition type="info" icon="📘" title="Notes">

将 **uri** 设置为您的集群 Endpoint。**token** 参数可以是具有足够权限的 Zilliz Cloud API 密钥，也可以是格式为 `username:p@ssw0rd` 的集群用户凭据。

</Admonition>

