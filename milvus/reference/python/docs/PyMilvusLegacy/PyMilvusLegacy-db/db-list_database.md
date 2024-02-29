---
displayed_sidbar: pythonSidebar
slug: /python/db-list_database
beta: false
notebook: false
type: docx
token: PV1PdliWZooAB8xAE5scZO2Nn6K
sidebar_position: 3
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

__PARAMETERS:__

- __using__ (_string_) -

    Alias of the connection. Defaults to __default__.

- __timeout__ (_float _|_ None_)

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_List_

__RETURNS:__

A list of database names.

__EXCEPTIONS:__

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

