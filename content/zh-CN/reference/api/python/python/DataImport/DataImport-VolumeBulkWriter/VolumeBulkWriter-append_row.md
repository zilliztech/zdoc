---
title: "append_row() | Python"
slug: /python/python/VolumeBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将单行数据追加到内部缓冲区中。当缓冲区大小超过配置的分块大小时，缓冲区会自动刷新到本地文件并上传到远程卷。 | Python"
type: docx
token: LJKOd7ZDUopRISxNzamcwb1PnMJ
sidebar_position: 1
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# append_row()

此操作将单行数据追加到内部缓冲区中。当缓冲区大小超过配置的分块大小时，缓冲区会自动刷新到本地文件并上传到远程卷。

## 请求语法\{#request-syntax}

```python
VolumeBulkWriter.append_row(
    row: Dict[str, Any],
    **kwargs
)
```

**参数：**

- **row** (*Dict[str, Any]*) -

    **[必需]**

    表示单行数据的字典。键必须与集合 schema 中定义的字段名称匹配，值必须符合相应的字段类型。

**返回类型：**

*None*

此方法不返回任何值。

**异常：**

- **MilvusException**

    当行数据未能通过集合 schema 的校验时引发（例如：类型不匹配、缺少必需字段、向量维度不匹配）。

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

# Append a single row
writer.append_row({
    "id": 1,
    "vector": [0.1] * 128,
})

# Append multiple rows
for i in range(1000):
    writer.append_row({
        "id": i,
        "vector": [0.1] * 128,
    })
```
