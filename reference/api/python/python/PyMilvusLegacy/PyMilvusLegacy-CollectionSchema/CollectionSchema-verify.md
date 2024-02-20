---
displayed_sidbar: pythonSidebar
slug: /python/CollectionSchema-verify
beta: false
notebook: false
token: KSECdBDcUoIkL7xI4KOc29Ukn1g
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# verify()

This operation performs final validation checks on the CollectionSchema to detect any obvious problems.

```python
pymilvus.CollectionSchema.verify()
```

The following operations are related to `verify()`:

- FieldSchema

- CollectionSchema

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType  

# Create field schemas

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

# Create a CollectionSchema with field schemas
schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Call verify() to validate the schema 
schema.verify()
```

__PARAMETERS:__

None

__RETURN TYPE:__

None

__RETURNS:__

None

__EXCEPTIONS:__

- __MilvusException__

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

# Call verify() to validate the schema 
schema.verify()
```
