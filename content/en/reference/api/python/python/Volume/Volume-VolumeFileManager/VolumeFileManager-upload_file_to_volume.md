---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation uploads the local file at the specified source path to the target file path within the specified managed volume. | Python"
type: docx
token: MDzcdn1cIoX5Xtx3vo9cjSeLnT4
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

This operation uploads the local file at the specified source path to the target file path within the specified managed volume.

<Admonition type="info" title="Notes">

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
    upload_policy: UploadPolicy = UploadPolicy.SKIP_IF_SAME_SIZE,
    temporary_directory: str | None = None
)
```

**PARAMETERS:**

- **source_file_path** (*str*) -

    **[REQUIRED]**

    The path to the local data file to be uploaded to the specified volume.

- **target_volume_path** (*str*) -

    **[REQUIRED]**

    The path to the data file within the specified volume after this operation.

- **upload_concurrency** (*int*) -

    The maximum number of files uploaded in parallel. Defaults to 5.

- **max_retries** (*int*) -

    The maximum number of additional attempts per file after a failure. Defaults to 5.

- **retry_interval** (*float*) -

    The interval between retry attempts, in seconds. Defaults to 5.0.

- **progress_callback** (*Callable[[UploadProgress], None] | None*) -

    A callback that receives throttled upload progress snapshots during the upload.

- **part_size** (*int*) -

    The size of each uploaded part, in bytes. Defaults to 0, which lets the SDK decide.

- **upload_policy** (*UploadPolicy*) -

    The policy that decides whether an existing remote file can be skipped. Defaults to UploadPolicy.SKIP_IF_SAME_SIZE.

- **temporary_directory** (*str | None*) -

    The directory for temporary upload state. Defaults to None, which lets the SDK choose.

**RETURN TYPE:**

*dict*

**RETURNS:**

A dictionary with the target volume name and the final path of the uploaded file within the volume.

**PARAMETERS:**

- **volumeName** (*str*) -

    The name of the target volume of this operation.

- **path** (*str*) -

    The path to the data file within the specified volume after this operation.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus.bulk_writer import VolumeFileManager

manager = VolumeFileManager(
    bucket_name="my-bucket",
)
progress = manager.upload_file_to_volume(
    local_path="./data.parquet",
    volume_path="import/data.parquet",
)
print(progress.uploaded_bytes)
```
