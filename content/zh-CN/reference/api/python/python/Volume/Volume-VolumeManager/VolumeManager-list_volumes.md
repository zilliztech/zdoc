---
title: "list_volumes() | Python"
slug: /python/python/VolumeManager-list_volumes
sidebar_label: "list_volumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此操作以分页方式列出项目下的卷。 | Python"
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

此操作以分页方式列出项目下的卷。

## 请求语法\{#request-syntax}

```python
list_volumes(
    project_id: str,
    current_page: int = 1,
    page_size: int = 10,
    volume_type: Optional[str] = None,
) -> requests.Response
```

**参数：**

- **project_id** (*str*) -<br/>
  **[必需]**<br/>
  要列出卷的Zilliz Cloud项目 ID。

- **current_page** (*int*) -<br/>
  默认值：`1`<br/>
  要返回的页码（从 1 开始）。

- **page_size** (*int*) -<br/>
  默认值：`10`<br/>
  每页返回的最大卷数量。

- **volume_type** (*Optional[str]*) -<br/>
  默认值：`None`<br/>
  用于过滤结果的卷类型。支持的值为 `MANAGED` 和 `EXTERNAL`。

**返回类型：**

*requests.Response*

**返回值：**

包含该项目单页卷列表的 HTTP 响应。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以获取具体的失败详情。

## 示例\{#examples}

以下示例演示了 list volumes 的用法。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
