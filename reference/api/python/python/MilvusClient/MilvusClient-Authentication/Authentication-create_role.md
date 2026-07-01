---
title: "create_role() | Python | MilvusClient"
slug: /python/python/Authentication-create_role
sidebar_key: python/Authentication-create_role
sidebar_label: "create_role()"
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a role for role-based access control. | Python | MilvusClient"
type: docx
token: HRqudGOOnokInhxczclcADBDn8g
sidebar_position: 3
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - create_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_role()

This operation creates a role for role-based access control.

## Request Syntax\{#request-syntax}

```python
create_role(
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to create.

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
client.create_role(role_name="analytics_reader")
```
