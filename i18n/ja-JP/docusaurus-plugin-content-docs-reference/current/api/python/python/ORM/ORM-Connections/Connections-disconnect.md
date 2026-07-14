---
title: "disconnect() | Python | ORM"
slug: /python/python/Connections-disconnect
sidebar_label: "disconnect()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された接続からクライアントを切断します。 | Python | ORM"
type: docx
token: IpSBdcabbosobvxQkAEcv6CvnJd
sidebar_position: 4
keywords: 
  - Milvus はどのように動作するか
  - Zilliz vector database
  - Zilliz database
  - 非構造化データ
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

この操作は、指定された接続からクライアントを切断します。

## リクエスト構文\{#request-syntax}

```python
disconnect(alias: str)
```

**パラメーター:**

- **alias** (*string*) -

    **[必須]**

    接続エイリアス。

**戻り値の型:**

None

**戻り値:**

None

**例外:**

- **ConnectionConfigException**

    接続設定が無効な場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections

connections.disconnect(alias="default")
```

## 関連する操作\{#related-operations}

以下の操作は `disconnect()` に関連しています。

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

