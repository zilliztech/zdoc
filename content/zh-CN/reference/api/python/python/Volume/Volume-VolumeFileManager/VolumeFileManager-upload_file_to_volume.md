---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作将指定源路径下的本地文件上传至指定托管卷内的目标文件路径。 | Python"
type: docx
token: MDzcdn1cIoX5Xtx3vo9cjSeLnT4
sidebar_position: 1
keywords: 
  - 图像相似度搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - zilliz
  - zilliz cloud
  - 云
  - upload_file_to_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# upload_file_to_volume()

此操作将指定源路径下的本地文件上传至指定托管卷内的目标文件路径。

<Admonition type="info" title="Notes">

此操作仅适用于托管卷。外部卷为只读。

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
    upload_policy: UploadPolicy = UploadPolicy.SKIP_IF_SAME_SIZE,
    temporary_directory: str | None = None
)
```

**参数：**

- **source_file_path** （*str*） -

    **[必需]**

    待上传到指定卷的本地数据文件路径。

- **target_volume_path** （*str*） -

    **[必需]**

    此操作完成后，数据文件在指定卷内的路径。

- **upload_concurrency** （*int*） -

    并行上传的最大文件数。该值默认为 5。

- **max_retries** （*int*） -

    每个文件在失败后额外尝试的最大次数。该值默认为 5。

- **retry_interval** （*float*） -

    重试尝试之间的间隔时间，单位为秒。该值默认为 5.0。

- **progress_callback** （*Callable[[UploadProgress], None] | None*） -

    在上传期间接收经过节流的上传进度快照的回调。

- **part_size** （*int*） -

    每个上传分片的大小，以字节为单位。该值默认为 0，由 SDK 决定。

- **upload_policy** （*UploadPolicy*） -

    用于决定是否可以跳过现有远程文件的策略。该值默认为 UploadPolicy.SKIP_IF_SAME_SIZE。

- **temporary_directory** （*str | None*） -

    用于存放临时上传状态的目录。该值默认为 None，由 SDK 选择。

**返回类型：**

*dict*

**返回：**

一个字典，包含目标卷名称以及上传文件在卷中的最终路径。

**参数：**

- **volumeName** （*str*） -

    此操作的目标卷名称。

- **path** （*str*） -

    此操作完成后，数据文件在指定卷内的路径。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以了解确切的失败原因。

## 示例\{#examples}

```python
from pymilvus.bulk_writer import VolumeFileManager

manager = VolumeFileManager(
    bucket_name="my-bucket",
)
progress = manager.upload_file_to_volume(
    local_path="./data.parquet",
    volume_path="import/data.parquet",
)
print(progress.uploaded_bytes)
```
