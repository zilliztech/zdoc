---
title: "drop_role() | Python | MilvusClient"
slug: /python/python/Authentication-drop_role
sidebar_label: "drop_role()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation drops a custom role. | Python | MilvusClient"
type: docx
token: KUAXdm3o3opQPex8N69cMlPbnTh
sidebar_position: 8
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_role()

This operation drops a custom role.

## Request syntax\{#request-syntax}

```python
drop_role(
    role_name: str,
    force_drop: bool = False,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to drop.

- **force_drop** (*bool*) -

    Whether to forcefully drop the role even if it has privileges or users assigned. Defaults to **False**.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a role
client.create_role(role_name="read_only")

# Drop a role
client.drop_role(role_name="read_only")

# Force drop a role with assigned privileges
client.drop_role(role_name="custom_role", force_drop=True)
```
