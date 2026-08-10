---
title: "get_server_type() | Python | ORM"
slug: /python/python/utility-get_server_type
sidebar_label: "get_server_type()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于检查 Zilliz Cloud 集群的类型。 | Python | ORM"
type: docx
token: UOIddRBUXotHvyx4Yyocer0mnId
sidebar_position: 15
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - llm 幻觉
  - 多模态搜索
  - zilliz
  - zilliz cloud
  - 云
  - get_server_type()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_server_type()

此操作用于检查 Zilliz Cloud 集群的类型。

## 请求语法\{#request-syntax}

```python
get_server_type(
    using: str = "default",
)
```

**参数：**

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

**返回类型：**

*str*

**返回值：**
服务器类型。可能的值如下：

- **zilliz**

    表示当前服务器是 Zilliz Cloud 集群。

- **milvus**

    表示当前服务器是一个 Milvus 实例。

**示例：**

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Check the server type
server_type = utility.get_server_type()
```

## 相关操作\{#related-operations}

以下操作与 `get_server_type()` 相关：

- [get_server_version()](./utility-get_server_version)

