---
title: "delete_volume() | Python"
slug: /python/python/VolumeManager-delete_volume
sidebar_label: "delete_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于删除一个卷。 | Python"
type: docx
token: FbzLd0f5ToAPRdxa8XWcWfUwnwe
sidebar_position: 2
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - delete_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# delete_volume()

此操作用于删除一个卷。

## 请求语法\{#request-syntax}

```python
delete_volume(
    volume_name: str
)
```

**参数**

- **volume_name** (*str*) -

    **[必需]**

    要删除的卷名称。

**返回类型**

*None*

**返回**

None

## 示例\{#example}

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)

volume_manager.delete_volume(
    volume_name="my_volume"
)

print(f"\nVolume my_volume deleted")

# Volume my_volume deleted
```

