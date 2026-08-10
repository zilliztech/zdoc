---
title: "commit() | Python"
slug: /python/python/VolumeBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将缓冲的数据持久化到本地文件，并将其上传到 VolumeBulkWriter 实例中配置的远程卷。 | Python"
type: docx
token: RwmUdNd0WoQ75zxrCndcal6HnXT
sidebar_position: 2
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# commit()

此操作会将缓冲的数据持久化到本地文件，并将其上传到 VolumeBulkWriter 实例中配置的远程卷。

## 请求语法\{#request-syntax}

```python
VolumeBulkWriter.commit(
    **kwargs
)
```

**参数：**

- **_async** (*bool*) -

    是否异步刷新缓冲区。

    如果设置为 `True`，刷新操作会在后台线程中运行，方法会立即返回。如果设置为 `False`（默认值），则该方法会阻塞，直到刷新完成。

- **call_back** (*Callable[[List[str]], List[str]]*) -

    可选的回调函数，在本地文件刷新完成后调用。在 VolumeBulkWriter 中，此回调函数会在内部用于将文件上传到远程卷。

**返回类型：**

*None*

此方法不返回任何值。

**异常：**

- **MilvusException**

    当刷新或上传操作失败时引发。

## 示例\{#examples}

```python
from pymilvus.bulk_writer.volume_bulk_writer import VolumeBulkWriter
from pymilvus import CollectionSchema, FieldSchema, DataType

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=128),
]
schema = CollectionSchema(fields, "example_collection")

writer = VolumeBulkWriter(
    schema=schema,
    remote_path="/data/bulk_import",
    cloud_endpoint="https://your-cloud-endpoint.zillizcloud.com",
    api_key="your-api-key",
    volume_name="my-volume",
)

# Append data
for i in range(1000):
    writer.append_row({"id": i, "vector": [0.1] * 128})

# Commit and upload to remote volume
writer.commit()

print(f"Files uploaded to: {writer.data_path}")
```
