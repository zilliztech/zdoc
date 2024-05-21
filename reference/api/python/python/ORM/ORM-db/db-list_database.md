---
displayed_sidbar: pythonSidebar
slug: /python/python/db-list_database
beta: FALSE
notebook: FALSE
type: docx
token: PV1PdliWZooAB8xAE5scZO2Nn6K
sidebar_position: 3
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_database()

This operation returns a list of database names from the connected Milvus instance.

```python
list_database(
    using: str,
    timeout: float | None
)
```

## Request Syntax{#request-syntax}

```python
from pymilvs import db

db.list_database()
```

**PARAMETERS:**

- **using** (*string*) -

    Alias of the connection. Defaults to **default**.

- **timeout** (*float* | *None*)

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*List*

**RETURNS:**

A list of database names.

**EXCEPTIONS:**

None

## Examples{#examples}

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

## Related operations{#related-operations}

The following operations are related to `list_database()`:

- [create_database()](./db-create_database)

- [drop_database()](./db-drop_database)

- [using_database()](./db-using_database)

