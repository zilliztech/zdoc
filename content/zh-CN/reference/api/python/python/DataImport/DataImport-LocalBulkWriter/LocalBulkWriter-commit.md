---
title: "commit() | Python"
slug: /python/python/LocalBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会提交已追加的数据。 | Python"
type: docx
token: EtBDdoGaFo3bOExKxCHcKgpenib
sidebar_position: 2
keywords: 
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - commit()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# commit()

此操作会提交已追加的数据。

## 请求语法\{#request-syntax}

```python
pymilvus.LocalBulkWriter.commit(
    **kwargs
)
```

**参数：**

- **kwargs** -

    - **call_back**（函数）

        此操作完成后要调用的回调函数。

        该值默认为 **None**，表示没有可调用的回调函数。您可以用它来添加提交后的操作。

## 示例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType
from pymilvus.bulk_writer import LocalBulkWriter, BulkFileType

# Set up a schema
schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=5),
    ]
)

# Set up a local bulk writer
writer = LocalBulkWriter(
    schema=schema,
    local_path="/tmp/output",
)

# Append a row to the writer
writer.append_row(
    {"id": 0, "vector": [0.1, 0.4, -0.8, -0.2, 0.4]}
)

# Commit the appended data
def callback():
    print("Commit completes")

writer.commit(call_back=callback)
```

## 相关方法\{#related-methods}

- [append_row()](./LocalBulkWriter-append_row)

