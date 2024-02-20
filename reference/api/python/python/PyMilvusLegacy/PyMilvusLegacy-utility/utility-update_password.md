---
displayed_sidbar: pythonSidebar
slug: /python/utility-update_password
beta: false
notebook: false
token: SGjed7w9toewDlxmXHKc7BFancf
sidebar_position: 41
---

import Admonition from '@theme/Admonition';


# update_password()

This operation updates the password for a specific user.

```python
pymilvus.utility.update_password(
    user: str,
    old_password: str,
    new_password: str,
    using: str,
    timeout: float | None
)
```

The following operations are related to `update_password()`

- update_password()

- create_user()

- list_user()

- list_users()

- list_usernames()

- delete_user()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

# Reset the password for a specific user.
utility.update_password(
    user="string",
    old_password="string",
    new_password="string",
    using="default"
)
```

__PARAMETERS:__

- __user__ (_str_) - 

    __[REQUIRED]__

    The specific user whose password is to be reset.

- __old_password__ (_str_) - 

    __[REQUIRED]__

    The original password for the specified user.

    Setting this to an incorrect password results in a __MilvusException__.

- __new_password__ (_str_) - 

    __[REQUIRED]__

    The new password for the specified user. 

    The password must be a string of 8 to 64 characters and must include at least three of the following character types: uppercase letters, lowercase letters, numbers, and special characters.

- __using__ (_string_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import connections, utility

# Connection to localhost:19530
connections.connect()

# Create a user
user = utility.create_user(user="admin", password="123456")

# Update the password for the user.
update_password(
    user="admin",
    old_password="123456",
    new_password="123456Abc*",
    using="default"
)
```

