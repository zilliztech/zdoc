---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将指定源路径下的本地文件上传至指定托管卷内的目标文件路径。 | Python"
type: docx
token: SAR6dnlmmohi30x0x2KcioyXnib
sidebar_position: 1
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - upload_file_to_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upload_file_to_volume()

此操作将指定源路径下的本地文件上传至指定托管卷内的目标文件路径。

<Admonition type="info" icon="📘" title="Notes">

此功能仅适用于托管卷。外部卷为只读。

</Admonition>

## 请求语法\{#request-syntax}

```python
upload_file_to_volume(
    source_file_path: str,
    target_volume_path: str,
    upload_concurrency: int = 5,
    max_retries: int = 5,
    retry_interval: float = 5.0,
    progress_callback: Callable[[UploadProgress], None] | None = None,
    part_size: int = 0,
) -> dict
```

**参数：**

- **source_file_path** (*str*) -<br/>
  **[必填]**<br/>
  待上传的本地文件或目录路径。

- **target_volume_path** (*str*) -<br/>
  **[必填]**<br/>
  Zilliz Cloud 卷中的目标路径。

- **upload_concurrency** (*int*) -<br/>
  默认值：`5`<br/>
  允许并发上传的最大文件数。

- **max_retries** (*int*) -<br/>
  默认值：`5`<br/>
  每个文件的最大上传重试次数。

- **retry_interval** (*float*) -<br/>
  默认值：`5.0`<br/>
  两次上传尝试之间的间隔时间（秒）。

- **progress_callback** (*Callable[[UploadProgress], None] | None*) -<br/>
  默认值：`None`<br/>
  用于接收上传进度快照的回调函数。

- **part_size** (*int*) -<br/>
  默认值：`0`<br/>
  分片上传的分片大小（字节）。使用 `0` 可自动选择合适的大小。

**返回类型：**

*dict*

**返回值：**

包含 volumeName、volume_name 及上传目标路径的字典。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以了解具体的失败原因。

## 示例\{#examples}

以下示例演示了如何将文件上传至卷。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
