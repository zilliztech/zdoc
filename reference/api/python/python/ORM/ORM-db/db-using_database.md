---
title: "using_database() | Python | ORM"
slug: /python/python/db-using_database
sidebar_label: "using_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation sets a database as the default for the current connection. | Python | ORM"
type: docx
token: GXXTd7JIgoUKhzxiI6ncWtwjnVc
sidebar_position: 4
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - using_database()
  - pymilvus26
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# using_database()

This operation sets a database as the default for the current connection.

## Request Syntax\{#request-syntax}

A Milvus cluster ships with a default database named **default**. All collection operations are performed within the default database. You can use this method to change the default database.

```python
using_database(
    db_name: str,
    using: str
)
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    Name of the database to be set as the default database.

- **using** (*string*) -

    Alias of the connection. Defaults to **default**.

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

db.using_database("test")

## You can directly use a database upon the connection as follows.
## However, the specified database should exist beforehand.
conn = connections.connect(host="127.0.0.1", port=19530, db_name="test")
```

## Related operations\{#related-operations}

The following operations are related to `using_database()`:

- [create_database()](./db-create_database)

- [drop_database()](./db-drop_database)

- [list_database()](./db-list_database)

