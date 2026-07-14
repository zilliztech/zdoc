---
title: "has_connection() | Python | ORM"
slug: /python/python/Connections-has_connection
sidebar_label: "has_connection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたエイリアスを持つ接続がすでに確立されているかどうかを確認します。 | Python | ORM"
type: docx
token: XeZwdeK64oGD8rx9DA3ciqNinnh
sidebar_position: 6
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
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

この操作は、指定されたエイリアスを持つ接続がすでに確立されているかどうかを確認します。

## リクエスト構文\{#request-syntax}

```python
has_connection(alias: str)
```

**パラメーター:**

- **alias** (*string*) -

    **[必須]**

    接続エイリアス。

**戻り値の型:**

*Boolean*

**戻り値:**

接続が存在するかどうかを示す Boolean 値。

<Admonition type="info" icon="📘" title="注意">

既存の接続エイリアスがあることは、対応する接続が確立されていることを必ずしも意味しません。

この操作が **True** と評価されるのは、接続エイリアスが存在し、かつ対応する接続が確立されている場合のみです。

</Admonition>

**例外:**

- **ConnectionConfigException**

    接続構成が無効な場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections

connections.has_connection(alias="default")

# Output
# True
```

## 関連操作\{#related-operations}

次の操作は `has_connection()` に関連しています。

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

