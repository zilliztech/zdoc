---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "Adds concurrency, retry, multipart-size, path, and progress callback controls. | Python"
type: docx
token: SAR6dnlmmohi30x0x2KcioyXnib
sidebar_position: 1
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - upload_file_to_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upload_file_to_volume()

Adds concurrency, retry, multipart-size, path, and progress callback controls.

<Admonition type="info" icon="📘" title="Notes">

This applies only to managed volumes. External volumes are read-only.

</Admonition>

## Request Syntax\{#request-syntax}

```python
upload_file_to_volume(
    source_file_path: str,
    target_volume_path: str,
    upload_concurrency: int = 5,
    max_retries: int = 5,
    retry_interval: float = 5.0,
    progress_callback: Callable[[UploadProgress], None] | None = None,
    part_size: int = 0,
) -> dict
```

**PARAMETERS:**

- **source_file_path** (*str*) -<br/>
  **[REQUIRED]**<br/>
  The local file or directory path to upload.

- **target_volume_path** (*str*) -<br/>
  **[REQUIRED]**<br/>
  The destination path in the Zilliz Cloud volume.

- **upload_concurrency** (*int*) -<br/>
  Default: `5`<br/>
  The maximum number of files to upload concurrently.

- **max_retries** (*int*) -<br/>
  Default: `5`<br/>
  The maximum number of upload attempts for each file.

- **retry_interval** (*float*) -<br/>
  Default: `5.0`<br/>
  The delay, in seconds, between upload attempts.

- **progress_callback** (*Callable[[UploadProgress], None] | None*) -<br/>
  Default: `None`<br/>
  The callback invoked with upload progress snapshots.

- **part_size** (*int*) -<br/>
  Default: `0`<br/>
  The multipart upload part size, in bytes. Use `0` to select the size automatically.

**RETURN TYPE:**

*dict*

**RETURNS:**

Dictionary containing volumeName, volume_name, and the uploaded target path.

**EXCEPTIONS:**

- **MilvusException**<br/>
  Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

The example demonstrates upload file to volume usage.

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
