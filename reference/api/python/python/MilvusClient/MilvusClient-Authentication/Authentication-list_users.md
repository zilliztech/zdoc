---
displayed_sidbar: pythonSidebar
title: "list_users() | Python | MilvusClient"
slug: /python/python/Authentication-list_users
sidebar_label: "list_users()"
beta: false
notebook: false
description: "This operation lists the names of all existing users. | Python | MilvusClient"
type: docx
token: EZ2YdBHoDoRTlxx91tscffm1nSb
sidebar_position: 10
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_users()

This operation lists the names of all existing users.

## Request syntax{#request-syntax}

```python
list_users(
    timeout: Optional[float] = None
) -> List
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list of user names.

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
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. List all users
client.list_users()

# ['db_admin', 'user_1']
```

## Related methods{#related-methods}

- [create_user()](./Authentication-create_user)

- [describe_user()](./Authentication-describe_user)

- [drop_user()](./Authentication-drop_user)

- [update_password()](./Authentication-update_password)

