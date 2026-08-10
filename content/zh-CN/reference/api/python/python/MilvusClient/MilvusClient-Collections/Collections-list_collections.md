---
title: "list_collections() | Python | MilvusClient"
slug: /python/python/Collections-list_collections
sidebar_label: "list_collections()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有现有 Collection。 | Python | MilvusClient"
type: docx
token: BHyidrVcyoPwxexHLrnceOSAnRe
sidebar_position: 17
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - zilliz
  - zilliz cloud
  - 云
  - list_collections()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_collections()

此操作会列出所有现有 Collection。

<Admonition type="info" icon="📘" title="Notes">

此方法适用于 Dedicated 服务集群和按需计算。

- 对于服务集群中的 Collection，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Collection，请使用项目 Endpoints 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
list_collections(**kwargs) -> Name
```

**参数：**

- **kwargs** -

    - **timeout** (*float* | *None*) -

        此操作的超时时长。

        将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

**返回类型：**

*list*

**返回：**

Collection 名称列表。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. List collections
client.list_collections() 

# ['test_collection']
```

