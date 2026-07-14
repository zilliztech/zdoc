---
title: "remove_connection() | Python | ORM"
slug: /python/python/Connections-remove_connection
sidebar_label: "remove_connection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された alias によってレジストリから接続を削除し、接続されている場合は切断します。 | Python | ORM"
type: docx
token: L4KSdOVTEotaiyxjTddcVRDhn3E
sidebar_position: 8
keywords: 
  - vector db とは
  - vector databases とは
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - remove_connection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_connection()

この操作は、指定された alias によってレジストリから接続を削除し、接続されている場合は切断します。

## リクエスト構文\{#request-syntax}

```python
remove_connection(alias: str)
```

**パラメーター:**

- **alias** (*string*) -

    **[必須]**

    接続 alias

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **ConnectionConfigException**

    接続設定が無効な場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections

connections.remove_connection(alias="default")
```

## 関連操作\{#related-operations}

以下の操作は `remove_connection()` に関連しています。

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

