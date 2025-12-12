---
title: "append_row() | Python"
slug: /python/python/RemoteBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation appends records to the writer. | Python"
type: docx
token: F1MFdP8VvoMu17x4Vg9cH6ztnqb
sidebar_position: 1
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - pymilvus26
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# append_row()

This operation appends records to the writer.

## Request syntax\{#request-syntax}

```python
append_row(
    row: dict
)
```

**PARAMETERS:**

- **row** (*dict*) -

    A dictionary representing an entity to be appended.

    The keys and their values in the dictionary should match the schema referenced in the current **LocalBulkWriter**.

## Examples\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType
from pymilvus.bulk_writer import RemoteBulkWriter, BulkFileType

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
```

## Related classes and methods\{#related-classes-and-methods}

- [commit()](./RemoteBulkWriter-commit)

- [AzureConnectParam](./RemoteBulkWriter-AzureConnectParam)

- [S3ConnectParam](./RemoteBulkWriter-S3ConnectParam)

