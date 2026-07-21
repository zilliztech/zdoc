---
title: "describe_user() | Python | MilvusClient"
slug: /python/python/Authentication-describe_user
sidebar_label: "describe_user()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "Returns the `roles` and `description` associated with a user account. Returns an empty dictionary when the user does not exist. | Python | MilvusClient"
type: docx
token: TwTnduPOioywHDx8hPQc80tRnKg
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

Returns the `roles` and `description` associated with a user account. Returns an empty dictionary when the user does not exist.

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
Name of the user account to describe.

- **timeout** (*Optional[float]*) -
Default: `None`
Maximum time, in seconds, to wait for the RPC to complete.

- **kwargs** (*Any*) -
Additional request context options.

**RETURN TYPE:**

*dict*

**RETURNS:**

Dictionary with `user_name`, `roles`, and `description`. Returns an empty dictionary when the user is not found.

- **user_name** (*str*) -
Name of the described user account.

- **roles** (*list[str]*) -
Roles assigned to the user account.

- **description** (*str*) -
Description stored for the user account.

**EXCEPTIONS:**

- **MilvusException**
Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")
user = client.describe_user("analyst")
print(user)
# {
#     "user_name": "analyst",
#     "roles": ["read_only"],
#     "description": "Analytics account",
# }
```
