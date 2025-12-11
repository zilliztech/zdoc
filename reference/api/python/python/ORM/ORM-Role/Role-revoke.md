---
title: "revoke() | Python | ORM"
slug: /python/python/Role-revoke
sidebar_label: "revoke()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation revokes a privilege granted to the current role. | Python | ORM"
type: docx
token: UUJWdoEnjoXx69xahsScdMVSnzf
sidebar_position: 10
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - revoke()
  - pymilvus26
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke()

This operation revokes a privilege granted to the current role.

## Request Syntax\{#request-syntax}

```python
revoke(
    object: str,
    object_name: str,
    privilege: str,
    db_name: str
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
    <li><p>When <code>object</code> is set to <code>Global</code>, setting <code>privilege</code> to <code>\*</code> is not equivalent to setting it to <code>All</code>. The <code>All</code> privilege includes all permissions, including any collection and user object.</p></li>
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

## Examples\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(role_name)

# Grant a privilege to the current role 
role.revoke("Collection", collection_name, "Insert")
```

## Related operations\{#related-operations}

The following operations are related to `revoke()`:

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

