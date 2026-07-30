---
title: "has_connection() | Python | ORM"
slug: /python/python/Connections-has_connection
sidebar_label: "has_connection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检查是否已建立具有给定别名的连接。 | Python | ORM"
type: docx
token: XeZwdeK64oGD8rx9DA3ciqNinnh
sidebar_position: 6
keywords: 
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - has_connection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_connection()

此操作检查是否已建立具有给定别名的连接。

## 请求语法\{#request-syntax}

```python
has_connection(alias: str)
```

**参数：**

- **alias** (*string*) -

    **[必需]**

    连接别名。

**返回类型：**

*Boolean*

**返回：**

一个 Boolean 值，表示该连接是否存在。

<Admonition type="info" icon="📘" title="说明">

现有的连接别名并不一定表示相应的连接已经建立。

仅当连接别名存在且相应连接已建立时，此操作才会返回 **True**。

</Admonition>

**异常：**

- **ConnectionConfigException**

    当连接配置无效时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections

connections.has_connection(alias="default")

# Output
# True
```

## 相关操作\{#related-operations}

以下操作与 `has_connection()` 相关：

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

