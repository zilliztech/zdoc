---
title: "list_volumes() | Python"
slug: /python/python/VolumeManager-list_volumes
sidebar_label: "list_volumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all volumes within a specific project in a paginated manner. | Python"
type: docx
token: E5uudOLJ3o1BIhx4LLoctf8TnLf
sidebar_position: 3
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - list_volumes()
  - pymilvus26
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_volumes()

This operation lists all volumes within a specific project in a paginated manner.

## Request Syntax\{#request-syntax}

```python
list_volumes(
    project_id: str,
    current_page: int,
    page_size: int
)
```

**PARAMETERS**

- **project_id** (*str*) -

    **[REQUIRED]**

    The ID of the project to which the volume to be created belongs.

- **current_page** (*int*) -

    The current page of the volume lists. When specified, only the volumes on the specified page will be returned.

    This parameter is optional and its value defaults to `1`, indicating that the first page will be returned.

- **page_size** (*int*) -

    The  page  size of the volume lists.  When specified, only the specified number of volumes will be returned.

    This parameter is optional and its value defaults to `10`, indicating that a list of up to 10 volumes will be returned.

**RETURN TYPE**

An object.

**RETURNS**

An object with the following data structure:

```json
{
    "count": 1,
    "currentPage": 1,
    "pageSize": 10,
    "volumes": [
        {
            "volumeName": "my_volume"
        }        
    ]
}
```

**PARAMETERS**

- **count** (*int*) -

    The total number of volumes found.

- **currentPage** (*int*) -

    The current page.

- **pageSize** (*int*) -

    The maximum number of volumes per page.

- **volumes** (*list*) -

    A volume list.

    - **volumeName** (*str*) -

        The name of a volume.

## Example\{#example}

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)

volume_list = volume_manager.list_volumes(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx"
)

print(f"\nlistVolumes results: \n", volume_list.json()['data'])

# listVolumes results: 
# 
# {
#     "count": 1,
#     "currentPage": 1,
#     "pageSize": 10,
#     "volumes": [
#         {
#             "volumeName": "my_volume"
#         }        
#     ]
# }
```

