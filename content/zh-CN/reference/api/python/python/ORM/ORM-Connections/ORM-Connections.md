---
title: "Connections | Python | ORM"
slug: /python/python/ORM-Connections
sidebar_label: "Connections"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "一个 Connections 实例表示到您的 Zilliz Cloud 集群的连接池。 | Python | ORM"
type: docx
token: A96udk9seoF5x5xywQZcLasanIe
sidebar_position: 3
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - Connections
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Connections

一个 **Connections** 实例表示到您的 Zilliz Cloud 集群的连接池。

```python
class pymilvus.Connections
```

## 构造函数\{#constructor}

构造一个单例实例来管理所有连接。

<Admonition type="info" icon="📘" title="说明">

请不要自行创建此类的新实例，而应像下面的示例所示那样导入现有的单例实例。

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

<Admonition type="info" icon="📘" title="说明">

如何获取集群端点和访问令牌？

- **集群端点**

    您可以登录 [Zilliz Cloud](https://cloud.zilliz.com) 控制台，并在左侧导航栏中点击 **Clusters**。在集群列表中，点击目标集群名称，然后在 **Connect** 区域复制其端点。

- **访问令牌**

    要连接到 Zilliz Cloud 集群，您可以使用以下任一方式

    - API 密钥

        您可以登录 [Zilliz Cloud](https://cloud.zilliz.com) 控制台，并在左侧导航栏中点击 **API Keys**。

    - 用于访问集群的一组用户名和密码，并使用冒号（**:**）连接。

        您可以使用在 Zilliz Cloud 控制台创建集群时指定的集群凭据，或任何现有集群用户的凭据。

</Admonition>

## 方法\{#methods}

以下是 `connections` 单例实例的方法：
