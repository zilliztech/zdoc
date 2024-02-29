---
displayed_sidbar: pythonSidebar
slug: /python/db-drop_database
beta: false
notebook: false
type: docx
token: Y7pOdKR4MoqmvVxcS1TcjqUynMc
sidebar_position: 2
---

# drop_database()

This operation drops a database using the provided database name.

## Request Syntax{#request-syntax}

```python
drop_database(
    db_name: str,
    using: str,
    timeout: float | None
)
```

__PARAMETERS:__

- __db_name__ (_string_) -

    __[REQUIRED]__

    Name of the database to be dropped.

- __using__ (_string_) -

    Alias of the connection. Defaults to __default__.

- __timeout__ (_float _|_ None_)

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

None

__RETURNS:__

None

__EXCEPTIONS:__

None

## Examples{#examples}

```python
from pymilvus import connections, db

conn = connections.connect(
    host="127.0.0.1", 
    port=19530
)

db.drop_database(db_name="test")
```

## Related operations{#related-operations}

The following operations are related to `drop_database()`:

- [create_database()](./db-create_database)

- [list_database()](./db-list_database)

- [using_database()](./db-using_database)

