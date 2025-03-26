---
displayed_sidbar: pythonSidebar
title: "list_usernames() | Python | ORM"
slug: /python/python/utility-list_usernames
sidebar_label: "list_usernames()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation lists the names of all existing users. | Python | ORM"
type: docx
token: RXi3dgtNYogU0cxmTsgcdT72nsc
sidebar_position: 29
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - list_usernames()
  - pymilvus25
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_usernames()

This operation lists the names of all existing users.

## Request Syntax{#request-syntax}

```python
list_usernames(
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list that contains the names of all existing users.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# List all existing usernames
users = utility.list_usernames()
```

## Related operations{#related-operations}

The following operations are related to `list_usernames()`

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

