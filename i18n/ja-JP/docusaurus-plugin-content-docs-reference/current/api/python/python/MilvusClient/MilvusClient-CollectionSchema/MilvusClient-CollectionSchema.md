---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema インスタンスはコレクションスキーマを定義します。 | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma ベクトルデータベース
  - NLP 検索
  - LLM のハルシネーション
  - マルチモーダル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - CollectionSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

CollectionSchema インスタンスは、コレクションスキーマを定義します。

## リクエスト構文\{#request-syntax}

```python
__init__(
    raw: Any
)
```

**パラメーター:**

- **fields** (*list*) -

    **[REQUIRED]**

    コレクションのフィールドを定義する [FieldSchema](./MilvusClient-FieldSchema) オブジェクトのリストです。

- **description** (*string*) -

    スキーマの説明です。説明を指定しない場合は、空の文字列に設定されます。

- **external_source** (*str*) -

    外部ソース URI です。アクセス可能な外部ボリュームを指す `volume://` URI を指定します。たとえば、`volume://<volume-name>/path/to/folder/` です。

- **external_spec** (*str*) -

    外部ソースの仕様です。これは一連の補助的なパラメーターです。

    - **format** (*str*) - 

        ターゲットのソースデータファイルの形式です。

        指定できる値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg テーブルの ID です。これは `format` が `iceberg-table` の場合にのみ適用されます。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。失敗の正確な原因については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

schema = CollectionSchema(
    fields=[
        FieldSchema(
            name="id",
            dtype=DataType.INT64,
            is_primary=True,
        ),
        FieldSchema(
            name="vector",
            dtype=DataType.FLOAT_VECTOR,
            dim=128,
        ),
    ],
    enable_dynamic_field=True,
)
print(
    schema.auto_id,
    schema.enable_dynamic_field,
)
```
