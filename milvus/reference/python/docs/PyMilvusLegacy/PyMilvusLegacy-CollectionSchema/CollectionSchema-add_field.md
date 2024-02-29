---
displayed_sidbar: pythonSidebar
slug: /python/CollectionSchema-add_field
beta: false
notebook: false
type: docx
token: TG3Rd9aM5offvFxKy2CcKXn9nWc
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# add_field()

This operation adds a field to the schema of a collection.

## Request Syntax{#request-syntax}

```python
add_field(
    field_name: str,
    datatype: DataType
)
```

__PARAMETERS:__

- __field_name__ (_string_) - 

    __[REQUIRED]__

    The name of the field.

- __datatype__ (_[DataType](./Collections-DataType)_) - 

    __[REQUIRED]__

    The data type of the field.

    You can choose from the following options when selecting a data type for different fields:

    - Primary key field: Use __DataType.INT64__ or __DataType.VARCHAR__.

    - Scalar fields: Choose from a variety of options, including 

        - __DataType.BOOL__,

        - __DataType.INT8__,

        - __DataType.INT16__,

        - __DataType.INT32__,

        - __DataType.INT64__,

        - __DataType.FLOAT__,

        - __DataType.DOUBLE__,

        - __DataType.VARCHAR__,

        - __DataType.JSON__, and

        - __DataType.ARRAY__.

    - Vector fields: Select __DataType.BINARY_VECTOR__ or __DataType.FLOAT_VECTOR__.

- __is_primary__ (_bool_) -

    Whether the current field is the primary field in a collection.

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>Each collection has only one primary field.</p></li>
    <li><p>A primary field should be of either the <strong>DataType.INT64</strong> type or the <strong>DataType.VARCHAR</strong> type.</p></li>
    </ul>

    </Admonition>

- __max_length__ (_int_) -

    The maximum length of the field value.

    This is mandatory for a __DataType.VARCHAR__ field.

- __element_type__ (_str_) -

    The data type of the elements in the field value.

    This is mandatory for a __DataType.Array__ field.

- __dim__ (_int_) 

    The dimension of the vector embeddings.

    This is mandatory for a __DataType.FLOAT_VECTOR__ field or a __DataType.BINARY_VECTOR__ field.

__RETURN TYPE:__

_[CollectionSchema](./PyMilvusLegacy-CollectionSchema)_

__RETURNS:__

A __CollectionSchema__ object contains the fields that have been added to the schema.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import DataType, FieldSchema, CollectionSchema

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Add the primary key field
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True
)

# Add the vector field
schema.add_field(
    field_name="vector",
    datatype=FLOAT_VECTOR,
    dim=768
)

# Add a scalar field to the schema
schema.add_field(
    field_name="scalar_01",
    datatype=DataType.INT32
)

# {
#     'auto_id': False, 
#     'description': '', 
#     'fields': [
#         {
#             'name': 'id', 
#             'description': '', 
#             'type': <DataType.INT64: 5>, 
#             'is_primary': True, 
#             'auto_id': False
#         }, 
#         {
#             'name': 'vector', 
#             'description': '', 
#             'type': <DataType.FLOAT_VECTOR: 101>, 
#             'params': {'dim': 768}
#        }, 
#        {
#             'name': 'scalar_01', 
#             'description': '', 
#             'type': <DataType.INT32: 4>
#        }
#     ]
# }
```

## Related operations{#related-operations}

The following operations are related to `add_field()`:

- [FieldSchema](./PyMilvusLegacy-FieldSchema)

- [DataType](./Collections-DataType)

- [construct_from_dict()](./CollectionSchema-construct_from_dict)

- [to_dict()](./CollectionSchema-to_dict)

- [verify()](./CollectionSchema-verify)

