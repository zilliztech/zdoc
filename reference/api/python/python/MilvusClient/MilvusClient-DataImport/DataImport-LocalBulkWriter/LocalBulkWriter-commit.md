---
displayed_sidbar: pythonSidebar
slug: /python/LocalBulkWriter-commit
beta: false
notebook: false
token: EtBDdoGaFo3bOExKxCHcKgpenib
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# commit()

This operation commits the appended data.

```python
pymilvus.LocalBulkWriter.commit(
    **kwargs
)
```

## Request Syntax{#request-syntax}

```python
from pymilvus import CollectionSchema, LocalBulkWriter, BulkFileType

writer = LocalBulkWriter(
    schema=CollectionSchema,
    local_path="string",
    segment_size=int,
    file_type=BulkFileType,
)

writer.commit()
```

__PARAMETERS:__

- __kwargs__ -

    - __call_back__ (function)

        A callback function to call after this operation is completed.

        The value defaults to __None__, indicating no callback is there to call. Use this to add post-commit actions.

## Examples{#examples}

```python
from pymilvus import (
    CollectionSchema, 
    FieldSchema, 
    LocalBulkWriter, 
    DataType, 
    BulkFileType
)

# Set up a schema
schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=5),
    ]
)

# Set up a local bulk writer
writer = LocalBulkWriter(
    schema=schema,
    local_path="/tmp/output",
)

# Append a row to the writer
writer.append_row(
    {"id": 0, "vector": [0.1, 0.4, -0.8, -0.2, 0.4]}
)

# Commit the appended data
def callback():
    print("Commit completes")

writer.commit(call_back=callback)
```
