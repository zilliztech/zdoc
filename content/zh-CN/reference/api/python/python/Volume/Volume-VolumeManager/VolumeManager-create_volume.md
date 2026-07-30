---
title: "create_volume() | Python"
slug: /python/python/VolumeManager-create_volume
sidebar_label: "create_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此函数在项目和区域中创建一个新的 Zilliz Cloud volume，支持托管或外部 volume 配置。 | Python"
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

此函数在项目和区域中创建一个新的 Zilliz Cloud volume，支持托管或外部 volume 配置。

## 请求语法\{#request-syntax}

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

**参数：**

- **project_id** (*str*) -

    **[必需]**

    拥有该 volume 的项目 ID。

- **region_id** (*str*) -

    **[必需]**

    创建 volume 的区域 ID。

- **volume_name** (*str*) -

    **[必需]**

    volume 的名称。

- **volume_type** (*str*) -

    volume 类型。支持的值为 `MANAGED` 和 `EXTERNAL`。如果省略，则使用 `MANAGED`。

- **storage_integration_id** (*str*) -

    Storage Integration ID。当 `volume_type="EXTERNAL"` 时为必需。

- **path** (*str*) -

    外部存储的路径。如果设置，必须以 `/` 结尾。

**返回类型：**
*requests.Response*

返回 volume 创建响应。

来自 create volume API 的 HTTP 响应。

**异常：**

- **MilvusException**

    当 volume 创建失败时引发。

## 示例\{#examples}

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
