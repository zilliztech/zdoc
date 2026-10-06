---
title: "alter_role() | Python | MilvusClient"
slug: /python/python/Authentication-alter_role
sidebar_label: "alter_role()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation changes the description of an existing role. | Python | MilvusClient"
type: docx
token: Nz26dTDqnoSqmhxRRK5cUNVunQd
sidebar_position: 21
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - alter_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_role()

This operation changes the description of an existing role.

## Request Syntax\{#request-syntax}

```python
alter_role(
    role_name: str,
    description: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to update.

- **description** (*str*) -

    **[REQUIRED]**

    The new description for the role.

- **timeout** (*Optional[float]*) -

    The maximum time, in seconds, to wait for the RPC to complete.

- **kwargs** (*Any*) -

    The additional request context options.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.alter_role(
    role_name="reader",
    description="Read-only access to collections",
)
```
