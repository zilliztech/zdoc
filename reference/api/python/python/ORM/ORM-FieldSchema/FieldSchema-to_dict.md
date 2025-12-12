---
title: "to_dict() | Python | ORM"
slug: /python/python/FieldSchema-to_dict
sidebar_label: "to_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation converts a FieldSchema object to a dictionary representation. | Python | ORM"
type: docx
token: G1gsdGWwuoPOPrxJdABcfa76nUd
sidebar_position: 3
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus26
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
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

**PARAMETERS:**

None

**RETURN TYPE:**

*dict*

**RETURNS:**

The dictionary representation of the field schema.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

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

