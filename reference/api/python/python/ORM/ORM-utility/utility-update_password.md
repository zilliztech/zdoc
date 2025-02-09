---
displayed_sidbar: pythonSidebar
title: "update_password() | Python | ORM"
slug: /python/python/utility-update_password
sidebar_label: "update_password()"
beta: false
notebook: false
description: "This operation updates the password for a specific user. | Python | ORM"
type: docx
token: SGjed7w9toewDlxmXHKc7BFancf
sidebar_position: 41
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - update_password()
  - python
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# update_password()

This operation updates the password for a specific user.

## Request Syntax{#request-syntax}

```python
update_password(
    user: str,
    old_password: str,
    new_password: str,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **user** (*str*) - 

    **[REQUIRED]**

    The specific user whose password is to be reset.

- **old_password** (*str*) - 

    **[REQUIRED]**

    The original password for the specified user.

    Setting this to an incorrect password results in a **MilvusException**.

- **new_password** (*str*) - 

    **[REQUIRED]**

    The new password for the specified user. 

    The password must be a string of 8 to 64 characters and must include at least three of the following character types: uppercase letters, lowercase letters, numbers, and special characters.

- **using** (*string*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

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

## Related operations{#related-operations}

The following operations are related to `update_password()`

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

