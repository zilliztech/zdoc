---
displayed_sidbar: pythonSidebar
slug: /python/utility-delete_user
beta: false
notebook: false
token: E7zOdU2JpoqaU5xNYXvcAjgPnNh
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# delete_user()

This operation deletes an existing user.

```python
pymilvus.utility.delete_user(
    user: str,
    password: str,
    using: str,
    timeout: float | None
)
```

The following operations are related to `delete_user()`

- update_password()

- reset_password()

- create_user()

- list_user()

- list_users()

- list_usernames()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

# Delete an existing user
delete_user(
    user="string",
    password="string",
    using="default"
)
```

__PARAMETERS:__

- __user__ (_string_) - 

    __[REQUIRED]__

    The name of the new user to delete.

- __password__ (_string_) - 

    __[REQUIRED]__

    The corresponding password to the new user to create.

    Setting this to an incorrect password results in a __MilvusException__.

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

# Delete an existing user
user = utility.delete_user(user="admin", password="123456")
```

