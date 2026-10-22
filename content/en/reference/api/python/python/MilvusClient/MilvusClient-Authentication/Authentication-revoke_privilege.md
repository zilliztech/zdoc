---
title: "revoke_privilege() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_privilege
sidebar_label: "revoke_privilege()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation revokes a privilege previously granted to a role on a specific object. Use this method to restrict a role's access to a particular resource. | Python | MilvusClient"
type: docx
token: QWmhdTWWao6UH4xnS0sc4WJfnzg
sidebar_position: 22
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - revoke_privilege()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke_privilege()

This operation revokes a privilege previously granted to a role on a specific object. Use this method to restrict a role's access to a particular resource.

<Admonition type="info" title="Note">

This method replaces the previous revoke_privileges() (plural). The behavior is identical.

</Admonition>

## Request Syntax\{#request-syntax}

```python
client.revoke_privilege(
    role_name: str,
    object_type: str,
    privilege: str,
    object_name: str,
    db_name: str = "",
    timeout: float = None
)
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role from which to revoke the privilege.

- **object_type** (*str*) -

    **[REQUIRED]**

    The type of the object on which the privilege was granted. Valid values include "Collection", "Global", and "User".

- **privilege** (*str*) -

    **[REQUIRED]**

    The name of the privilege to revoke. Refer to the Milvus documentation for a full list of supported privileges.

- **object_name** (*str*) -

    **[REQUIRED]**

    The name of the object on which the privilege was granted. Use "&ast;" to denote all objects of the specified type.

- **db_name** (*str*) -

    The name of the database. Defaults to the current database if not specified.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when the role does not exist, the privilege is invalid, or the server encounters an error. This exception will be raised when the role does not exist, the privilege is invalid, or the server encounters an error.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Revoke insert privilege on a collection from a role
client.revoke_privilege(
    role_name="readOnly",
    object_type="Collection",
    privilege="Insert",
    object_name="my_collection"
)
```
