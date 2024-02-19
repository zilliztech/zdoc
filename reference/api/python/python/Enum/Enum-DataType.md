---
displayed_sidbar: pythonSidebar
slug: /python/Enum-DataType
beta: false
notebook: false
token: JiN3dU8zwoPdgBxxpw6c0JkUnze
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# DataType

This is an enumeration that provides the following constants.

## Constants{#constants}

- NONE = 0
Sets the data type to **NoneType**.

- BOOL = 1
Sets the data type to **Boolean**.

- INT8 = 2
Sets the data type to **Int8**.

- INT16 = 3
Sets the data type to **Int64**.

- INT32 = 4
Sets the data type to **Int32**.

- INT64 = 5
Sets the data type to **Int64**.

- FLOAT = 10
Sets the data type to **Float**.

- DOUBLE = 11
Sets the data type to **Double**.

- STRING = 20
Sets the data type to **String**.

- VARCHAR = 21
Sets the data type to **Varchar**.

- ARRAY = 22
Sets the data type to **Array**.

- JSON = 23
Sets the data type to **JSON**.

- BINARY_VECTOR = 100
Sets the data type to **Binary Vector**.

- FLOAT_VECTOR = 101
Sets the data type to **Float Vector**.

- UNKNOWN = 999
Sets the data type to **Unknown**.

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
