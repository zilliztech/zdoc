---
title: "add_connection() | Python | ORM"
slug: /python/python/Connections-add_connection
sidebar_label: "add_connection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作以批量方式向多个不同用途的 Zilliz Cloud 集群添加连接。 | Python | ORM"
type: docx
token: C37ldNLbFog6ThxA23ScMldnnmb
sidebar_position: 1
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - add_connection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_connection()

此操作以批量方式向多个不同用途的 Zilliz Cloud 集群添加 [connections](./ORM-Connections)。

## 请求语法\{#request-syntax}

```python
add_connection(
    default: dict,
    # add other connections
    # your_conn_name: dict
)
```

**参数：**

- **kwargs** - 

    传递关键字参数时，每个参数的名称都会作为 **connect()** 方法中的连接别名。

    参数值应为包含以下一个或多个字段的字典：

    - **address** (*string*) -

        要连接的实际地址。地址示例：**YOUR_CLUSTER_ENDPOINT**。

    - **uri** (*string*) -

        Zilliz Cloud 集群的 URI。例如：**`https://in01-&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540`**。

    - **host** (*string*) -

        Zilliz Cloud 集群的主机。该值默认为 **localhost**，如果仅提供 **port**，PyMilvus 将填充默认主机。

    - **port** (*string | int*) -

        Zilliz Cloud 集群监听的端口。该值默认为 **19530**，如果仅提供 **host**，PyMilvus 将填充默认端口。

    - **user** (*string*) -

        用于连接到指定 Zilliz Cloud 集群的有效用户名。

        应与 **password** 一起使用。

    - **password** (*string*) -

        用于连接到指定 Zilliz Cloud 集群的有效密码。

        应与 **user** 一起使用。

    - **token** (string) -

        用于访问指定 Zilliz Cloud 集群的有效访问令牌。可作为分别设置 **user** 和 **password** 的替代方案。

        设置此字段时，请注意：

        有效的 token 必须是以下之一：

        - 具有足够权限的 API key，或

        - 用于访问目标集群的一组用户名和密码，并使用冒号 (:) 连接。例如，可以将其设置为 `username:p@ssw0rd`。

<Admonition type="info" icon="📘" title="说明">

如何获取集群 endpoint 和 token？

- **集群 endpoint**

    您可以登录 [Zilliz Cloud](https://cloud.zilliz.com) 控制台，然后在左侧导航栏中单击 **Clusters**。在集群列表中，单击目标集群的名称，在 **Connect** 区域复制其 endpoint，并将其用作上述 URI。

- **访问 token**

    要连接到 Zilliz Cloud 集群，您可以使用以下任一方式：

    - API key

        您可以登录 [Zilliz Cloud](https://cloud.zilliz.com) 控制台，然后在左侧导航栏中单击 **API Keys**。

    - 一组用于访问集群的用户名和密码，并使用冒号（**:**）连接。

        您可以使用在 Zilliz Cloud 控制台中创建集群时指定的集群凭据，或任何现有集群用户的凭据。

</Admonition>

**返回类型：**

None

**返回：**

None

**异常：**

- **ConnectionConfigException**

    当连接配置无效时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections

SERVERLESS_ENDPOINT = "https://in03-************.api.gcp-us-west1.zillizcloud.com"
SERVERLESS_TOKEN = "db_admin:************"
DEDICATED_ENDPOINT = "https://in03-************.api.gcp-us-west1.zillizcloud.com:19541"
DEDICATED_USER = "db_admin"
DEDICATED_PASS = "*****************"

connections.add_connection(
  serverless={"uri": SERVERLESS_ENDPOINT, "token": SERVERLESS_TOKEN},
  dedicated={"uri": DEDICATED_ENDPOINT, "user": DEDICATED_USER, "password": DEDICATED_PASS}
)
```

## 相关操作\{#related-operations}

以下操作与 `add_connection()` 相关：

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

