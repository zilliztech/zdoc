---
displayed_sidbar: pythonSidebar
title: "get_connection_addr() | Python | ORM"
slug: /python/python/Connections-get_connection_addr
sidebar_label: "get_connection_addr()"
added_since: Inherit
last_modified: false
deprecate_since: false
beta: NEAR DEPRECATE
notebook: false
description: "This operation retrieves the configuration of the specified connection by alias. | Python | ORM"
type: docx
token: H2zBdRHVtovNQGxvb0xcwpSKnBd
sidebar_position: 5
keywords: 
  - Machine Learning
  - RAG
  - NLP
  - Neural Network
  - zilliz
  - zilliz cloud
  - cloud
  - get_connection_addr()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_connection_addr()

This operation retrieves the configuration of the specified connection by alias.

## Request Syntax

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

## Examples

```python
from pymilvus import connections

connections.get_connection_addr(alias="default")

# Output
# {'address': 'in03-**************.api.ali-cn-hangzhou'}
```

## Related operations

The following operations are related to `get_connection_addr()`:

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

