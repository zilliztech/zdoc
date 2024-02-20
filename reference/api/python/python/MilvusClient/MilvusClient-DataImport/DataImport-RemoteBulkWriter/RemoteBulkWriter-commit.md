---
displayed_sidbar: pythonSidebar
slug: /python/RemoteBulkWriter-commit
beta: false
notebook: false
token: VccVd4MTgoPzCixDVtgcEoKWnPf
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# commit()

This operation commits the appended data.

```python
pymilvus.RemoteBulkWriter.commit(
    **kwargs
)
```

## Request Syntax{#request-syntax}

```python
from pymilvus import CollectionSchema, RemoteBulkWriter, BulkFileType

writer = RemoteBulkWriter(
    schema=CollectionSchema(),
    remote_path="string",
    connect_param=RemoteBulkWriter.ConnectParam()
    segment_size=512*1024*1024,
    file_type=BulkFileType.NPY
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
    RemoteBulkWriter, 
    DataType, 
    BulkFileType
)

# Set up a schema
schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=5),
    ]
)

# Set up bucket connection parameters
connect_param = RemoteBulkWriter.ConnectParam(
    endpoint="storage.googleapis.com", # use 's3.amazonaws.com' for AWS
    access_key="ACCESS_KEY",
    secret_key="SECRET_KEY",
    bucket_name="BUCKET_NAME",
    secure=True,
)

# Set up a remote bulk writer
writer = RemoteBulkWriter(
    schema=schema,
    connect_param=connect_param,
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

