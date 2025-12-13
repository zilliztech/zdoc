---
title: "disconnect() | Python | ORM"
slug: /python/python/Connections-disconnect
sidebar_label: "disconnect()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation disconnects the client from the specified connection. | Python | ORM"
type: docx
token: IpSBdcabbosobvxQkAEcv6CvnJd
sidebar_position: 4
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - disconnect()
  - pymilvus26
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# disconnect()

This operation disconnects the client from the specified connection.

## Request Syntax\{#request-syntax}

```python
disconnect(alias: str)
```

**PARAMETERS:**

- **alias** (*string*) -

    **[REQUIRED]**

    A connection alias.

**RETURN TYPE:**

None

**RETURNS:**

None

**EXCEPTIONS:**

- **ConnectionConfigException**

    This exception will be raised when the connection configuration is invalid.

## Examples\{#examples}

```python
from pymilvus import connections

connections.disconnect(alias="default")
```

## Related operations\{#related-operations}

The following operations are related to `disconnect()`:

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

