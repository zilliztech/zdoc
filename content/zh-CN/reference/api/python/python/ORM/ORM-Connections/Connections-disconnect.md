---
title: "disconnect() | Python | ORM"
slug: /python/python/Connections-disconnect
sidebar_label: "disconnect()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将客户端与指定连接断开。 | Python | ORM"
type: docx
token: IpSBdcabbosobvxQkAEcv6CvnJd
sidebar_position: 4
keywords: 
  - milvus 的工作原理
  - Zilliz 向量数据库
  - Zilliz 数据库
  - 非结构化数据
  - zilliz
  - zilliz cloud
  - cloud
  - disconnect()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# disconnect()

此操作将客户端与指定连接断开。

## 请求语法\{#request-syntax}

```python
disconnect(alias: str)
```

**参数：**

- **alias** (*string*) -

    **[必需]**

    连接别名。

**返回类型：**

None

**返回值：**

None

**异常：**

- **ConnectionConfigException**

    当连接配置无效时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections

connections.disconnect(alias="default")
```

## 相关操作\{#related-operations}

以下操作与 `disconnect()` 相关：

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

