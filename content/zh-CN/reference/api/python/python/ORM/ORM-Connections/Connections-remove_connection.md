---
title: "remove_connection() | Python | ORM"
slug: /python/python/Connections-remove_connection
sidebar_label: "remove_connection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作根据给定别名从注册表中移除连接，并在已连接时断开连接。 | Python | ORM"
type: docx
token: L4KSdOVTEotaiyxjTddcVRDhn3E
sidebar_position: 8
keywords: 
  - 什么是向量数据库
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - zilliz
  - zilliz cloud
  - 云
  - remove_connection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_connection()

此操作根据给定别名从注册表中移除连接，并在已连接时断开连接。

## 请求语法\{#request-syntax}

```python
remove_connection(alias: str)
```

**参数：**

- **alias** (*string*) -

    **[必填]**

    连接别名

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **ConnectionConfigException**

    当连接配置无效时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections

connections.remove_connection(alias="default")
```

## 相关操作\{#related-operations}

以下操作与 `remove_connection()` 相关：

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

