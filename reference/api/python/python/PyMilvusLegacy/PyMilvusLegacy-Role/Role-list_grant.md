---
displayed_sidbar: pythonSidebar
slug: /python/Role-list_grant
beta: false
notebook: false
token: JXNXdQuwhoYmZQxSohNcdxtwnzh
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# list_grant()

This operation lists the relationship between the current role and the specified object.

```python
pymilvus.Role.list_grant(
    object: str,
    object_name: str,
    db_name: str
)
```

The following operations are related to `get_replicas()`:

- Role

- grant()

- list_grants()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Role

# Get an existing role
role=Role(name="string")

# List the relationship between the current role and the specified object.
res=list_grant(
    object="string",
    object_name="string",
    db_name="str"
)
```

**PARAMETERS:**

- **object** (*str*)

    **[REQUIRED]**

    The type of the object to grant the privilege.

    The value is case-sensitive. For details, refer to Users & Roles.

- **object_name** (*str*)

    **[REQUIRED]**

    The name of a target object of the type specified in **object**.

    It can be a collection name, a user name, or a wild card (*).

- **db_name** (*str*)

    The name of a database the object belongs to. If left unspecified, the default database applies.

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

A **GrantItem** object contains the following fields:

- **object** (*str*)

    The type of the object to which the privilege belongs.

- **object_name** (*str*)

    The name of the object to which the role is granted the specified privilege.

- **role_name** (*str*)

    The name of the role to check.

- **grantor_name** (*str*）

    The name of the user who granted a specific role to a user.

- **privilege** (*str*)

    The privilege that is granted to the role.

- **db_name** (str)

    The name of the database in which this operation has been executed.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="root")

# List the relationship between the current role and the specified object.
res = list_grant(
    object="Collection",
    object_name="test_collection",
    db_name="test_db"
)
```

