---
title: "list_stages() | Python"
slug: /python/python/StageManager-list_stages
sidebar_label: "list_stages()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all stages within a specific project in a paginated manner. | Python"
type: docx
token: E5uudOLJ3o1BIhx4LLoctf8TnLf
sidebar_position: 3
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - list_stages()
  - pymilvus25
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_stages()

This operation lists all stages within a specific project in a paginated manner.

## Request Syntax{#request-syntax}

```python
list_stages(
    project_id: str,
    current_page: int,
    page_size: int
)
```

**PARAMETERS**

- **project_id** (*str*) -

    **&#91;REQUIRED&#93;**

    The ID of the project to which the stage to be created belongs.

- **current_page** (*int*) -

    The current page of the stage lists. When specified, only the stages on the specified page will be returned.

    This parameter is optional and its value defaults to `1`, indicating that the first page will be returned.

- **page_size** (*int*) -

    The name of the stage to create. When specified, only the specified number of stages will be returned.

    This parameter is optional and its value defaults to `10`, indicating that a list of up to 10 stages will be returned.

**RETURN TYPE**

An object.

**RETURNS**

An object with the following data structure:

```json
{
    "count": 1,
    "currentPage": 1,
    "pageSize": 10,
    "stages": [
        {
            "stageName": "my_stage"
        }        
    ]
}
```

**PARAMETERS**

- **count** (*int*) -

    The total number of stages found.

- **currentPage** (*int*) -

    The current page.

- **pageSize** (*int*) -

    The maximum number of stages per page.

- **stages** (*list*) -

    A stage list.

    - **stageName** (*str*) -

        The name of a stage.

## Example{#example}

```python
from pymilvus.bulk_writer.stage_manager import StageManager

stage_manager = StageManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)

stage_list = stage_manager.list_stages(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx"
)

print(f"\nlistStages results: \n", stage_list.json()['data'])

# listStages results: 
# 
# {
#     "count": 1,
#     "currentPage": 1,
#     "pageSize": 10,
#     "stages": [
#         {
#             "stageName": "my_stage"
#         }        
#     ]
# }
```

