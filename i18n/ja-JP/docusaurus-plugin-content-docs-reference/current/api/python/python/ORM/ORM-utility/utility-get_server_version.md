---
title: "get_server_version() | Python | ORM"
slug: /python/python/utility-get_server_version
sidebar_label: "get_server_version()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は Zilliz Cloud クラスターのバージョンを確認します。 | Python | ORM"
type: docx
token: PoPkdkzSnofUihxzKLqcw7hYnrf
sidebar_position: 16
keywords: 
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - クラウド
  - get_server_version()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# get_server_version()

この操作は Zilliz Cloud クラスターのバージョンを確認します。

## リクエスト構文\{#request-syntax}

```python
get_server_version(
    using: str = "default",
    timeout: float | None
)
```

```python
from pymilvus import connections, utility

# Establish a connection
connections.connect(...)

# Check the server version
server_version = utility.get_server_version()
```

**パラメータ:**

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が返ってくるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*str*

**戻り値:**

サーバーのバージョン。

**例:**

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Check the server version
server_version = utility.get_server_version()
```

## 関連操作\{#related-operations}

次の操作は `get_server_version()` に関連しています。

- [get_server_type()](./utility-get_server_type)

