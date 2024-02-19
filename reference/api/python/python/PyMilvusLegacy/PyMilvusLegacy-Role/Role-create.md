---
displayed_sidbar: pythonSidebar
slug: /python/Role-create
beta: false
notebook: false
token: G3h4d3jx6oXFHBxFZlyc9jLKnTO
sidebar_position: 10
---

import Admonition from '@theme/Admonition';


# create()

This operation creates the current role. 

```python
pymilvus.Role.create()
```

The following operations are related to `create()`:

- Role

- drop()

- grant()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Role

# Define the name of the new role
role = Role(role_name="string")

# Create the new role
role.create()
```

**PARAMETERS:**

N/A

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role, utility

# Get an existing role
role = Role(name="test")

# Create a new role
role.create()

# List all roles
roles = utility.list_roles(include_user_info=True)

# Output
# RoleInfo groups:
# - RoleItem: <role_name:admin>, <users:('admin',)>
# - RoleItem: <role_name:public>, <users:()>
# - RoleItem: <role_name:test>, <users:()>
```

