---
title: "using_database() | Python | ORM"
slug: /python/python/db-using_database
sidebar_label: "using_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の接続のデフォルトとしてデータベースを設定します。 | Python | ORM"
type: docx
token: GXXTd7JIgoUKhzxiI6ncWtwjnVc
sidebar_position: 4
keywords: 
  - ハルシネーション llm
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - zilliz
  - zilliz cloud
  - クラウド
  - using_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# using_database()

この操作は、現在の接続のデフォルトとしてデータベースを設定します。

## リクエスト構文\{#request-syntax}

Milvus クラスターには **default** という名前のデフォルトデータベースが付属しています。すべてのコレクション操作はデフォルトデータベース内で実行されます。このメソッドを使用して、デフォルトデータベースを変更できます。

```python
using_database(
    db_name: str,
    using: str
)
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    デフォルトデータベースとして設定するデータベースの名前。

- **using** (*string*) -

    接続のエイリアス。デフォルトは **default** です。

**RETURN TYPE:**

None

**RETURNS:**

None

**EXCEPTIONS:**

None

## 例\{#examples}

```python
from pymilvus import connections, db

conn = connections.connect(
    host="127.0.0.1", 
    port=19530
)

db.using_database("test")

## You can directly use a database upon the connection as follows.
## However, the specified database should exist beforehand.
conn = connections.connect(host="127.0.0.1", port=19530, db_name="test")
```

## 関連する操作\{#related-operations}

`using_database()` に関連する操作は次のとおりです。

- [create_database()](./db-create_database)

- [drop_database()](./db-drop_database)

- [list_database()](./db-list_database)

