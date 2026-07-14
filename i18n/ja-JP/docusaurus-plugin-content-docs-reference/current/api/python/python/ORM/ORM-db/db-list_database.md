---
title: "list_database() | Python | ORM"
slug: /python/python/db-list_database
sidebar_label: "list_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、接続されている Milvus インスタンスからデータベース名のリストを返します。 | Python | ORM"
type: docx
token: PV1PdliWZooAB8xAE5scZO2Nn6K
sidebar_position: 3
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - list_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_database()

この操作は、接続されている Milvus インスタンスからデータベース名のリストを返します。

```python
list_database(
    using: str,
    timeout: float | None
)
```

## リクエスト構文\{#request-syntax}

```python
from pymilvs import db

db.list_database()
```

**パラメータ:**

- **using** (*string*) -

    接続のエイリアスです。デフォルトは **default** です。

- **timeout** (*float* | *None*)

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*List*

**戻り値:**

データベース名のリスト。

**例外:**

なし

## 例\{#examples}

```python
from pymilvus import connections, db

conn = connections.connect(
    host="127.0.0.1", 
    port=19530
)

db.list_database()

# Output
# ["default", "test"]
```

## 関連する操作\{#related-operations}

以下の操作は `list_database()` に関連しています。

- [create_database()](./db-create_database)

- [drop_database()](./db-drop_database)

- [using_database()](./db-using_database)

