---
displayed_sidbar: pythonSidebar
slug: /python/Role-list_grants
beta: false
notebook: false
token: YRoGdgQmWoIEaJx84ICcHTILnMe
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# list_grants()

This operation lists all privileges granted to the current role.

```python
pymilvus.Role.list_grants(
    db_name: str
)
```

The following operations are related to `get_replicas()`:

- Role

- grant()

- list_grant()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Role

# Get an existing role
role=Role(name="string")

# List all privileges granted to the current role.

res=list_grant(
    db_name: str
)
```

**PARAMETERS:**

- **db_name** (*str*)

    The name of a database in which Zilliz Cloud carries out this operation.

    If the specified database does not exist, an empty result returns.

**RETURN TYPE:**

*GrantInfo*

**RETURNS:**

A **GrantInfo** object that contains a list of **GrantItem** objects.

```python
├── GrantInfo
│   └── groups  
│       └── GrantItem
│           ├── object
│           ├── object_name
│           ├── role_name
│           ├── grantor_name
│           ├── privilege
│           └── db_name
```

The **GrantItem** objects contains the following fields:

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="root")

# List all privileges granted to the current role.
res = list_grants(
    db_name="test_db"
)
```
