---
title: "remove_user() | Python | ORM"
slug: /python/python/Role-remove_user
sidebar_label: "remove_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes a user from the current role. Once removed, the user will lose the permissions allowed for the current role. | Python | ORM"
type: docx
token: SlmSdaD7rocMJsxThNHcOtEknVd
sidebar_position: 9
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - remove_user()
  - pymilvus26
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_user()

This operation removes a user from the current role. Once removed, the user will lose the permissions allowed for the current role.

## Request Syntax\{#request-syntax}

```python
remove_user(
    username: str
)
```

**PARAMETERS:**

- **username** (*str*) -

    **[REQUIRED]**

    The name of the user to remove from a role.

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
role = Role(name=role_name)

# Remove the specified user from the current role
role.remove_user(username)

# List all users of the current role
users = role.get_users()
```

## Related operations\{#related-operations}

The following operations are related to `add_user()`:

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

