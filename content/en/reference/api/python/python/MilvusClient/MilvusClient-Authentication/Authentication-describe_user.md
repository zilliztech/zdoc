---
title: "describe_user() | Python | MilvusClient"
slug: /python/python/Authentication-describe_user
sidebar_label: "describe_user()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation describes a specific user. | Python | MilvusClient"
type: docx
token: M1KhdfoEDokSUIxwB8fcKBeMn2b
sidebar_position: 6
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - describe_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_user()

This operation describes a specific user.

## Request Syntax\{#request-syntax}

```python
describe_user(
    user_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> dict
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of the user to describe.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*dict*

**RETURNS:**

A dictionary with the user name, the assigned roles, and the description. Returns an empty dictionary when the user is not found.

**PARAMETERS:**

- **user_name** (*str*) -

    The name of the described user account.

- **roles** (*list[str]*) -

    The roles assigned to the user account.

- **description** (*str*) -

    The description stored for the user account.

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
users = client.describe_user(user_name="alice")
for item in users:
    print(
        item.user_name,
        item.roles,
        item.description,
    )
```
