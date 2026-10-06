---
title: "create_role() | Python | MilvusClient"
slug: /python/python/Authentication-create_role
sidebar_label: "create_role()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a role for role-based access control. | Python | MilvusClient"
type: docx
token: HRqudGOOnokInhxczclcADBDn8g
sidebar_position: 3
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - create_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_role()

This operation creates a role for role-based access control.

## Request Syntax\{#request-syntax}

```python
create_role(
    role_name: str,
    timeout: Optional[float] = None,
    description: str = "",
    **kwargs
)
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to create.

- **timeout** (*float*) -

    The timeout duration for this operation.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.create_role(
    role_name="reader",
    description="Read-only access",
)
```
