---
title: "remove_connection() | Python | ORM"
slug: /python/python/Connections-remove_connection
sidebar_label: "remove_connection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes the connection from the registry by the given alias and disconnects if connected. | Python | ORM"
type: docx
token: L4KSdOVTEotaiyxjTddcVRDhn3E
sidebar_position: 8
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - remove_connection()
  - pymilvus25
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_connection()

This operation removes the connection from the registry by the given alias and disconnects if connected.

## Request Syntax{#request-syntax}

```python
remove_connection(alias: str)
```

**PARAMETERS:**

- **alias** (*string*) -

    **&#91;REQUIRED&#93;**

    A connection alias

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **ConnectionConfigException**

    This exception will be raised when the connection configuration is invalid.

## Examples{#examples}

```python
from pymilvus import connections

connections.remove_connection(alias="default")
```

## Related operations{#related-operations}

The following operations are related to `remove_connection()`:

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

