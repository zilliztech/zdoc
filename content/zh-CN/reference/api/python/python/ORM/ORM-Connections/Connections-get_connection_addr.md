---
title: "get_connection_addr() | Python | ORM"
slug: /python/python/Connections-get_connection_addr
sidebar_label: "get_connection_addr()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过别名检索指定连接的配置。 | Python | ORM"
type: docx
token: H2zBdRHVtovNQGxvb0xcwpSKnBd
sidebar_position: 5
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - get_connection_addr()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_connection_addr()

此操作通过别名检索指定连接的配置。

## 请求语法\{#request-syntax}

```python
get_connection_addr(alias: str)
```

**参数：**

- **alias** (*string*) -

    **[REQUIRED]**

    连接别名。

**返回类型：**

*Dictionary*

**返回：**

包含连接配置的字典。

**异常：**

- **ConnectionConfigException**

    当连接配置无效时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections

connections.get_connection_addr(alias="default")

# Output
# {'address': 'in03-**************.api.gcp-us-west1.cloud.zilliz.com:443', 'user': ''}
```

## 相关操作\{#related-operations}

以下操作与 `get_connection_addr()` 相关：

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

