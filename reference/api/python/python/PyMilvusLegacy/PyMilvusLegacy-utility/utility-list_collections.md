---
displayed_sidbar: pythonSidebar
slug: /python/utility-list_collections
beta: false
notebook: false
token: QgxEdfBMSodYo6xCg24cH3hInr4
sidebar_position: 24
---

import Admonition from '@theme/Admonition';


# list_collections()

This operation lists all collections in the database used in the current connection.

```python
pymilvus.utility.list_collections(
    timeout: float | None,
    using: str = "default",
)
```

The following operations are related to `list_collections()`:

- rename_collection()

- has_collection()

- rename_collection()

- flush_all()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

res = utility.list_collections()
```

__PARAMETERS:__

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

- __using__ (_str_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

__RETURN TYPE:__

_list_

__RETURNS:__
A list of collection names.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Examples{#examples}

```python
from pymilvus import connections, utility

connections.connect()

utility.list_collections()
```

