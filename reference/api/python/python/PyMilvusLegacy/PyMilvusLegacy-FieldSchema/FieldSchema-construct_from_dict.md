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

## Request Syntax{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

<Admonition type="info" icon="📘" title="Notes">

<p>This is a class method. You should call it from the class instead of an instance of the class as follows:</p>
<p><code>FieldSchema.construct_from_dict()</code></p>

</Admonition>

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

## Related operations{#related-operations}

The following operations are related to `construct_from_dict()`:

- [to_dict()](./FieldSchema-to_dict)

