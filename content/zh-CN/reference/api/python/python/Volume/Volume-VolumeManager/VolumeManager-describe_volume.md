---
title: "describe_volume() | Python"
slug: /python/python/VolumeManager-describe_volume
sidebar_label: "describe_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取指定 volume 的详细信息。 | Python"
type: docx
token: MwfQdhukeoxOh0xPLySc0wJjn5f
sidebar_position: 3
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_volume()

此操作用于获取指定 volume 的详细信息。

## 请求语法\{#request-syntax}

```python
describe_volume(
    volume_name: str,
) -> requests.Response
```

**参数：**

- **volume_name** (*str*) -<br/>
  **[必填]**<br/>
  要查询的 Zilliz Cloud volume 名称。

**返回类型：**

*requests.Response*

**返回值：**

包含所请求 volume 详细信息的 HTTP 响应。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以了解具体的失败原因。

## 示例\{#examples}

以下示例展示了 describe volume 的用法。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
