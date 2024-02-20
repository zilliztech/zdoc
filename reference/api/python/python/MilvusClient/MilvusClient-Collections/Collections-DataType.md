---
displayed_sidbar: pythonSidebar
slug: /python/Collections-DataType
beta: false
notebook: false
token: JiN3dU8zwoPdgBxxpw6c0JkUnze
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# DataType

This is an enumeration that provides the following constants.

## Constants{#constants}

- NONE = 0
Sets the data type to __NoneType__.

- BOOL = 1
Sets the data type to __Boolean__.

- INT8 = 2
Sets the data type to __Int8__.

- INT16 = 3
Sets the data type to __Int64__.

- INT32 = 4
Sets the data type to __Int32__.

- INT64 = 5
Sets the data type to __Int64__.

- FLOAT = 10
Sets the data type to __Float__.

- DOUBLE = 11
Sets the data type to __Double__.

- STRING = 20
Sets the data type to __String__.

- VARCHAR = 21
Sets the data type to __Varchar__.

- ARRAY = 22
Sets the data type to __Array__.

- JSON = 23
Sets the data type to __JSON__.

- BINARY_VECTOR = 100
Sets the data type to __Binary Vector__.

- FLOAT_VECTOR = 101
Sets the data type to __Float Vector__.

- UNKNOWN = 999
Sets the data type to __Unknown__.

## Example{#example}

```python
from pymilvus import FieldSchema, DataType

# Sets the data type to Int8
field_int8 = FieldSchema(
    name="field_int8",
    # highlight-next
    dtype=DataType.INT8
)

# Sets the data type to Varchar
field_varchar = FieldSchema(
    name="field_varchar",
    # highlight-start
    dtype=DataType.VARCHAR,
    max_length=512 # Required attribute for a VARCHAR field.
    # highlight-end
)

# Sets the data type to Float Vector
field_float_vector = FieldSchema(
    name="field_float_vector",
    # highlight-start
    dtype=DataType.FLOAT_VECTOR,
    dim=768 # Required attribute for a FLOAT_VECTOR field.
    # highlight-end
)

# Sets the data type to Binary Vector
field_float_vector = FieldSchema(
    name="field_float_vector",
    # highlight-start
    dtype=DataType.BINARY_VECTOR,
    dim=128 # Required attribute for a BINARY_VECTOR field.
    # highlight-end
)

# Sets the data type to JSON
field_json = FieldSchema(
    name="field_json",
    # highlight-next
    dtype=DataType.JSON
)

# Sets the data type to Array
field_json = FieldSchema(
    name="field_json",
    # highlight-next
    dtype=DataType.ARRAY
)
```
