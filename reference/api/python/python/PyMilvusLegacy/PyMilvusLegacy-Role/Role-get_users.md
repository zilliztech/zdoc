---
displayed_sidbar: pythonSidebar
slug: /python/Role-get_users
beta: false
notebook: false
token: CCOhd671iog6rRxu8aOcaPncnLK
sidebar_position: 8
---

import Admonition from '@theme/Admonition';


# get_users()

This operation lists all users associated with the current role.

```python
pymilvus.Role.get_users()
```

The following operations are related to `get_users()`:

- Role

- add_user()

- remove_user()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="string")

# List all users associated with the current role
users = role.get_users()
```

**PARAMETERS**

N/A

**RETURN TYPE:**

*tuple*

**RETURNS:**

A tuple that contains the names of all users added to the current role.

## Examples{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="admin")

# List all users associated with the current role
users = role.get_users() # (admin, )
```

