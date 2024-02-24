---
displayed_sidbar: pythonSidebar
slug: /python/utility-reset_password
beta: false
notebook: false
token: K1Npdj5Ddod6UWxRN2ecf6K4nxf
sidebar_position: 38
---

import Admonition from '@theme/Admonition';


# reset_password()

This operation resets the password for a specific user. 

<Admonition type="info" icon="📘" title="Notes">

<p>This operation differs from _<em>update</em>password() __in that this operation also resets the current connection using the newly set credentials.</p>

</Admonition>

## Request Syntax{#request-syntax}

```python
reset_password(
    user: str,
    old_password: str,
    new_password: str,
    using: str,
    timeout: float | None
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

# Reset the password for the user.
reset_password(
    user="admin",
    old_password="123456",
    new_password="123456Abc*",
    using="default"
)
```

## Related operations{#related-operations}

The following operations are related to `reset_password()`

- [Role](./PyMilvusLegacy-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [update_password()](./utility-update_password)

