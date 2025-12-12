---
title: "get_server_version() | Python | ORM"
slug: /python/python/utility-get_server_version
sidebar_label: "get_server_version()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks the version of the Zilliz Cloud cluster. | Python | ORM"
type: docx
token: PoPkdkzSnofUihxzKLqcw7hYnrf
sidebar_position: 16
keywords: 
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - get_server_version()
  - pymilvus26
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# get_server_version()

This operation checks the version of the Zilliz Cloud cluster.

## Request syntax\{#request-syntax}

```python
get_server_version(
    using: str = "default",
    timeout: float | None
)
```

```python
from pymilvus import connections, utility

# Establish a connection
connections.connect(...)

# Check the server version
server_version = utility.get_server_version()
```

**PARAMETERS:**

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*str*

**RETURNS:**

The server version.

**EXAMPLE:**

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Check the server version
server_version = utility.get_server_version()
```

## Related operations\{#related-operations}

The following operations are related to `get_server_version()`:

- [get_server_type()](./utility-get_server_type)

