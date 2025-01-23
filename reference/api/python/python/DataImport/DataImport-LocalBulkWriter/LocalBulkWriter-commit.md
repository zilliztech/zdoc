---
displayed_sidbar: pythonSidebar
title: "commit() | Python"
slug: /python/python/LocalBulkWriter-commit
sidebar_label: "commit()"
beta: false
notebook: false
description: "This operation commits the appended data. | Python"
type: docx
token: EtBDdoGaFo3bOExKxCHcKgpenib
sidebar_position: 2
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - pymilvus25
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# commit()

This operation commits the appended data.

## Request syntax{#request-syntax}

```python
pymilvus.LocalBulkWriter.commit(
    **kwargs
)
```

**PARAMETERS:**

- **kwargs** -

    - **call_back** (function)

        A callback function to call after this operation is completed.

        The value defaults to **None**, indicating no callback is there to call. Use this to add post-commit actions.

## Examples{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType
from pymilvus.bulk_writer import LocalBulkWriter, BulkFileType

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

## Related methods{#related-methods}

- [append_row()](./LocalBulkWriter-append_row)

