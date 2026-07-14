---
title: "append_row() | Python"
slug: /python/python/VolumeBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、単一行のデータを内部バッファに追加します。バッファサイズが設定されたチャンクサイズを超えると、バッファは自動的にローカルファイルにフラッシュされ、リモート volume にアップロードされます。 | Python"
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

この操作は、単一行のデータを内部バッファに追加します。バッファサイズが設定されたチャンクサイズを超えると、バッファは自動的にローカルファイルにフラッシュされ、リモート volume にアップロードされます。

## リクエスト構文\{#request-syntax}

```python
VolumeBulkWriter.append_row(
    row: Dict[str, Any],
    **kwargs
)
```

**パラメータ:**

- **row** (*Dict[str, Any]*) -

    **[必須]**

    単一行のデータを表す辞書です。キーは collection schema で定義されたフィールド名と一致している必要があり、値は対応するフィールド型に準拠している必要があります。

**戻り値の型:**

*None*

このメソッドは値を返しません。

**例外:**

- **MilvusException**

    行データが collection schema に対する検証に失敗した場合に発生します（例: 型の不一致、必須フィールドの欠落、vector 次元の不一致）。

## 例\{#examples}

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
