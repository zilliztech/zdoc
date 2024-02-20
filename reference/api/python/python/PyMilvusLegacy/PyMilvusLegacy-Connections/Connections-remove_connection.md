---
displayed_sidbar: pythonSidebar
slug: /python/Connections-remove_connection
beta: false
notebook: false
token: L4KSdOVTEotaiyxjTddcVRDhn3E
sidebar_position: 8
---

import Admonition from '@theme/Admonition';


# remove_connection()

This operation removes the connection from the registry by the given alias and disconnects if connected.

```python
pymilvus.connections.remove_connection(alias: str)
```

The following operations are related to `remove_connection()`:

- `connect()`

- `add_connection()`

- `disconnect()`

- `get_connection_addr()`

- `has_connection()`

- `list_connections()`

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import connections

connections.remove_connection(alias="string")
```

__PARAMETERS:__

- __alias__ (_string_) -

    __[REQUIRED]__

    A connection alias

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

- __ConnectionConfigException__

    This exception will be raised when the connection configuration is invalid.

## Examples{#examples}

```python
from pymilvus import connections

connections.remove_connection(alias="default")
```
