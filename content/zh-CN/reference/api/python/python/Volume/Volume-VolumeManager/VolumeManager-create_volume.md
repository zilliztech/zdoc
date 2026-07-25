---
displayed_sidbar: pythonSidebar
title: "create_volume() | Python"
slug: /python/python/VolumeManager-create_volume
sidebar_label: "create_volume()"
added_since: false
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a volume. | Python"
type: docx
token: HWYXdlaGIoTNVUx34GycfwjAnrb
sidebar_position: 1
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - create_volume()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_volume()

This operation creates a volume.

## Request Syntax

```python
create_volume(
    project_id: str,
    region_id: str,
    volume_name: str
)
```

**PARAMETERS**

- **project_id** (*str*) -

    **[REQUIRED]**

    The ID of the project to which the volume to be created belongs.

- **region_id** (*str*) -

    **[REQUIRED]**

    The ID of the cloud region in which the volume will be created. You can use [List Cloud Regions](/reference/restful/list-cloud-regions-v2) to view possible values.

- **volume_name** (*str*) -

    **[REQUIRED]**

    The name of the volume to create.

**RETURN TYPE**

*None*

**RETURNS**

None

## Example

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com.cn",
    api_key="YOUR_API_KEY"
)

volume_manager.create_volume(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx", 
    region_id="ali-cn-hangzhou", 
    volume_name="my_volume"
)

print(f"\Volume my_volume created")

# Volume my_volume created
```

