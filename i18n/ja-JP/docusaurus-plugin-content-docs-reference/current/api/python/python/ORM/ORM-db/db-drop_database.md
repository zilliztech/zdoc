---
title: "drop_database() | Python | ORM"
slug: /python/python/db-drop_database
sidebar_label: "drop_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたデータベース名を使用してデータベースを削除します。 | Python | ORM"
type: docx
token: Y7pOdKR4MoqmvVxcS1TcjqUynMc
sidebar_position: 2
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - milvus とは
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - drop_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_database()

この操作は、指定されたデータベース名を使用してデータベースを削除します。

## リクエスト構文\{#request-syntax}

```python
drop_database(
    db_name: str,
    using: str,
    timeout: float | None
)
```

**パラメーター:**

- **db_name** (*string*) -

    **[必須]**

    削除するデータベースの名前。

- **using** (*string*) -

    接続のエイリアス。デフォルトは **default** です。

- **timeout** (*float* | *None*)

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

None

**戻り値:**

None

**例外:**

None

## 例\{#examples}

```python
from pymilvus import connections, db

conn = connections.connect(
    host="127.0.0.1", 
    port=19530
)

db.drop_database(db_name="test")
```

## 関連する操作\{#related-operations}

次の操作は `drop_database()` に関連しています。

- [create_database()](./db-create_database)

- [list_database()](./db-list_database)

- [using_database()](./db-using_database)

