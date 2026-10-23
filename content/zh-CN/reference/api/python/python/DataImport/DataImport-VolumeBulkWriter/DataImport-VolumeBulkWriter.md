---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "VolumeBulkWriter 实例会将本地数据以文件形式写入 Zilliz Cloud 卷，用于批量导入。 | Python"
type: docx
token: KOiCdsfhvoyfgdxbzbFcZOHmnXf
sidebar_position: 3
keywords: 
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - VolumeBulkWriter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

VolumeBulkWriter 实例会将本地数据以文件形式写入 Zilliz Cloud 卷，用于批量导入。

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

- **schema** （*CollectionSchema*） -

    批量文件要写入的 Collection 的 Schema。

- **remote_path** （*str*） -

    卷内用于上传已提交批量文件的远程目录路径。

- **cloud_endpoint** （*str*） -

    Zilliz Cloud 卷的 Endpoint。

- **api_key** （*str*） -

    用于向 Zilliz Cloud 卷进行身份验证的凭据。

- **volume_name** （*str*） -

    接收已提交文件的 Zilliz Cloud 卷的名称。

- **chunk_size** （*int*） -

    单个本地批量文件的最大大小，单位为字节。该值默认为 1024 &ast; MB。

- **file_type** （[BulkFileType](./DataImport-BulkFileType)） -

    本地批量文件的文件格式。该值默认为 BulkFileType.PARQUET。

- **config** （*Optional[dict]*） -

    用于本地批量写入器的附加写入器配置字典。

- **connect_type** （*ConnectType*） -

    用于连接卷的连接模式。该值默认为 ConnectType.AUTO。

**返回类型：**

*VolumeBulkWriter*

**返回：**

一个在本地暂存批量文件，并将已提交的文件上传到已配置 Zilliz Cloud 卷的写入器。以下是返回实例的方法。

**方法：**

- [append_row](./VolumeBulkWriter-append_row) （*method*） -

    将一行数据写入本地缓冲区的方法。在提交前，请重复调用此方法。

- [commit](./VolumeBulkWriter-commit) （*method*） -

    封存已暂存的本地批量文件，并将其上传到已配置卷的方法。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以了解确切的失败原因。

## 示例\{#examples}

```python
from pymilvus.bulk_writer import VolumeBulkWriter, UploadPolicy

writer = VolumeBulkWriter(
    bucket_name="my-bucket",
    path="s3://my-bucket/import",
    upload_policy=UploadPolicy.SKIP_IF_EXISTS,
)
writer.append_row(
    {"id": 1, "vector": [0.1, 0.2]},
)
writer.commit()
```
