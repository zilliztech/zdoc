---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "添加连接和本地输出路径行为。 | Python"
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

添加连接和本地输出路径行为。

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
  **[必需]**<br/>
  用于验证行数据并生成批量文件的集合 schema。

- **remote_path** (*str*) -<br/>
  **[必需]**<br/>
  已提交文件上传到目标 volume 中的目录。

- **cloud_endpoint** (*str*) -<br/>
  **[必需]**<br/>
  Zilliz Cloud API 服务器端点，即 `https://api.cloud.zilliz.com`。

- **api_key** (*str*) -<br/>
  **[必需]**<br/>
  用于向 Zilliz Cloud 进行身份验证的 API 密钥。

- **volume_name** (*str*) -<br/>
  **[必需]**<br/>
  目标 Zilliz Cloud volume 的名称。

- **chunk_size** (*int*) -<br/>
  默认值：`1024 * MB`<br/>
  在 writer 开始新文件之前，本地分块的最大大小（以字节为单位）。

- **file_type** ([BulkFileType](./DataImport-BulkFileType)) -<br/>
  默认值：`BulkFileType.PARQUET`<br/>
  writer 生成的批量文件格式。

- **config** (*Optional[dict]*) -<br/>
  默认值：`None`<br/>
  可选的 writer 配置。

- **connect_type** (*ConnectType*) -<br/>
  默认值：`ConnectType.AUTO`<br/>
  用于 volume 操作的连接模式。

- **kwargs** (*Any*) -<br/>
  转发给 `LocalBulkWriter` 的附加选项。

**返回类型：**

*VolumeBulkWriter*

**返回：**

一个先在本地暂存批量文件，并将已提交文件上传到已配置 Zilliz Cloud volume 的 writer。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败详情。

## 示例\{#examples}

以下示例演示了 VolumeBulkWriter 的用法。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
