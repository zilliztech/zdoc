---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "VolumeBulkWriter 用于将本地批量文件写入远程卷。| Python"
type: docx
token: L9ozd33RroJ0NZxHUc0czKjpnbh
sidebar_position: 3
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeBulkWriter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

VolumeBulkWriter 用于将本地批量文件写入远程卷。

## 请求语法\{#request-syntax}

```python
VolumeBulkWriter(
    schema: CollectionSchema,
    remote_path: str,
    cloud_endpoint: str,
    api_key: str,
    volume_name: str,
    chunk_size: int = 1024 * MB,
    file_type: BulkFileType = BulkFileType.PARQUET,
    config: Optional[dict] = None,
    connect_type: ConnectType = ConnectType.AUTO,
    **kwargs,
)
```

**参数：**

- **schema** (*CollectionSchema*) -<br/>
  **[必填]**<br/>
  用于验证数据行并生成批量文件的 Collection Schema。

- **remote_path** (*str*) -<br/>
  **[必填]**<br/>
  目标卷中用于上传已提交文件的目录。

- **cloud_endpoint** (*str*) -<br/>
  **[必填]**<br/>
  Zilliz Cloud API 服务器 Endpoint，即 `https://api.cloud.zilliz.com`。

- **api_key** (*str*) -<br/>
  **[必填]**<br/>
  用于向 Zilliz Cloud 进行身份验证的 API 密钥。

- **volume_name** (*str*) -<br/>
  **[必填]**<br/>
  目标 Zilliz Cloud 卷的名称。

- **chunk_size** (*int*) -<br/>
  默认值：`1024 * MB`<br/>
  写入器开始写入新文件前允许的最大本地分块大小（以字节为单位）。

- **file_type** ([BulkFileType](./DataImport-BulkFileType)) -<br/>
  默认值：`BulkFileType.PARQUET`<br/>
  写入器生成的批量文件格式。

- **config** (*Optional[dict]*) -<br/>
  默认值：`None`<br/>
  可选的写入器配置。

- **connect_type** (*ConnectType*) -<br/>
  默认值：`ConnectType.AUTO`<br/>
  卷操作所使用的连接模式。

- **kwargs** (*Any*) -<br/>
  传递给 `LocalBulkWriter` 的额外选项。

**返回类型：**

*VolumeBulkWriter*

**返回值：**

一个写入器对象，用于在本地暂存批量文件，并将已提交的文件上传至指定的 Zilliz Cloud 卷。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以获取具体的失败原因。

## 示例\{#examples}

以下示例演示了 VolumeBulkWriter 的使用方法。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
