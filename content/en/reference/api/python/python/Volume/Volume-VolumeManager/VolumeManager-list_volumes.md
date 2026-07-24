---
title: "list_volumes() | Python"
slug: /python/python/VolumeManager-list_volumes
sidebar_label: "list_volumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "This function lists volumes under a project with pagination and optional filtering by volume type. | Python"
type: docx
token: SyiHdehPHoO4l4x11tqcjzpOnLd
sidebar_position: 4
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - list_volumes()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_volumes()

This function lists volumes under a project with pagination and optional filtering by volume type.

## Request Syntax\{#request-syntax}

```python
volume_manager.list_volumes(
    project_id: str,
    current_page: int = 1,
    page_size: int = 10,
    volume_type: str | None = None,
)
```

**PARAMETERS:**

- **project_id** (*str*) -

    **[REQUIRED]**

    Project ID to query.

- **current_page** (*int*) -

    Page number to query.

- **page_size** (*int*) -

    Number of records returned per page.

- **volume_type** (*str*) -

    Optional filter for volume type. Supported values are `MANAGED` and `EXTERNAL`.

**RETURN TYPE:**
*requests.Response*

Returns a paginated volume list.

HTTP response containing volume list results.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the list request fails.

## Examples\{#examples}

```python
from pymilvus.bulk_writer import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
)

resp = volume_manager.list_volumes(
    project_id="proj-xxx",
    current_page=1,
    page_size=20,
    volume_type="EXTERNAL",
)

print(resp.json())
```
