---
title: "update_password() | Python | MilvusClient"
slug: /python/python/Authentication-update_password
sidebar_label: "update_password()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation updates the password of a specific user. | Python | MilvusClient"
type: docx
token: WGDod7Qehou4GWx4Co2cJ34VnKb
sidebar_position: 20
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - zilliz
  - zilliz cloud
  - cloud
  - update_password()
  - pymilvus26
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# update_password()

This operation updates the password of a specific user.

## Request syntax\{#request-syntax}

```python
update_password(
    user_name: str,
    old_password: str,
    new_password: str,
    reset_connection: Optional[bool] = False,
    timeout: Optional[float] = None,
    **kwargs,
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

    Whether to reset the connection using the new credentials.

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
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. Change the password
client.update_password(
    user_name="user_1",
    old_password="P@ssw0rd",
    new_password="NewP@ssw0rd"
)
```

## Related methods\{#related-methods}

- [create_user()](./Authentication-create_user)

- [describe_user()](./Authentication-describe_user)

- [drop_user()](./Authentication-drop_user)

- [list_users()](./Authentication-list_users)

