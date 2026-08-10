---
title: "list_connections() | Python | ORM"
slug: /python/python/Connections-list_connections
sidebar_label: "list_connections()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回所有连接名称和处理程序对象的列表。 | Python | ORM"
type: docx
token: DyPldeRNXo4nMqxQeE0cMnd2nEf
sidebar_position: 7
keywords: 
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - 云
  - list_connections()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_connections()

此操作返回所有连接名称和处理程序对象的列表。

## 请求语法\{#request-syntax}

```python
list_connections()
```

**参数：**

无

**返回类型：**

*List*

**返回值：**

所有连接名称和处理程序对象的列表。

**异常：**

无

## 示例\{#examples}

```python
from pymilvus import connections

connections.connect(
    uri='https://in01-**************.aws-us-west-2.vectordb-uat3.zillizcloud.com:19531',
    token='admin:zilliz@123'
)
connections.list_connections()

# Output
# [('default', <pymilvus.client.grpc_handler.GrpcHandler at 0x14713b940>)]
```

## 相关操作\{#related-operations}

以下操作与 `list_connections()` 相关：

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [remove_connection()](./Connections-remove_connection)

