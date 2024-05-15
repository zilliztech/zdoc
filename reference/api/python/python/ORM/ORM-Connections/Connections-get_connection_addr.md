---
displayed_sidbar: this.displayedSidebar
slug: /python/python/Connections-get_connection_addr
beta: FALSE
notebook: FALSE
type: docx
token: H2zBdRHVtovNQGxvb0xcwpSKnBd
sidebar_position: 5
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_connection_addr()

This operation retrieves the configuration of the specified connection by alias.

## Request Syntax{#request-syntax}

```python
get_connection_addr(alias: str)
```

**PARAMETERS:**

- **alias** (*string*) -

    **[REQUIRED]**

    A connection alias.

**RETURN TYPE:**

*Dictionary*

**RETURNS:**

A dictionary containing the connection configuration.

**EXCEPTIONS:**

- **ConnectionConfigException**

    This exception will be raised when the connection configuration is invalid.

## Examples{#examples}

```python
from pymilvus import connections

connections.get_connection_addr(alias="default")

# Output
# {'address': 'in03-**************.api.gcp-us-west1.cloud-uat3.zilliz.com:443', 'user': ''}
```

## Related operations{#related-operations}

The following operations are related to `get_connection_addr()`:

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

