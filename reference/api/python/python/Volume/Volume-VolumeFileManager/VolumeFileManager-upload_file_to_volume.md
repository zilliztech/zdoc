---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "This operation uploads the local file at the specified source path to the target file path within the specified volume. | Python"
type: docx
token: Fr3rdPTuXoC0Lzx7urIcwBqWnDb
sidebar_position: 1
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - upload_file_to_volume()
  - pymilvus26
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upload_file_to_volume()

This operation uploads the local file at the specified source path to the target file path within the specified volume.

## Request Syntax\{#request-syntax}

```python
upload_file_to_volume(
    source_file_path: str,
    target_volume_path: str
)
```

**PARAMETERS**

- **source_file_path** (*str*) -

    **[REQUIRED]**

    The path to the local data file to be uploaded to the specified volume.

- **target_volume_path** (*str*) -

    **[REQUIRED]**

    The path to the data file within the specified volume after this operation.

**RETURN TYPE**

An object.

**RETURNS**

An object with the following data structure:

```json
{
    "volumeName": "my_volume",
    "path": "path/to/your/data/file/in/the/volume"
}
```

- **volumeName** (*str*) -

    **[REQUIRED]**

    The name of the target volume of this operation.

- **path** (*str*) -

    **[REQUIRED]**

    The path to the data file within the specified volume after this operation.

## Example\{#example}

```python
from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager

volume_file_manager = VolumeFileManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    volume_name="my_volume"
)

result = volume_file_manager.upload_file_to_volume(
    source_file_path="/path/to/your/local/data/file", 
    target_volume_path="data/"
)

print(f"\nuploadFileToVolume results\n: {result}")

# target_volume_path results: 
# 
# {
#     "volumeName": "my_volume",
#     "path": "data/"
# }
```
