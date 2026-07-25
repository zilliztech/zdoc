---
displayed_sidbar: pythonSidebar
title: "delete_volume() | Python"
slug: /python/python/VolumeManager-delete_volume
sidebar_label: "delete_volume()"
added_since: false
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation deletes a volume. | Python"
type: docx
token: FbzLd0f5ToAPRdxa8XWcWfUwnwe
sidebar_position: 2
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - delete_volume()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# delete_volume()

This operation deletes a volume.

## Request Syntax

```python
delete_volume(
    volume_name: str
)
```

**PARAMETERS**

- **volume_name** (*str*) -

    **[REQUIRED]**

    The name of the volume to delete.

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

volume_manager.delete_volume(
    volume_name="my_volume"
)

print(f"\nVolume my_volume deleted")

# Volume my_volume deleted
```

