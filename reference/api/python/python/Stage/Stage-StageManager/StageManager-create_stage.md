---
displayed_sidbar: pythonSidebar
title: "create_stage() | Python"
slug: /python/python/StageManager-create_stage
sidebar_label: "create_stage()"
beta: false
notebook: false
description: "This operation creates a stage. | Python"
type: docx
token: HWYXdlaGIoTNVUx34GycfwjAnrb
sidebar_position: 1
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - create_stage()
  - pymilvus25
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_stage()

This operation creates a stage.

## Request Syntax{#request-syntax}

```python
create_stage(
    project_id: str,
    region_id: str,
    stage_name: str
)
```

**PARAMETERS**

- **project_id** (*str*) -

    **&#91;REQUIRED&#93;**

    The ID of the project to which the stage to be created belongs.

- **region_id** (*str*) -

    **&#91;REQUIRED&#93;**

    The ID of the cloud region in which the stage will be created. You can use [List Cloud Regions](/reference/restful/list-cloud-regions-v2) to view possible values.

- **stage_name** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of the stage to create.

**RETURN TYPE**

*None*

**RETURNS**

None

## Example{#example}

```python
from pymilvus.bulk_writer.stage_manager import StageManager

stage_manager = StageManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)

stage_manager.create_stage(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx", 
    region_id="aws-us-west-1", 
    stage_name="my_stage"
)

print(f"\nStage my_stage created")

# Stage my_stage created
```

