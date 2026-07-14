---
title: "list_connections() | Python | ORM"
slug: /python/python/Connections-list_connections
sidebar_label: "list_connections()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべての接続名とハンドラーオブジェクトのリストを返します。 | Python | ORM"
type: docx
token: DyPldeRNXo4nMqxQeE0cMnd2nEf
sidebar_position: 7
keywords: 
  - ハイブリッド検索
  - 語彙検索
  - 最近傍探索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - list_connections()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_connections()

この操作は、すべての接続名とハンドラーオブジェクトのリストを返します。

## リクエスト構文\{#request-syntax}

```python
list_connections()
```

**PARAMETERS:**

なし

**RETURN TYPE:**

*List*

**RETURNS:**

すべての接続名とハンドラーオブジェクトのリスト。

**EXCEPTIONS:**

なし

## 例\{#examples}

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

## 関連操作\{#related-operations}

以下の操作は `list_connections()` に関連しています。

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [remove_connection()](./Connections-remove_connection)

