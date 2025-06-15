---
displayed_sidbar: pythonSidebar
title: "has_connection() | Python | ORM"
slug: /python/python/Connections-has_connection
sidebar_label: "has_connection()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation checks if a connection with the given alias has already been established. | Python | ORM"
type: docx
token: XeZwdeK64oGD8rx9DA3ciqNinnh
sidebar_position: 6
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - has_connection()
  - pymilvus25
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# has_connection()

This operation checks if a connection with the given alias has already been established.

## Request Syntax{#request-syntax}

```python
has_connection(alias: str)
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

## Related operations{#related-operations}

The following operations are related to `has_connection()`:

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

