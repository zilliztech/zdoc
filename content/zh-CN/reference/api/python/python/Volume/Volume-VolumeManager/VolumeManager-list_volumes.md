---
title: "list_volumes() | Python"
slug: /python/python/VolumeManager-list_volumes
sidebar_label: "list_volumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会分页列出项目下的存储卷。 | Python"
type: docx
token: SyiHdehPHoO4l4x11tqcjzpOnLd
sidebar_position: 4
keywords: 
  - OpenAI 向量 Database
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - list_volumes()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_volumes()

此操作会分页列出项目下的存储卷。

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

- **project_id** （*str*） -<br/>
  **[必需]**<br/>
  要列出其存储卷的 Zilliz Cloud 项目的 ID。

- **current_page** （*int*） -<br/>
  默认值：`1`<br/>
  要返回的页码，从 1 开始计数。

- **page_size** （*int*） -<br/>
  默认值：`10`<br/>
  每页返回的存储卷数量上限。

- **volume_type** （*Optional[str]*） -<br/>
  默认值：`None`<br/>
  用于筛选结果的存储卷类型。支持的值包括 `MANAGED` 和 `EXTERNAL`。

**返回类型：**

*requests.Response*

**返回：**

包含项目某一页存储卷的 HTTP 响应。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时引发。请查看服务器错误消息以获取确切的失败详情。

## 示例\{#examples}

以下示例演示了列出存储卷的用法。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
