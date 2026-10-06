---
title: "update_password() | Python | MilvusClient"
slug: /python/python/Authentication-update_password
sidebar_label: "update_password()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates the password of a specific user. | Python | MilvusClient"
type: docx
token: ZbGcdPeOZoyFpPxfKwnclTv5ncf
sidebar_position: 20
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - update_password()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# update_password()

This operation updates the password of a specific user.

## Request Syntax\{#request-syntax}

```python
update_password(
    user_name: str,
    old_password: str,
    new_password: str,
    timeout: Optional[float] = None,
    description: Optional[str] = None,
    **kwargs
)
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of an existing user.

- **old_password** (*str*) -

    **[REQUIRED]**

    The original password of the user.

- **new_password** (*str*) -

    **[REQUIRED]**

    The new password of the user.

- **reset_connection** (*bool*) -

    A flag that resets the connections bound to the user so they re-authenticate with the new credentials.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)
client.update_password(
    user_name="alice",
    old_password="OldP@ss",
    new_password="NewP@ss",
    reset_connection=True,
)
```
