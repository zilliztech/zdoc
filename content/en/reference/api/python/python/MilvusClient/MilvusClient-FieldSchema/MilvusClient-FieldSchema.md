---
title: "FieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Defines a field's name, data type, description, and additional schema options. | Python | MilvusClient"
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

Defines a field's name, data type, description, and additional schema options.

## Request Syntax\{#request-syntax}

```python
FieldSchema(
    name: str,
    dtype: DataType,
    description: str = "",
    **kwargs
)
```

**PARAMETERS:**

- **name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  Name of the field.

- **dtype** ([DataType](./Collections-DataType)) -<br/>
  **[REQUIRED]**<br/>
  Data type of the field.

- **description** (*str*) -<br/>
  Default: `""`<br/>
  Description of the field.

- **kwargs** (*Any*) -<br/>
  Additional field options.

**RETURN TYPE:**

*FieldSchema*

**RETURNS:**

Field schema instance containing the configured data type, constraints, default, and nullable metadata.

**EXCEPTIONS:**

- **MilvusException**<br/>
  Raised when supplied field options are invalid. Inspect the exception message for the invalid data type or field constraint.

## Examples\{#examples}

Creates field definitions for a collection schema.

```python
from pymilvus import CollectionSchema, DataType, FieldSchema

schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=3),
])
print(schema)
```
