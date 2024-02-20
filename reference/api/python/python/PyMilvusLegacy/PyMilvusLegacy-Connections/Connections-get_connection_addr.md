---
displayed_sidbar: pythonSidebar
slug: /python/Connections-get_connection_addr
beta: false
notebook: false
token: H2zBdRHVtovNQGxvb0xcwpSKnBd
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# get_connection_addr()

This operation retrieves the configuration of the specified connection by alias.

```python
pymilvus.connections.get_connection_addr(alias: str)
```

The following operations are related to `get_connection_addr()`:

- `connect()`

- `add_connection()`

- `disconnect()`

- `has_connection()`

- `list_connections()`

- `remove_connection()`

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import connections

connections.get_connection_addr(alias="string")
```

__PARAMETERS:__

- __alias__ (_string_) -

    __[REQUIRED]__

    A connection alias.

__RETURN TYPE:__

_Dictionary_

__RETURNS:__

A dictionary containing the connection configuration.

__EXCEPTIONS:__

- __ConnectionConfigException__

    This exception will be raised when the connection configuration is invalid.

## Examples{#examples}

```python
from pymilvus import connections

connections.get_connection_addr(alias="default")

# Output
# {'address': 'in03-**************.api.gcp-us-west1.cloud-uat3.zilliz.com:443', 'user': ''}
```

