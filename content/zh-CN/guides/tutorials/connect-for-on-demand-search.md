---
title: "连接按需搜索 | Cloud"
slug: /connect-for-on-demand-search
sidebar_label: "连接按需搜索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "如果要通过按需集群提供的计算资源运行按需搜索或查询工作负载，请使用项目 endpoint。 | Cloud"
type: origin
token: Mj2bw4KFYikkOJkLCOtcDQn0nph
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 连接按需搜索

如果要通过按需集群提供的计算资源运行按需搜索或查询工作负载，请使用项目 endpoint。

<Admonition type="info" icon="📘" title="注意">

本文介绍如何连接用于按需搜索的项目 endpoint。如果要连接 Free、Serverless 或 Dedicated Serving 集群，请参见 [连接到 Serving 集群](./connect-to-serving-cluster)。

</Admonition>

## Endpoint 格式\{#endpoint}

| Endpoint 类型 | Endpoint 格式 | 适用场景 |
| --- | --- | --- |
| 项目 endpoint | `https://{project-id}.{region}.api.zillizcloud.com` | 通过按需集群执行数据导入、批量搜索、查询、get、search 和 hybrid search。 |

## 开始前\{#}

- 从 Zilliz Cloud 控制台获取项目 endpoint。

- 获取用于为搜索工作负载提供计算资源的按需集群 ID。

- 创建具备项目和目标数据所需权限的 API key。

- 根据使用场景安装 Milvus SDK。详情请参考 Install SDKs。

## 连接到项目 Endpoint\{#endpoint}

使用项目 endpoint 创建 `MilvusClient`，并指定用于处理请求的按需集群。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    cluster="inxx-xxxxxxxxxxxxxxx",
    token="YOUR_API_KEY",
)
```

## 创建搜索 Session\{#session}

使用 session 对象将后续操作绑定到按需集群。

```python
session = client.session(cluster_id="inxx-xxxxxxxxxxxxxxx")
```

随后可以通过该 session 执行 `query`、`get`、`search` 和 `hybrid_search` 等 DQL 操作。

```python
results = session.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="vector",
    limit=10,
)

print(results)
```

## 认证\{#}

连接项目 endpoint 时，请使用有效的 API key 作为认证 token。

`username:password` 格式的集群凭证适用于 Serving 集群 endpoint。通过项目 endpoint 进行按需搜索时，请使用具备所需项目权限的 API key。

## 何时使用此连接方式\{#}

项目 endpoint 适用于批处理、探索、验证、实验，以及其他更适合使用按需计算而非常驻服务的工作负载。

对于需要完整 Collection API 和常驻低延迟服务的生产应用，请连接 Free、Serverless 或 Dedicated Serving 集群。Serving 集群的 endpoint 格式和连接示例，请参见 [连接到 Serving 集群](./connect-to-serving-cluster)。