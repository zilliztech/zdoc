---
displayed_sidbar: pythonSidebar
slug: /python/CollectionSchema-construct_from_dict
beta: false
notebook: false
token: DYuUdc503o1TANxuGozcXhCmnRN
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

This operation constructs a **CollectionSchema** object from a dictionary representation.

```python
pymilvus.CollectionSchema.construct_from_dict(
    raw: dict
)
```

The following operations are related to `construct_from_dict()`:

- FieldSchema

- CollectionSchema

- to_dict()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType  

# Define field schemas  
primary_key = FieldSchema(
    name="string",
    dtype=DataType.INT64,
    is_primary=True,
)
 
vector = FieldSchema(
    name="string",
    dtype=DataType.FLOAT_VECTOR,
    dim=int,
) 

# Create dictionary representation 
schema_dict = {
    "fields": [     
        primary_key.to_dict(),
        vector.to_dict()                
    ]
}  

# Reconstruct schema from dictionary 
schema = CollectionSchema.construct_from_dict(raw=schema_dict)  
```

**PARAMETERS:**

- **raw** (*dict*)

    A dictionary containing the raw data to construct the collection schema.

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

A **CollectionSchema** object.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import DataType, FieldSchema, CollectionSchema

# Define fields and create a schema
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

# Create dictionary representation 
schema_dict = {
    "fields": [     
        primary_key.to_dict(),
        vector.to_dict()                
    ]
}  

# Reconstruct schema from dictionary 
schema = CollectionSchema.construct_from_dict(schema_dict)  
# schema is now a CollectionSchema instance reconstructed from the dictionary 
print(schema)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}]}
```
