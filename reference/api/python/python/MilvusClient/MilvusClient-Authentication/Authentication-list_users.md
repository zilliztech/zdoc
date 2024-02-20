---
displayed_sidbar: pythonSidebar
slug: /python/Authentication-list_users
beta: false
notebook: false
token: EZ2YdBHoDoRTlxx91tscffm1nSb
sidebar_position: 10
---

import Admonition from '@theme/Admonition';


# list_users()

This operation lists the names of all existing users.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.list_users(
    timeout: Optional[float] = None
) -> List
```

__PARAMETERS:__

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_list_

__RETURNS:__

A list of user names.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

- __BaseException__

    This exception will be raised when this operation fails.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. List all users
client.list_users()

# ['admin', 'root', 'user_1']
```

