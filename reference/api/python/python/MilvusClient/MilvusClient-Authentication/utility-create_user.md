---
title: "create_user() | Python | MilvusClient"
slug: /python/python/utility-create_user
sidebar_key: python/utility-create_user
sidebar_label: "create_user()"
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
beta: NEAR DEPRECATE
notebook: false
description: "This operation creates a user with a password. | Python | MilvusClient"
type: docx
token: EglSdm1jkozDSlxq6SEc4CRonVe
sidebar_position: 4
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - create_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_user()

This operation creates a user with a password.

## Request Syntax\{#request-syntax}

```python
create_user(
    user_name: str,
    password: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of the user to create.

- **password** (*str*) -

    **[REQUIRED]**

    The password for the user.

- **timeout** (*float*) -

    The timeout duration for this operation.

**RETURN TYPE:**

*None*

This operation returns no value.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **ParamError**

    This exception will be raised when a parameter value is invalid.

## Examples\{#examples}

```python
client.create_user(
    user_name="analyst_user",
    password="P@ssw0rd!",
)
```
