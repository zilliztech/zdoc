---
displayed_sidbar: pythonSidebar
slug: /python/python/Authentication-create_user
beta: false
notebook: false
type: docx
token: BDupd28JqoNY9HxVOTfcv86enRe
sidebar_position: 2
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_user()

This operation creates a user.

## Request syntax{#request-syntax}

```python
create_user(
    user_name: str,
    password: str,
    timeout: Optional[float] = None
)
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of the user to create.

- **password** (*str*) -

    **[REQUIRED]**

    The password of the user to create.

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
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")
```

## Related methods{#related-methods}

- [describe_user()](./Authentication-describe_user)

- [drop_user()](./Authentication-drop_user)

- [list_users()](./Authentication-list_users)

- [update_password()](./Authentication-update_password)

