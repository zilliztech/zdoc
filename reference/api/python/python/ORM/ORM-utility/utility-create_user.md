---
displayed_sidbar: pythonSidebar
title: "create_user() | Python | ORM"
slug: /python/python/utility-create_user
sidebar_label: "create_user()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation creates a new user with a corresponding password. | Python | ORM"
type: docx
token: N44ndTSrgoEBx7xCID5cXRS7n1c
sidebar_position: 5
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - create_user()
  - pymilvus25
  - knn
  - Image Search
  - LLMs
  - Machine Learning
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# create_user()

This operation creates a new user with a corresponding password.

## Request Syntax{#request-syntax}

```python
create_user(
    user: str,
    password: str,
    using: str,
    timeout: float | None
)
```

```python
from pymilvus import utility

# Create a new user
utility.create_user(
    user="string",
    password="string",
    using="default"
)
```

**PARAMETERS:**

- **user** (*string*) - 

    **[REQUIRED]**

    The name of the new user to create. The value should start with a letter and can only contain underline, letters and numbers.

- **password** (*string*) - 

    **[REQUIRED]**

    The corresponding password to the new user to create. 

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
```

## Related operations{#related-operations}

The following operations are related to `create_user()`

- [Role](./ORM-Role)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

