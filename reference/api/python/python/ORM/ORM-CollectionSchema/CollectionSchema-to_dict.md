---
title: "to_dict() | Python | ORM"
slug: /python/python/CollectionSchema-to_dict
sidebar_label: "to_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation converts a CollectionSchema object to a dictionary representation. | Python | ORM"
type: docx
token: GfTadfqhAo64XDxc643ci4Zwnwb
sidebar_position: 4
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus25
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_dict()

This operation converts a CollectionSchema object to a dictionary representation.

## Request Syntax{#request-syntax}

```python
to_dict()
```

**PARAMETERS:**

None

**RETURN TYPE:**

*dict*

**RETURNS:**

The dictionary representation of the collection schema.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

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
    dim=768,
)

# Create a CollectionSchema with field schemas

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Call to_dict() to get a dictionary representation of the schema 

schema_dict = schema.to_dict()  
print(schema_dict)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}]}
```

## Related operations{#related-operations}

The following operations are related to `to_dict()`:

- [FieldSchema](./ORM-FieldSchema)

- [DataType](./Collections-DataType)

- [add_field()](./CollectionSchema-add_field)

- [construct_from_dict()](./CollectionSchema-construct_from_dict)

- [verify()](./CollectionSchema-verify)

