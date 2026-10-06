---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A VolumeBulkWriter instance writes local data as files to a Zilliz Cloud volume for bulk import. | Python"
type: docx
token: KOiCdsfhvoyfgdxbzbFcZOHmnXf
sidebar_position: 3
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeBulkWriter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

A VolumeBulkWriter instance writes local data as files to a Zilliz Cloud volume for bulk import.

## Request Syntax\{#request-syntax}

```python
VolumeBulkWriter(
    schema: CollectionSchema,
    remote_path: str,
    cloud_endpoint: str,
    api_key: str,
    volume_name: str,
    chunk_size: int = 1024 * MB,
    file_type: BulkFileType = BulkFileType.PARQUET,
    config: Optional[dict] = None,
    connect_type: ConnectType = ConnectType.AUTO,
    **kwargs,
)
```

**PARAMETERS:**

- **schema** (*CollectionSchema*) -

    The schema of the collection that the bulk files are written for.

- **remote_path** (*str*) -

    The remote directory path in the volume that the committed bulk files are uploaded to.

- **cloud_endpoint** (*str*) -

    The endpoint of the Zilliz Cloud volume.

- **api_key** (*str*) -

    The credential used to authenticate to the Zilliz Cloud volume.

- **volume_name** (*str*) -

    The name of the Zilliz Cloud volume that receives the committed files.

- **chunk_size** (*int*) -

    The maximum size of a single local bulk file, in bytes. Defaults to 1024 &ast; MB.

- **file_type** ([BulkFileType](./DataImport-BulkFileType)) -

    The file format of the local bulk files. Defaults to BulkFileType.PARQUET.

- **config** (*Optional[dict]*) -

    A dictionary of additional writer configuration for the local bulk writer.

- **connect_type** (*ConnectType*) -

    The connection mode used to reach the volume. Defaults to ConnectType.AUTO.

**RETURN TYPE:**

*VolumeBulkWriter*

**RETURNS:**

A writer that stages bulk files locally and uploads committed files to the configured Zilliz Cloud volume. The following are the methods of the returned instance.

**METHODS:**

- [append_row](./VolumeBulkWriter-append_row) (*method*) -

    The method that writes one row into the local buffer. Call it repeatedly before commit.

- [commit](./VolumeBulkWriter-commit) (*method*) -

    The method that seals the staged local bulk files and uploads them to the configured volume.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus.bulk_writer import VolumeBulkWriter, UploadPolicy

writer = VolumeBulkWriter(
    bucket_name="my-bucket",
    path="s3://my-bucket/import",
    upload_policy=UploadPolicy.SKIP_IF_EXISTS,
)
writer.append_row(
    {"id": 1, "vector": [0.1, 0.2]},
)
writer.commit()
```
