---
title: "create_database() | Python | ORM"
slug: /python/python/db-create_database
sidebar_label: "create_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a database using the provided database name. | Python | ORM"
type: docx
token: G4Ftde3kxoHAJbxVNXncI7mpngb
sidebar_position: 1
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - create_database()
  - pymilvus26
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_database()

This operation creates a database using the provided database name.

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

    Name of the database to be created.

- **using** (*string*) -

    Alias of the connection. Defaults to **default**.

- **timeout** (*float* | *None*)

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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

The following operations are related to `create_database()`:

- [drop_database()](./db-drop_database)

- [list_database()](./db-list_database)

- [using_database()](./db-using_database)

