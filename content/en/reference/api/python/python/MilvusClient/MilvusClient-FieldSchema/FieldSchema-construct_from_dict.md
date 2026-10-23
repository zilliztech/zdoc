---
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/FieldSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation constructs a FieldSchema object from a dictionary representation. | Python | MilvusClient"
type: docx
token: ASRmddh2eo3Q4axtV3RcLfvmnYU
sidebar_position: 2
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - construct_from_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

This operation constructs a FieldSchema object from a dictionary representation.

<Admonition type="info" title="Note">

This is a class method. You should call it from the class instead of an instance of the class as follows: FieldSchema.construct_from_dict()

</Admonition>

## Request Syntax\{#request-syntax}

This is a class method. You should call it from the class instead of an instance of the class as follows: FieldSchema.construct_from_dict()

```python
construct_from_dict(
```

<Admonition type="info" title="Notes">

This is a class method. You should call it from the class instead of an instance of the class as follows:

`FieldSchema.construct_from_dict()`

</Admonition>

**PARAMETERS:**

- **raw** (*dict*) -

    A dictionary containing the raw data to construct the field schema.

**RETURN TYPE:**

*[FieldSchema](./MilvusClient-FieldSchema)*

**RETURNS:**

A FieldSchema object.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation. This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

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
