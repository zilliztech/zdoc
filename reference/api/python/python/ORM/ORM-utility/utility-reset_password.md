---
title: "reset_password() | Python | ORM"
slug: /python/python/utility-reset_password
sidebar_label: "reset_password()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation resets the password for a specific user. | Python | ORM"
type: docx
token: K1Npdj5Ddod6UWxRN2ecf6K4nxf
sidebar_position: 38
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - zilliz
  - zilliz cloud
  - cloud
  - reset_password()
  - pymilvus26
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# reset_password()

This operation resets the password for a specific user. 

<Admonition type="info" icon="📘" title="Notes">

<p>This operation differs from <strong>update_password()</strong> in that this operation also resets the current connection using the newly set credentials.</p>

</Admonition>

## Request Syntax\{#request-syntax}

```python
reset_password(
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

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
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

## Related operations\{#related-operations}

The following operations are related to `reset_password()`

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [update_password()](./utility-update_password)

