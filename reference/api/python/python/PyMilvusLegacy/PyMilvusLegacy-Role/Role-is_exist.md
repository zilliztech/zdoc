---
displayed_sidbar: pythonSidebar
slug: /python/Role-is_exist
beta: false
notebook: false
token: F8WOdIoz4okn5OxMEymcXNuRnkb
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# is_exist()

This operation checks whether the current role exists.

```python
pymilvus.Role.is_exist()
```

The following operations are related to `is_exist()`:

- Role

- create()

- grant()

- drop()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Role

# Specify role name
role = Role(role_name="string")

# Check if this role exists
role.is_exist()
```

__PARAMETERS:__

N/A

__RETURN TYPE:__

_bool_

__RETURNS:__

A boolean value indicating whether the current role exists or not

__EXCEPTIONS:__

_None_

## Examples{#examples}

```python
from pymilvus import Role, utility

# Get a role
role = Role(name="test")

# Check whether the role exists
role.is_exist()
```

