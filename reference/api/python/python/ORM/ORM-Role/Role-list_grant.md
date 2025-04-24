---
displayed_sidbar: pythonSidebar
title: "list_grant() | Python | ORM"
slug: /python/python/Role-list_grant
sidebar_label: "list_grant()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation lists the relationship between the current role and the specified object. | Python | ORM"
type: docx
token: JXNXdQuwhoYmZQxSohNcdxtwnzh
sidebar_position: 7
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - list_grant()
  - pymilvus25
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_grant()

This operation lists the relationship between the current role and the specified object.

## Request Syntax{#request-syntax}

```python
list_grant(
    object: str,
    object_name: str,
    db_name: str
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

## Related operations{#related-operations}

The following operations are related to `get_replicas()`:

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

