---
displayed_sidbar: pythonSidebar
title: "append_row() | Python"
slug: /python/python/LocalBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
notebook: false
description: "This operation appends records to the writer. | Python"
type: docx
token: WCxIdVwCpoIaMUxbabWcSRCkn2g
sidebar_position: 1
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - pymilvus25
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# append_row()

This operation appends records to the writer.

## Request syntax{#request-syntax}

```python
append_row(
    row: dict
)
```

**PARAMETERS:**

- **row** (*dict*) -

    A dictionary representing an entity to be appended.

    The keys and their values in the dictionary should match the schema referenced in the current **LocalBulkWriter**.

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
```

## Related methods{#related-methods}

- [commit()](./LocalBulkWriter-commit)

