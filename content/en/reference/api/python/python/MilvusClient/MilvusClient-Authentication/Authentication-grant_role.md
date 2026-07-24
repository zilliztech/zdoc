---
title: "grant_role() | Python | MilvusClient"
slug: /python/python/Authentication-grant_role
sidebar_label: "grant_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation grants a role to a user. | Python | MilvusClient"
type: docx
token: DsnpdZuDGo77TYxFuYvcDpOgnIf
sidebar_position: 12
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - grant_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# grant_role()

This operation grants a role to a user.

## Request syntax\{#request-syntax}

```python
grant_role(
    user_name: str,
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of an existing user.

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to assign.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

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
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Grant the role to the user
client.grant_role(user_name="user_1", role_name="db_ro")
```

<Admonition type="info" icon="📘" title="Notes">

Each Zilliz Cloud cluster has three built-in roles, namely, **db\_ro**, **db\_rw**, and **db\_admin**. For details, refer to [Cluster Built-in Roles](/docs/cluster-roles#built-in-cluster-roles).

</Admonition>

