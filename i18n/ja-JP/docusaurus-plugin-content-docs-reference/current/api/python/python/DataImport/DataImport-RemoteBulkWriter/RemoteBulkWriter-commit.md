---
title: "commit() | Python"
slug: /python/python/RemoteBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は追加されたデータをコミットします。 | Python"
type: docx
token: VccVd4MTgoPzCixDVtgcEoKWnPf
sidebar_position: 3
keywords: 
  - openai vector db
  - 自然言語処理データベース
  - 安価な vector データベース
  - Managed vector データベース
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

この操作は追加されたデータをコミットします。

## リクエスト構文\{#request-syntax}

```python
commit(
    **kwargs
)
```

**パラメーター:**

- **kwargs** -

    - **call_back** (function)

        この操作の完了後に呼び出されるコールバック関数です。

        デフォルト値は **None** で、呼び出すコールバックがないことを示します。コミット後のアクションを追加するために使用します。

## 例\{#examples}

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

## 関連するクラスとメソッド\{#related-classes-and-methods}

- [append_row()](./RemoteBulkWriter-append_row)

- [AzureConnectParam](./RemoteBulkWriter-AzureConnectParam)

- [S3ConnectParam](./RemoteBulkWriter-S3ConnectParam)

