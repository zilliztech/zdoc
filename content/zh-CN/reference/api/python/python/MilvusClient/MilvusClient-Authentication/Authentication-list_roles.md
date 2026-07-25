---
title: "list_roles() | Python | MilvusClient"
slug: /python/python/Authentication-list_roles
sidebar_key: python/Authentication-list_roles
sidebar_label: "list_roles()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all custom roles. | Python | MilvusClient"
type: docx
token: MApVdDl17oU8OixzbMPcgceKnOh
sidebar_position: 14
keywords: 
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - zilliz
  - zilliz cloud
  - cloud
  - list_roles()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_roles()

This operation lists all custom roles.

## Request syntax\{#request-syntax}

```python
list_roles(
    timeout: Optional[float] = None
) -> dict
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list of role names.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **BaseException**

    This exception will be raised when this operation fails.

## Example\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.ali-cn-hangzhou.zillizcloud.com:19530",
    token="user:password"
)

# 2. List all roles
client.list_roles()

# ['db_admin', 'db_ro', 'db_rw']
```

<Admonition type="info" icon="📘" title="Notes">

Each Zilliz Cloud cluster has three built-in roles, namely, **db\_ro**, **db\_rw**, and **db\_admin**. For details, refer to [Cluster Built-in Roles](/docs/cluster-roles#built-in-cluster-roles).

</Admonition>

