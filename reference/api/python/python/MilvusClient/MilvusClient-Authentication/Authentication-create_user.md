---
displayed_sidbar: pythonSidebar
slug: /python/Authentication-create_user
beta: false
notebook: false
token: BDupd28JqoNY9HxVOTfcv86enRe
sidebar_position: 2
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

__PARAMETERS:__

- __user_name__ (_str_) -

    __[REQUIRED]__

    The name of the user to create.

- __password__ (_str_) -

    __[REQUIRED]__

    The password of the user to create.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

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

