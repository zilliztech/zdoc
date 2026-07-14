---
title: "get_connection_addr() | Python | ORM"
slug: /python/python/Connections-get_connection_addr
sidebar_label: "get_connection_addr()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、エイリアスによって指定された接続の構成を取得します。 | Python | ORM"
type: docx
token: H2zBdRHVtovNQGxvb0xcwpSKnBd
sidebar_position: 5
keywords: 
  - knn
  - 画像検索
  - LLMs
  - 機械学習
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

この操作は、エイリアスによって指定された接続の構成を取得します。

## リクエスト構文\{#request-syntax}

```python
get_connection_addr(alias: str)
```

**パラメーター:**

- **alias** (*string*) -

    **[必須]**

    接続エイリアス。

**戻り値の型:**

*Dictionary*

**戻り値:**

接続構成を含む辞書。

**例外:**

- **ConnectionConfigException**

    接続構成が無効な場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections

connections.get_connection_addr(alias="default")

# Output
# {'address': 'in03-**************.api.gcp-us-west1.cloud.zilliz.com:443', 'user': ''}
```

## 関連操作\{#related-operations}

以下の操作は `get_connection_addr()` に関連しています。

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

