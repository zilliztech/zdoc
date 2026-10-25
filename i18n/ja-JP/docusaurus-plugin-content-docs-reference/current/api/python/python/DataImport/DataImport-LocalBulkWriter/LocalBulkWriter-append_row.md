---
title: "append_row() | Python"
slug: /python/python/LocalBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は writer にレコードを追加します。 | Python"
type: docx
token: WCxIdVwCpoIaMUxbabWcSRCkn2g
sidebar_position: 1
keywords: 
  - ベクトル db comparison
  - openai ベクトル db
  - natural language processing データベース
  - cheap ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# append_row()

この操作は writer にレコードを追加します。

## リクエスト構文\{#request-syntax}

```python
append_row(
    row: dict
)
```

**パラメーター:**

- **row** (*dict*) -

    追加する entity を表す辞書です。

    The keys and their values in the dictionary should match the スキーマ referenced in the current **[LocalBulkWriter](./DataImport-LocalBulkWriter)**.

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
```

## 関連メソッド\{#related-methods}

- [commit()](./LocalBulkWriter-commit)

