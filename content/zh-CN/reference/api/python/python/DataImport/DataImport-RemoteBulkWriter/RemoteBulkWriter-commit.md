---
title: "commit() | Python"
slug: /python/python/RemoteBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会提交已追加的数据。 | Python"
type: docx
token: VccVd4MTgoPzCixDVtgcEoKWnPf
sidebar_position: 3
keywords: 
  - openai 向量数据库
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管式向量 Database
  - Zilliz
  - Zilliz Cloud
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
commit(
    **kwargs
)
```

**参数：**

- **kwargs** -

    - **call_back**（函数）

        此操作完成后将调用的回调函数。

        该值默认为 **None**，表示没有可调用的回调函数。您可以使用它来添加提交后的操作。

## 示例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType
from pymilvus.bulk_writer import RemoteBulkWriter, BulkFileType

# Set up a schema
schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=5),
    ]
)

# Set up bucket connection parameters
connect_param = RemoteBulkWriter.ConnectParam(
    endpoint="storage.googleapis.com", # use 's3.amazonaws.com' for AWS
    access_key="ACCESS_KEY",
    secret_key="SECRET_KEY",
    bucket_name="BUCKET_NAME",
    secure=True,
)

# Set up a remote bulk writer
writer = RemoteBulkWriter(
    schema=schema,
    connect_param=connect_param,
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

## 相关类和方法\{#related-classes-and-methods}

- [append_row()](./RemoteBulkWriter-append_row)

- [AzureConnectParam](./RemoteBulkWriter-AzureConnectParam)

- [S3ConnectParam](./RemoteBulkWriter-S3ConnectParam)

