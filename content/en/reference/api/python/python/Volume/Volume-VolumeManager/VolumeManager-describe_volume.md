---
title: "describe_volume() | Python"
slug: /python/python/VolumeManager-describe_volume
sidebar_label: "describe_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns detailed information about a specific volume. | Python"
type: docx
token: MwfQdhukeoxOh0xPLySc0wJjn5f
sidebar_position: 3
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_volume()

This operation returns detailed information about a specific volume.

## Request Syntax\{#request-syntax}

```python
describe_volume(
    volume_name: str,
) -> requests.Response
```

**PARAMETERS:**

- **volume_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  The name of the Zilliz Cloud volume to describe.

**RETURN TYPE:**

*requests.Response*

**RETURNS:**

HTTP response containing details for the requested volume.

**EXCEPTIONS:**

- **MilvusException**<br/>
  Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

The example demonstrates describe volume usage.

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
