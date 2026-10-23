---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/FieldSchema-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation converts a FieldSchema object to a dictionary representation. | Python | MilvusClient"
type: docx
token: DkqSdCSOJo5DI1xZ7z3cTZuUnAc
sidebar_position: 3
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_dict()

This operation converts a FieldSchema object to a dictionary representation.

## Request Syntax\{#request-syntax}

```python
to_dict()
```

**RETURN TYPE:**

*dict*

**RETURNS:**

The dictionary representation of the field schema.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation. This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

# Create field schemas  
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)
 
vector = FieldSchema(
    name="vector", 
    dtype=DataType.FLOAT_VECTOR,
    dim=768
)

# Get dictionary representation
primary_key_dict = primary_key.to_dict()
vector_dict = vector.to_dict()

print(primary_key_dict)
print(vector_dict)

# Output
# {'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}
# {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}
```
