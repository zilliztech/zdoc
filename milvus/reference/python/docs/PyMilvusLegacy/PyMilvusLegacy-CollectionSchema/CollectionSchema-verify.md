---
displayed_sidbar: pythonSidebar
slug: /python/CollectionSchema-verify
beta: false
notebook: false
type: docx
token: KSECdBDcUoIkL7xI4KOc29Ukn1g
sidebar_position: 5
---

# verify()

This operation performs final validation checks on the CollectionSchema to detect any obvious problems.

## Request Syntax{#request-syntax}

```python
verify()
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

## Related operations{#related-operations}

The following operations are related to `verify()`:

- [FieldSchema](./PyMilvusLegacy-FieldSchema)

- [DataType](./Collections-DataType)

- [add_field()](./CollectionSchema-add_field)

- [construct_from_dict()](./CollectionSchema-construct_from_dict)

- [to_dict()](./CollectionSchema-to_dict)

