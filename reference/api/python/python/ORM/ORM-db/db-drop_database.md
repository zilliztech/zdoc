---
title: "drop_database() | Python | ORM"
slug: /python/python/db-drop_database
sidebar_label: "drop_database()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a database using the provided database name. | Python | ORM"
type: docx
token: Y7pOdKR4MoqmvVxcS1TcjqUynMc
sidebar_position: 2
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - drop_database()
  - pymilvus26
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_database()

This operation drops a database using the provided database name.

## Request Syntax\{#request-syntax}

```python
drop_database(
    db_name: str,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    Name of the database to be dropped.

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

db.drop_database(db_name="test")
```

## Related operations\{#related-operations}

The following operations are related to `drop_database()`:

- [create_database()](./db-create_database)

- [list_database()](./db-list_database)

- [using_database()](./db-using_database)

