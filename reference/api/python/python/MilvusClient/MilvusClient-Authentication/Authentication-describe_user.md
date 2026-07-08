---
title: "describe_user() | Python | MilvusClient"
slug: /python/python/Authentication-describe_user
sidebar_label: "describe_user()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the roles assigned to a user and the user description. | Python | MilvusClient"
type: docx
token: TwTnduPOioywHDx8hPQc80tRnKg
sidebar_position: 6
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - describe_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_user()

This operation returns the roles assigned to a user and the user description.

## Request Syntax\{#request-syntax}

```python
describe_user(
    user_name: str,
    timeout: Optional[float] = None
) -> dict
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of the user to describe.

- **timeout** (*float*) -

    The timeout duration for this operation.

**RETURN TYPE:**

*dict*

A dictionary that contains `user_name`, `roles`, and `description`.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **ParamError**

    This exception will be raised when a parameter value is invalid.

## Examples\{#examples}

```python
user_info = client.describe_user(user_name="analyst_user")
print(user_info["roles"])
print(user_info["description"])
```
