---
title: "commit() | Python"
slug: /python/python/LocalBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は追加されたデータをコミットします。 | Python"
type: docx
token: EtBDdoGaFo3bOExKxCHcKgpenib
sidebar_position: 2
keywords: 
  - 非構造化データとは
  - Vector embeddings
  - Vector store
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
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
pymilvus.LocalBulkWriter.commit(
    **kwargs
)
```

**パラメーター:**

- **kwargs** -

    - **call_back** (function)

        この操作の完了後に呼び出されるコールバック関数です。

        デフォルト値は **None** で、呼び出すコールバックが存在しないことを示します。これを使用して、コミット後のアクションを追加します。

## 例\{#examples}

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

## 関連メソッド\{#related-methods}

- [append_row()](./LocalBulkWriter-append_row)

