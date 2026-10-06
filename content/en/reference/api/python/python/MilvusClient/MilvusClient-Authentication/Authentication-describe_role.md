---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation describes a specific role. | Python | MilvusClient"
type: docx
token: KoC3dcgn8oiJkNx8uZNcHvE4nxe
sidebar_position: 5
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_role()

This operation describes a specific role.

## Request Syntax\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> dict
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to describe.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*dict*

**RETURNS:**

A dictionary that contains the role name, the role description, and the privileges granted to the role.

**PARAMETERS:**

- **role** (*str*) -

    The name of the described role.

- **description** (*str*) -

    The description of the role.

- **privileges** (*list[dict]*) -

    The privileges granted to the role. Each dictionary carries one grant.

    - **object_type** (*str*) -

        The type of the resource object granted to the role. Possible values are Collection, Global, and User.

    - **object_name** (*str*) -

        The name of the resource object granted to the role. You are advised to use an asterisk (&ast;).

    - **db_name** (*str*) -

        The name of the database to which the role has access.

    - **role_name** (*str*) -

        The name of the specified role.

    - **privilege** (*str*) -

        The name of a privilege granted to the role.

    - **grantor_name** (*str*) -

        The name of the user who granted the privilege.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
roles = client.describe_role(role_name="reader")
for item in roles:
    print(
        item.role_name,
        item.description,
    )
```
