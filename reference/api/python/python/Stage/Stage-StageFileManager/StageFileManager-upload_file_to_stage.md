---
title: "upload_file_to_stage() | Python"
slug: /python/python/StageFileManager-upload_file_to_stage
sidebar_label: "upload_file_to_stage()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation uploads the local file at the specified source path to the target file path within the specified stage. | Python"
type: docx
token: Fr3rdPTuXoC0Lzx7urIcwBqWnDb
sidebar_position: 2
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - upload_file_to_stage()
  - pymilvus25
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upload_file_to_stage()

This operation uploads the local file at the specified source path to the target file path within the specified stage.

## Request Syntax{#request-syntax}

```python
upload_file_to_stage(
    source_file_path: str,
    target_stage_path: str
)
```

**PARAMETERS**

- **source_file_path** (*str*) -

    **&#91;REQUIRED&#93;**

    The path to the local data file to be uploaded to the specified stage.

- **target_stage_path** (*str*) -

    **&#91;REQUIRED&#93;**

    The path to the data file within the specified stage after this operation.

**RETURN TYPE**

An object.

**RETURNS**

An object with the following data structure:

```json
{
    "stageName": "my_stage",
    "path": "path/to/your/data/file/in/the/stage"
}
```

- **stageName** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of the target stage of this operation.

- **path** (*str*) -

    **&#91;REQUIRED&#93;**

    The path to the data file within the specified stage after this operation.

## Example{#example}

```python
from pymilvus.bulk_writer.stage_file_manager import StageFileManager

stage_file_manager = StageFileManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    stage_name="my_stage"
)

result = stage_file_manager.upload_file_to_stage(
    source_file_path="/path/to/your/local/data/file", 
    target_stage_path="data/"
)

print(f"\nuploadFileToStage results\n: {result}")

# uploadFileToStage results: 
# 
# {
#     "stageName": "my_stage",
#     "path": "data/"
# }
```
