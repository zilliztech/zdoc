---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "添加并发、重试、多部分大小、路径和进度回调控制。 | Python"
type: docx
token: SAR6dnlmmohi30x0x2KcioyXnib
sidebar_position: 1
keywords: 
  - 图像相似性搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - upload_file_to_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upload_file_to_volume()

添加并发、重试、多部分大小、路径和进度回调控制。

<Admonition type="info" icon="📘" title="Notes">

这仅适用于托管卷。外部卷为只读。

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
  **[REQUIRED]**<br/>
  要上传的本地文件或目录路径。

- **target_volume_path** (*str*) -<br/>
  **[REQUIRED]**<br/>
  Zilliz Cloud 卷中的目标路径。

- **upload_concurrency** (*int*) -<br/>
  默认值：`5`<br/>
  可并发上传的最大文件数。

- **max_retries** (*int*) -<br/>
  默认值：`5`<br/>
  每个文件的最大上传尝试次数。

- **retry_interval** (*float*) -<br/>
  默认值：`5.0`<br/>
  两次上传尝试之间的延迟时间（以秒为单位）。

- **progress_callback** (*Callable[[UploadProgress], None] | None*) -<br/>
  默认值：`None`<br/>
  使用上传进度快照调用的回调函数。

- **part_size** (*int*) -<br/>
  默认值：`0`<br/>
  多部分上传的分片大小，以字节为单位。使用 `0` 可自动选择大小。

**返回类型：**

*dict*

**返回：**

包含 volumeName、volume_name 和上传目标路径的字典。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败详情。

## 示例\{#examples}

以下示例演示如何使用上传文件到卷功能。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
