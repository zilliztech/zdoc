---
title: "session() | Python | MilvusClient"
slug: /python/python/Client-session
sidebar_label: "session()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作创建一个绑定到特定按需集群的轻量级 DQL 会话。通过该会话执行的所有操作都会自动包含目标 `clusterid`，确保请求在多集群部署中路由到正确的集群。 | Python | MilvusClient"
type: docx
token: UASmdlcqvojCe4xNY94cz9Wznyh
sidebar_position: 4
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - session()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# session()

此操作创建一个绑定到特定按需集群的轻量级 DQL 会话。通过该会话执行的所有操作都会自动包含目标 `cluster_id`，确保请求在多集群部署中路由到正确的集群。

## 请求语法\{#request-syntax}

```python
MilvusClient.session(
```

**参数：**

- **cluster_id** （*str*） -

    **[必需]**

    目标按需集群的标识符。该值必须是非空字符串。

**返回类型：**

*MilvusClientSession*

**返回：**

一个会话对象，用于将 search、query 和 get 操作代理到指定的按需集群。

**异常：**

- **ParamError**

    当 `cluster_id` 不是字符串或为空时抛出。当 `cluster_id` 不是字符串或为空时抛出。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{proj-xxxxxxxx}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY"
)

# Create a session pinned to cluster-1
session = client.session(
    cluster_id="my_on_demand"
)

# All operations through this session automatically target my_on_demand
results = session.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    limit=5
)

# Session supports search, hybrid_search, query, query_iterator,
# search_iterator, and get
entities = session.get(
    collection_name="my_collection",
    ids=[1, 2, 3]
)
```

<Admonition type="info" title="Notes">

此方法仅适用于按需计算。请使用项目 Endpoint 创建 `MilvusClient`，例如 `https://{project-id}.{region}.api.zillizcloud.com`，并将目标按需集群 ID 传给 `session()`。

</Admonition>
