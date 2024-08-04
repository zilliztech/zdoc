---
displayed_sidbar: pythonSidebar
title: "get_users() | Python | ORM"
slug: /python/python/Role-get_users
sidebar_label: "get_users()"
beta: false
notebook: false
description: "This operation lists all users associated with the current role. | Python | ORM"
type: docx
token: CCOhd671iog6rRxu8aOcaPncnLK
sidebar_position: 4
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_users()

This operation lists all users associated with the current role.

## Request Syntax{#request-syntax}

```python
get_users()
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

## Related operations{#related-operations}

The following operations are related to `get_users()`:

- [add_user()](./Role-add_user)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

