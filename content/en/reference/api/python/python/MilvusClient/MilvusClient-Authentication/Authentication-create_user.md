---
title: "create_user() | Python | MilvusClient"
slug: /python/python/Authentication-create_user
sidebar_label: "create_user()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a user. | Python | MilvusClient"
type: docx
token: EglSdm1jkozDSlxq6SEc4CRonVe
sidebar_position: 4
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - create_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_user()

This operation creates a user.

## Request Syntax\{#request-syntax}

```python
create_user(
    user_name: str,
    password: str,
    timeout: Optional[float] = None,
    description: Optional[str] = None,
    **kwargs
)
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of the user to create.

- **password** (*str*) -

    **[REQUIRED]**

    The password of the user to create.

- **description** (*Optional[str]*) -

    The description of the user to create.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

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
client.create_user(
    user_name="alice",
    password="P@ssw0rd",
    description="Analytics team",
)
```
