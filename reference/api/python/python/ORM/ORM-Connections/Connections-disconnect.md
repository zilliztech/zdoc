---
displayed_sidbar: pythonSidebar
title: "disconnect() | Python | ORM"
slug: /python/python/Connections-disconnect
sidebar_label: "disconnect()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation disconnects the client from the specified connection. | Python | ORM"
type: docx
token: IpSBdcabbosobvxQkAEcv6CvnJd
sidebar_position: 4
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - disconnect()
  - pymilvus25
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# disconnect()

This operation disconnects the client from the specified connection.

## Request Syntax{#request-syntax}

```python
disconnect(alias: str)
```

**PARAMETERS:**

- **alias** (*string*) -

    **&#91;REQUIRED&#93;**

    A connection alias.

**RETURN TYPE:**

None

**RETURNS:**

None

**EXCEPTIONS:**

- **ConnectionConfigException**

    This exception will be raised when the connection configuration is invalid.

## Examples{#examples}

```python
from pymilvus import connections

connections.disconnect(alias="default")
```

## Related operations{#related-operations}

The following operations are related to `disconnect()`:

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

