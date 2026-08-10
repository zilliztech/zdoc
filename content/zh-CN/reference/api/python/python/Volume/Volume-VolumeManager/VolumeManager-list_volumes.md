---
title: "list_volumes() | Python"
slug: /python/python/VolumeManager-list_volumes
sidebar_label: "list_volumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "添加 projectid 和 volumetype 过滤。 | Python"
type: docx
token: SyiHdehPHoO4l4x11tqcjzpOnLd
sidebar_position: 4
keywords: 
  - openai 向量数据库
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - list_volumes()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_volumes()

添加 project_id 和 volume_type 过滤。

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
  **[REQUIRED]**<br/>
  要列出其卷的 Zilliz Cloud 项目 ID。

- **current_page** (*int*) -<br/>
  默认值：`1`<br/>
  要返回的页码，从 1 开始。

- **page_size** (*int*) -<br/>
  默认值：`10`<br/>
  每页返回的最大卷数。

- **volume_type** (*Optional[str]*) -<br/>
  默认值：`None`<br/>
  用于筛选结果的卷类型。支持的值为 `MANAGED` 和 `EXTERNAL`。

**返回类型：**

*requests.Response*

**返回值：**

包含该项目一页卷信息的 HTTP 响应。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝该请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败详情。

## 示例\{#examples}

该示例演示了 list volumes 的用法。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
