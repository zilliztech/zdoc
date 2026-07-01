---
title: "commit() | Python"
slug: /python/python/VolumeBulkWriter-commit
sidebar_key: python/VolumeBulkWriter-commit
sidebar_label: "commit()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation persists the buffered data to local files and uploads them to the remote volume configured in the VolumeBulkWriter instance. | Python"
type: docx
token: RwmUdNd0WoQ75zxrCndcal6HnXT
sidebar_position: 2
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# commit()

This operation persists the buffered data to local files and uploads them to the remote volume configured in the VolumeBulkWriter instance.

## Request Syntax\{#request-syntax}

```python
VolumeBulkWriter.commit(
    **kwargs
)
```

**PARAMETERS:**

- **_async** (*bool*) -

    Whether to flush the buffer asynchronously.

    If set to `True`, the flush operation runs in a background thread and the method returns immediately. If set to `False` (default), the method blocks until the flush completes.

- **call_back** (*Callable[[List[str]], List[str]]*) -

    An optional callback function invoked after the local files are flushed. In VolumeBulkWriter, this callback is used internally to upload files to the remote volume.

**RETURN TYPE:**

*None*

This method does not return a value.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the flush or upload operation fails.

## Examples\{#examples}

```python
from pymilvus.bulk_writer.volume_bulk_writer import VolumeBulkWriter
from pymilvus import CollectionSchema, FieldSchema, DataType

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=128),
]
schema = CollectionSchema(fields, "example_collection")

writer = VolumeBulkWriter(
    schema=schema,
    remote_path="/data/bulk_import",
    cloud_endpoint="https://your-cloud-endpoint.zillizcloud.com",
    api_key="your-api-key",
    volume_name="my-volume",
)

# Append data
for i in range(1000):
    writer.append_row({"id": i, "vector": [0.1] * 128})

# Commit and upload to remote volume
writer.commit()

print(f"Files uploaded to: {writer.data_path}")
```
