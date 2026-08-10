---
title: "get_server_version() | Python | ORM"
slug: /python/python/utility-get_server_version
sidebar_label: "get_server_version()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于检查 Zilliz Cloud 集群的版本。 | Python | ORM"
type: docx
token: PoPkdkzSnofUihxzKLqcw7hYnrf
sidebar_position: 16
keywords: 
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - get_server_version()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# get_server_version()

此操作用于检查 Zilliz Cloud 集群的版本。

## 请求语法\{#request-syntax}

```python
get_server_version(
    using: str = "default",
    timeout: float | None
)
```

```python
from pymilvus import connections, utility

# Establish a connection
connections.connect(...)

# Check the server version
server_version = utility.get_server_version()
```

**参数：**

- **using** (*str*) - 

    所用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作才会超时。

**返回类型：**

*str*

**返回值：**

服务器版本。

**示例：**

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Check the server version
server_version = utility.get_server_version()
```

## 相关操作\{#related-operations}

以下操作与 `get_server_version()` 相关：

- [get_server_type()](./utility-get_server_type)

