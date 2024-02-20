---
displayed_sidbar: pythonSidebar
slug: /python/LocalBulkWriter-append_row
beta: false
notebook: false
token: WCxIdVwCpoIaMUxbabWcSRCkn2g
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# append_row()

This operation appends records to the writer.

```python
pymilvus.Collection.append_row(
    row: dict
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

writer.append_row(row=dict)
```

__PARAMETERS:__

- __row__ (_dict_) -

    A dictionary representing an entity to be appended.

    The keys and their values in the dictionary should match the schema referenced in the current __LocalBulkWriter__.

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
```
