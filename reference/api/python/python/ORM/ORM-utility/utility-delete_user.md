---
title: "delete_user() | Python | ORM"
slug: /python/python/utility-delete_user
sidebar_label: "delete_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes an existing user. | Python | ORM"
type: docx
token: E7zOdU2JpoqaU5xNYXvcAjgPnNh
sidebar_position: 6
keywords: 
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - delete_user()
  - pymilvus26
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# delete_user()

This operation deletes an existing user.

## Request Syntax\{#request-syntax}

```python
delete_user(
    user: str,
    password: str,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **user** (*string*) - 

    **[REQUIRED]**

    The name of the new user to delete.

- **password** (*string*) - 

    **[REQUIRED]**

    The corresponding password to the new user to create.

    Setting this to an incorrect password results in a **MilvusException**.

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

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Delete an existing user
user = utility.delete_user(user="admin", password="123456")
```

## Related operations\{#related-operations}

The following operations are related to `delete_user()`

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

