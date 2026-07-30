---
title: "list_volumes() | Python"
slug: /python/python/VolumeManager-list_volumes
sidebar_label: "list_volumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此函数列出项目下的卷，支持分页以及按卷类型进行可选筛选。 | Python"
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

此函数列出项目下的卷，支持分页以及按卷类型进行可选筛选。

## 请求语法\{#request-syntax}

```python
volume_manager.list_volumes(
    project_id: str,
    current_page: int = 1,
    page_size: int = 10,
    volume_type: str | None = None,
)
```

**参数：**

- **project_id** (*str*) -

    **[必需]**

    要查询的项目 ID。

- **current_page** (*int*) -

    要查询的页码。

- **page_size** (*int*) -

    每页返回的记录数。

- **volume_type** (*str*) -

    卷类型的可选筛选条件。支持的值为 `MANAGED` 和 `EXTERNAL`。

**返回类型：**
*requests.Response*

返回分页的卷列表。

包含卷列表结果的 HTTP 响应。

**异常：**

- **MilvusException**

    当列表请求失败时抛出。

## 示例\{#examples}

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
