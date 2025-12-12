---
title: "drop_role() | Python | MilvusClient"
slug: /python/python/Authentication-drop_role
sidebar_label: "drop_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a custom role. | Python | MilvusClient"
type: docx
token: Vmxpd3MttodOE3x3V11cVTeunDh
sidebar_position: 8
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_role()
  - pymilvus26
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
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

## Example\{#example}

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
