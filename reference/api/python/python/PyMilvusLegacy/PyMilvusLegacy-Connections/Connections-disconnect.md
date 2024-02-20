---
displayed_sidbar: pythonSidebar
slug: /python/Connections-disconnect
beta: false
notebook: false
token: IpSBdcabbosobvxQkAEcv6CvnJd
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# disconnect()

This operation disconnects the client from the specified connection.

```python
pymilvus.connections.disconnect(alias: str)
```

The following operations are related to `disconnect()`:

- `connect()`

- `add_connection()`

- `get_connection_addr()`

- `has_connection()`

- `list_connections()`

- `remove_connection()`

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import connections

connections.disconnect(alias="string")
```

__PARAMETERS:__

- __alias__ (_string_) -

    __[REQUIRED]__

    A connection alias.

__RETURN TYPE:__

None

__RETURNS:__

None

__EXCEPTIONS:__

- __ConnectionConfigException__

    This exception will be raised when the connection configuration is invalid.

## Examples{#examples}

```python
from pymilvus import connections

connections.disconnect(alias="default")
```
