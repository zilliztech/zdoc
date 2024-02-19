---
displayed_sidbar: pythonSidebar
slug: /python/CollectionSchema-add_field
beta: false
notebook: false
token: TG3Rd9aM5offvFxKy2CcKXn9nWc
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# add_field()

This operation adds a field to the schema of a collection.

```python
pymilvus.CollectionSchema.add_field(
    field_name: str,
    datatype: DataType
)
```

The following operations are related to `add_field()`:

- FieldSchema

- CollectionSchema

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import DataType, FieldSchema, CollectionSchema

# Define fields to create a schema
primary_key = FieldSchema(
    name="string",
    dtype=DataType.INT64,
    is_primary=True
)

vector = FieldSchema(
    name="string",
    dtype=DataType.FLOAT_VECTOR,
    dim=int
)

schema = CollectionSchema(
    fields=[primary_key, vector]
)

# Add a Boolean field to the schema
schema.add_field(
    field_name="string",
    datatype=DataType.BOOL
)
```

**PARAMETERS:**

- **field_name** (*string*) - 

    **[REQUIRED]**

    The name of the field.

- **datatype** (*enum*) - 

    **[REQUIRED]**

    The data type of the field.

    You can choose from the following options when selecting a data type for different fields:

    - Primary key field: Use **DataType.INT64** or **DataType.VARCHAR**.

    - Scalar fields: Choose from a variety of options, including **DataType.BOOL**, **DataType.INT8**, **DataType.INT16**, **DataType.INT32**, **DataType.INT64**, **DataType.FLOAT**, **DataType.DOUBLE**, **DataType.VARCHAR**, **DataType.JSON**, and **DataType.ARRAY**.

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

A **CollectionSchema** object containing the name of the field that has been added to the schema.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import DataType, FieldSchema, CollectionSchema

# Define fields to create a schema
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

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Add a scalar field to the schema
schema.add_field(
    field_name="scalar_01",
    datatype=DataType.INT32
)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}, {'name': 'scalar_01', 'description': '', 'type': <DataType.INT32: 4>}]}
```
