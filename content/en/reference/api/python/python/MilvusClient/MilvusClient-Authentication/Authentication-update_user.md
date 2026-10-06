---
title: "update_user() | Python | MilvusClient"
slug: /python/python/Authentication-update_user
sidebar_label: "update_user()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation updates the description of an existing user. | Python | MilvusClient"
type: docx
token: ScbQdPbi5obs0ex85uucaO2Mnzd
sidebar_position: 23
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - update_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# update_user()

This operation updates the description of an existing user.

## Request Syntax\{#request-syntax}

```python
update_user(
    user_name: str,
    description: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of the user account to update.

- **description** (*str*) -

    **[REQUIRED]**

    The new description for the user account.

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
client.update_user(
    user_name="alice",
    description="Analytics team",
)
```
