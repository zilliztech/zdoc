---
displayed_sidbar: pythonSidebar
slug: /python/python/Role-is_exist
beta: FALSE
notebook: FALSE
type: docx
token: F8WOdIoz4okn5OxMEymcXNuRnkb
sidebar_position: 6
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# is_exist()

This operation checks whether the current role exists.

## Request Syntax{#request-syntax}

```python
is_exist()
```

**PARAMETERS:**

N/A

**RETURN TYPE:**

*bool*

**RETURNS:**

A boolean value indicating whether the current role exists or not

**EXCEPTIONS:**

*None*

## Examples{#examples}

```python
from pymilvus import Role, utility

# Get a role
role = Role(name="test")

# Check whether the role exists
role.is_exist()
```

## Related operations{#related-operations}

The following operations are related to `is_exist()`:

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

