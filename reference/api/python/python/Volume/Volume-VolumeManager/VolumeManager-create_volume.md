---
title: "create_volume() | Python"
slug: /python/python/VolumeManager-create_volume
sidebar_label: "create_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "This function creates a new Zilliz Cloud volume in a project and region, with support for managed or external volume configuration. | Python"
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

This function creates a new Zilliz Cloud volume in a project and region, with support for managed or external volume configuration.

## Request Syntax\{#request-syntax}

```python
volume_manager.create_volume(
    project_id: str,
    region_id: str,
    volume_name: str,
    volume_type: str | None = None,
    storage_integration_id: str | None = None,
    path: str | None = None,
)
```

**PARAMETERS:**

- **project_id** (*str*) -

    **[REQUIRED]**

    Project ID that owns the volume.

- **region_id** (*str*) -

    **[REQUIRED]**

    Region ID where the volume is created.

- **volume_name** (*str*) -

    **[REQUIRED]**

    Name of the volume.

- **volume_type** (*str*) -

    Volume type. Supported values are `MANAGED` and `EXTERNAL`. If omitted, `MANAGED` is used.

- **storage_integration_id** (*str*) -

    Storage Integration ID. Required when `volume_type="EXTERNAL"`.

- **path** (*str*) -

    Path for external storage. If set, it must end with `/`.

**RETURN TYPE:**
*requests.Response*

Returns the volume creation response.

HTTP response from the create volume API.

**EXCEPTIONS:**

- **MilvusException**

    Raised when volume creation fails.

## Examples\{#examples}

```python
from pymilvus.bulk_writer import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
)

resp = volume_manager.create_volume(
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    volume_name="books-volume",
    volume_type="EXTERNAL",
    storage_integration_id="integ-xxx",
    path="book-data/",
)

print(resp.json())
```
