---
title: "FieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A FieldSchema instance defines one field of a collection schema. | Python | MilvusClient"
type: docx
token: OD8mdC5aXo0XHbxSthRczioXnaf
sidebar_position: 1
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - FieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldSchema

A FieldSchema instance defines one field of a collection schema.

## Request Syntax\{#request-syntax}

```python
__init__(
    raw: Any
)
```

**PARAMETERS:**

- **name** (*str*) -

    **[REQUIRED]**

    The name of the field.

- **dtype** (*[DataType](./Collections-DataType)*) -

    **[REQUIRED]**

    The data type of the field.

- **description** (*str*) -

    The description of the field.

- **kwargs** (*Any*) -

    Additional field options.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import FieldSchema, DataType

field = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=128,
)
```
