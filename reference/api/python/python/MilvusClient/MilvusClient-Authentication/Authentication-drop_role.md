---
displayed_sidbar: pythonSidebar
title: "drop_role() | Python | MilvusClient"
slug: /python/python/Authentication-drop_role
sidebar_label: "drop_role()"
beta: false
notebook: false
description: "This operation drops a custom role. | Python | MilvusClient"
type: docx
token: Vmxpd3MttodOE3x3V11cVTeunDh
sidebar_position: 8
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - drop_role()
  - pymilvus25
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_role()

This operation drops a custom role.

## Request syntax{#request-syntax}

```python
drop_role(
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to drop.

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
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 2. Create a role
client.create_role(role_name="read_only")

# 3. Drop a role
client.drop_role(role_name="read_only")
```
