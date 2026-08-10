---
title: "MilvusClient | Python | MilvusClient"
slug: /python/python/Client-MilvusClient
sidebar_label: "MilvusClient"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "MilvusClient 实例表示一个连接到特定 Zilliz Cloud 集群的 Python 客户端。 | Python | MilvusClient"
type: docx
token: SojTdgw1joOuA8xMzb5cMUFYnce
sidebar_position: 2
keywords: 
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - zilliz
  - zilliz cloud
  - 云
  - MilvusClient
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClient

**MilvusClient** 实例表示一个连接到特定 Zilliz Cloud 集群的 Python 客户端。

```python
pymilvus.MilvusClient
```

## 构造函数\{#constructor}

为常见用例构造一个客户端。

<Admonition type="info" icon="📘" title="Notes">

该客户端可作为当前 API 集的易用替代方案，用于处理 Zilliz Cloud 上的创建、读取、更新和删除（CRUD）操作。

</Admonition>

```python
MilvusClient(
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

    这可以作为分别设置 **user** 和 **password** 的推荐替代方式。

    设置此字段时，请注意：

    有效 token 应为以下两者之一

    - 具有足够权限的 [API](/docs/manage-api-keys)[ key](/docs/manage-api-keys)，或

    - 用于访问目标集群的一组 [用户名和密码 ](/docs/cluster-credentials)，并以冒号（:）连接。例如，您可以将其设置为 `username:p@ssw0rd`。这仅适用于使用集群 Endpoint 时。

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将其设置为 **None** 表示，当收到任何响应或发生任何错误时，此操作才会超时。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# Authentication enabled with a cluster user
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token,
    db_name="default"
)
```

<Admonition type="info" icon="📘" title="Notes">

将 **uri** 设置为您的集群 Endpoint。**token** 参数可以是具有足够权限的 Zilliz Cloud API key，也可以是格式为 `username:p@ssw0rd` 的集群用户凭据。

</Admonition>

