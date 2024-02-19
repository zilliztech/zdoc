---
displayed_sidbar: pythonSidebar
slug: /python/Role-revoke
beta: false
notebook: false
token: UUJWdoEnjoXx69xahsScdMVSnzf
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# revoke()

This operation revokes a privilege granted to the current role.

```python
pymilvus.Role.revoke(
    object: str,
    object_name: str,
    privilege: str,
    db_name: str
) 
```

The following operations are related to `revoke()`:

- Role

- grant()

- list_grant()

- list_grants()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Role

# Specify the role name
role = Role(
    role_name="string"
)

# Grant privilege to the current role
role.revoke(
    object="string",
    object_name="string",
    privilege="string",
    db_name="string"
)
```

**PARAMETERS:**

- **object** (*string*)

    **[REQUIRED]**

    The type of the object to grant the privilege.

    The value is case-sensitive. For details, refer to Users & Roles.

- **object_name** (*string*)

    **[REQUIRED]**

    The name of a target object of the type specified in **object**.

    It can be a collection name, a user name, or a wild card (*).

- **privilege** (*string*)

    **[REQUIRED]**

    The name of the privilege to grant.

    For details, refer to Users & Roles.

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>To grant all privileges to a kind of object, like <strong>Collection</strong>, <strong>Global</strong>, <strong>User</strong>, use <code>*</code> for privilege name.</p></li>
    <li><p>When <code>object</code> is set to <code>Global</code>, setting <code>privilege</code> to <code>*</code> is not equivalent to setting it to <code>All</code>. The <code>All</code> privilege includes all permissions, including any collection and user object.</p></li>
    </ul>

    </Admonition>

- **db_name** (*string*)

    The name of a database the object belongs to. If left unspecified, the default database applies.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(role_name)

# Grant a privilege to the current role 
role.revoke("Collection", collection_name, "Insert")
```

