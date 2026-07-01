---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_key: python/Authentication-describe_role
sidebar_label: "describe_role()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the privileges granted to a role and the role description. | Python | MilvusClient"
type: docx
token: TYczdPuSNoV9lExR8iCcNIg9nGe
sidebar_position: 5
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_role()

This operation returns the privileges granted to a role and the role description.

## Request Syntax\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None
) -> dict
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to describe.

- **timeout** (*float*) -

    The timeout duration for this operation.

**RETURN TYPE:**

*dict*

A dictionary that contains `role`, `description`, and `privileges`.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **ParamError**

    This exception will be raised when a parameter value is invalid.

## Examples\{#examples}

```python
role_info = client.describe_role(role_name="analytics_reader")
print(role_info["description"])
print(role_info["privileges"])
```
