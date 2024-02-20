---
displayed_sidbar: pythonSidebar
slug: /python/FieldSchema-construct_from_dict
beta: false
notebook: false
token: DCLUdOpVjohl8HxPUx1cGjokngf
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

This operation constructs a FieldSchema object from a dictionary representation.

```python
pymilvus.FieldSchema.construct_from_dict(
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
from pymilvus import FieldSchema, DataType  

# Create a dictionary to pass to construct_from_dict 
field_dict = {   
    "name": "string",    
    "type": DataType,   
    "description": "string"
}  

# Construct a FieldSchema object from the dictionary
field = FieldSchema.construct_from_dict(field_dict)  

print(field) 
```

__PARAMETERS:__

- __raw__ (_dict_)

    A dictionary containing the raw data to construct the field schema.

__RETURN TYPE:__

_FieldSchema_

__RETURNS:__

A FieldSchema object.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import FieldSchema, DataType  

# Create a dictionary to pass to construct_from_dict 
field_dict = {   
    "name": "primary_key",    
    "type": DataType.INT64,   
    "description": "test_field_schema"
}  

# Construct a FieldSchema object from the dictionary
field = FieldSchema.construct_from_dict(field_dict)  

print(field)

# Output
# {'name': 'primary_key', 'description': 'test_field_schema', 'type': <DataType.INT64: 5>}
```
