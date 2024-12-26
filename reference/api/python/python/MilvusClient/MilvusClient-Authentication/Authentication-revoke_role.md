---
displayed_sidbar: pythonSidebar
title: "revoke_role() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_role
sidebar_label: "revoke_role()"
beta: false
notebook: false
description: "This operation revokes the role assigned to a user. | Python | MilvusClient"
type: docx
token: JJOId59ePoMLefxz1ChcBZ6inOh
sidebar_position: 12
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - revoke_role()
  - python
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# revoke_role()

This operation revokes the role assigned to a user.

## Request syntax{#request-syntax}

```python
revoke_role(
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

    The name of the role to revoke.

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

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. Grant the role to the user
client.grant_role(user_name="user_1", role_name="db_ro")

# 4. Revoke the role from the user
client.revoke_role(user_name="user_1", role_name="db_ro")
```

## Related methods{#related-methods}

- [describe_role()](./Authentication-describe_role)

- [grant_role()](./Authentication-grant_role)

- [list_roles()](./Authentication-list_roles)

