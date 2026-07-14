---
title: "get_server_type() | Python | ORM"
slug: /python/python/utility-get_server_type
sidebar_label: "get_server_type()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は Zilliz Cloud クラスターのタイプを確認します。 | Python | ORM"
type: docx
token: UOIddRBUXotHvyx4Yyocer0mnId
sidebar_position: 15
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - get_server_type()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_server_type()

この操作は Zilliz Cloud クラスターのタイプを確認します。

## リクエスト構文\{#request-syntax}

```python
get_server_type(
    using: str = "default",
)
```

**パラメータ:**

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

**戻り値の型:**

*str*

**戻り値:**
サーバータイプ。指定可能な値は次のとおりです。

- **zilliz**

    現在のサーバーが Zilliz Cloud クラスターであることを示します。

- **milvus**

    現在のサーバーが Milvus インスタンスであることを示します。

**例:**

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Check the server type
server_type = utility.get_server_type()
```

## 関連する操作\{#related-operations}

以下の操作は `get_server_type()` に関連しています。

- [get_server_version()](./utility-get_server_version)

