---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "VolumeBulkWriter 实例会在本地将原始数据重写为 Zilliz Cloud 可识别的格式，然后将生成的文件上传到 Zilliz Cloud 中的远程卷。 | Python"
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

`VolumeBulkWriter` 实例会在本地将原始数据重写为 Zilliz Cloud 可识别的格式，然后将生成的文件上传到 Zilliz Cloud 中的远程卷。

```python
class pymilvus.bulk_writer.VolumeBulkWriter(LocalBulkWriter)
```

## 构造函数\{#constructor}

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
    **kwargs,
)
```

**参数：**

- **schema** (*[CollectionSchema](./MilvusClient-CollectionSchema)*) -

    **[必需]**

    要导入重写后数据的目标集合的 schema。

- **remote_path** (*str*) -

    **[必需]**

    远程卷中用于存放重写后数据的目录路径。

- **cloud_endpoint** (*str*) -

    **[必需]**

    Zilliz Cloud 实例的 endpoint URL。

- **api_key** (*str*) -

    **[必需]**

    用于对 Zilliz Cloud 实例进行身份验证的 API key。

- **volume_name** (*str*) -

    **[必需]**

    Zilliz Cloud 中用于上传文件的远程卷名称。

- **chunk_size** (*int*) -

    单个文件分片的最大大小。

    在重写原始数据时，Zilliz Cloud 会将数据分割成多个批次，并将每个批次存储在单独的文件中。

    默认值为 1,073,741,824 字节，即 1 GB。

- **file_type** (*[BulkFileType](./DataImport-BulkFileType)*) -

    输出文件的文件类型。

    默认值为 *BulkFileType.PARQUET*。

- **config** (*dict*) -

    bulk writer 的可选配置参数。

**说明**

`VolumeBulkWriter` 是一个上下文管理器，可在 `with` 语句中使用。当退出上下文时，本地工作目录会被清理。

## 属性\{#properties}

以下是 `VolumeBulkWriter` 类的属性。

- **data_path** (*str*)

    返回已上传文件的远程存储路径。

- **batch_files** (*List[List[str]]*)

    返回已上传文件批次的列表。每个内部列表包含单次提交中上传文件的远程路径。

## 示例\{#examples}

```python
from pymilvus.bulk_writer.volume_bulk_writer import VolumeBulkWriter
from pymilvus import CollectionSchema, FieldSchema, DataType

# 定义集合 schema
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=128),
]
schema = CollectionSchema(fields, "example_collection")

# 创建 VolumeBulkWriter
with VolumeBulkWriter(
    schema=schema,
    remote_path="/data/bulk_import",
    cloud_endpoint="https://your-cloud-endpoint.zillizcloud.com",
    api_key="your-api-key",
    volume_name="my-volume",
    chunk_size=1024 * 1024 * 1024,
    file_type=BulkFileType.PARQUET,
) as writer:
    # 追加行
    for i in range(1000):
        writer.append_row({
            "id": i,
            "vector": [0.1] * 128,
        })

    # 提交并上传
    writer.commit()

    print(writer.data_path)
    print(writer.batch_files)
```
