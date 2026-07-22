---
title: "create_volume() | Python"
slug: /python/python/VolumeManager-create_volume
sidebar_label: "create_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "Adds project/region and external-volume parameters. | Python"
type: docx
token: GtNKdyeDCoPxQXxvohIcYQ47nee
sidebar_position: 1
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - create_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_volume()

Adds project/region and external-volume parameters.

## Request Syntax\{#request-syntax}

```python
create_volume(
    project_id: str,
    region_id: str,
    volume_name: str,
    volume_type: Optional[str] = None,
    storage_integration_id: Optional[str] = None,
    path: Optional[str] = None,
) -> requests.Response
```

**PARAMETERS:**

- **project_id** (*str*) -
**[REQUIRED]**
The ID of the Zilliz Cloud project in which to create the volume.

- **region_id** (*str*) -
**[REQUIRED]**
The ID of the Zilliz Cloud region in which to create the volume.

- **volume_name** (*str*) -
**[REQUIRED]**
The name of the volume to create.

- **volume_type** (*Optional[str]*) -
Default: `None`
The volume type. Supported values are `MANAGED` and `EXTERNAL`; the default is `MANAGED`.

- **storage_integration_id** (*Optional[str]*) -
Default: `None`
The storage integration ID required for an `EXTERNAL` volume.

- **path** (*Optional[str]*) -
Default: `None`
The storage path for an `EXTERNAL` volume. When omitted, the storage integration root is used; a supplied path must end with `/`.

**RETURN TYPE:**

*requests.Response*

**RETURNS:**

HTTP response describing the volume creation request.

**EXCEPTIONS:**

- **MilvusException**
Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

The example demonstrates create volume usage.

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
