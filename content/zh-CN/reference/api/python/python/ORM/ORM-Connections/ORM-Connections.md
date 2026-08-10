---
title: "Connections | Python | ORM"
slug: /python/python/ORM-Connections
sidebar_label: "Connections"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Connections 实例表示您的 Zilliz Cloud 集群的连接池。| Python | ORM"
type: docx
token: A96udk9seoF5x5xywQZcLasanIe
sidebar_position: 3
keywords: 
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - zilliz
  - zilliz cloud
  - 云
  - Connections
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Connections

**Connections** 实例表示您的 Zilliz Cloud 集群的连接池。

```python
class pymilvus.Connections
```

## 构造函数\{#constructor}

构造一个用于管理所有连接的单例实例。

<Admonition type="info" icon="📘" title="Notes">

您无需自行创建此类的新实例，而应按如下示例导入现有的单例实例。

</Admonition>

## 示例\{#examples}

```python
from pymilvus import connections    

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_TOKEN"

# Establish a connection
connections.connect(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
) 
```

<Admonition type="info" icon="📘" title="Note">

如何获取集群 Endpoint 和令牌？

- **集群 Endpoint**

    您可以登录 [Zilliz Cloud](https://cloud.zilliz.com) 控制台，然后在左侧导航栏中单击 **Clusters**。在集群列表中，单击目标集群的名称，并在 **Connect** 区域复制其 Endpoint。

- **访问令牌**

    要连接到 Zilliz Cloud 集群，您可以使用以下任一方式

    - API 密钥

        您可以登录 [Zilliz Cloud](https://cloud.zilliz.com) 控制台，然后在左侧导航栏中单击 **API Keys**。

    - 一组用于访问集群的用户名和密码，并使用冒号（**:**）连接。

        您可以使用在 Zilliz Cloud 控制台创建集群时指定的集群凭据，或任意现有集群用户的凭据。

</Admonition>

## 方法\{#methods}

以下是`connections`单例实例的方法：
