---
displayed_sidbar: pythonSidebar
slug: /python/Connections-has_connection
beta: false
notebook: false
token: XeZwdeK64oGD8rx9DA3ciqNinnh
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# has_connection()

This operation checks if a connection with the given alias has already been established.

```python
pymilvus.connections.has_connection(alias: str)
```

The following operations are related to `has_connection()`:

- `connect()`

- `add_connection()`

- `disconnect()`

- `get_connection_addr()`

- `list_connections()`

- `remove_connection()`

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import connections

connections.has_connection(alias="string")
```

**PARAMETERS:**

- **alias** (*string*) -

    **[REQUIRED]**

    A connection alias.

**RETURN TYPE:**

*Boolean*

**RETURNS:**

A Boolean value indicating whether the connection exists.

<Admonition type="info" icon="📘" title="Notes">

<p>An existing connection alias does not necessarily indicates that the corresponding connection has been established.</p>
<p>This operation evaluates to <strong>True</strong> only if the connection alias exists and the corresponding connection has been established.</p>

</Admonition>

**EXCEPTIONS:**

- **ConnectionConfigException**

    This exception will be raised when the connection configuration is invalid.

## Examples{#examples}

```python
from pymilvus import connections

connections.has_connection(alias="default")

# Output
# True
```
