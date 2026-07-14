---
title: "create_database() | Python | ORM"
slug: /python/python/db-create_database
sidebar_label: "create_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたデータベース名を使用してデータベースを作成します。 | Python | ORM"
type: docx
token: G4Ftde3kxoHAJbxVNXncI7mpngb
sidebar_position: 1
keywords: 
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - create_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_database()

この操作は、指定されたデータベース名を使用してデータベースを作成します。

## Request Syntax\{#request-syntax}

```python
create_database(
    db_name: str,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    作成するデータベースの名前。

- **using** (*string*) -

    接続のエイリアス。デフォルトは **default** です。

- **timeout** (*float* | *None*)

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

**RETURN TYPE:**

None

**RETURNS:**

None

**EXCEPTIONS:**

None

## Examples\{#examples}

```python
from pymilvus import connections, db

conn = connections.connect(
    host="127.0.0.1", 
    port=19530
)

db.create_database(db_name="test")
```

## Related operations\{#related-operations}

以下の操作は `create_database()` に関連しています。

- [drop_database()](./db-drop_database)

- [list_database()](./db-list_database)

- [using_database()](./db-using_database)

