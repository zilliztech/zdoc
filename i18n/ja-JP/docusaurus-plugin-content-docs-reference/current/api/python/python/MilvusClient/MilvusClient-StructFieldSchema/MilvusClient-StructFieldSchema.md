---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "コンストラクターの動作が変更されました。既存のクラスページに、新しい nullable プロパティが記載されています。 | Python | MilvusClient"
type: docx
token: R4vxd8dReoaZ85xZ23qctjfLnDh
sidebar_position: 3
keywords: 
  - Elastic ベクトルデータベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - StructFieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# StructFieldSchema

コンストラクターの動作が変更されました。既存のクラスページに、新しい nullable プロパティが記載されています。

## リクエスト構文\{#request-syntax}

```python
StructFieldSchema(
```

**パラメーター:**

- **nullable** (*bool*) -

    デフォルト: `False`

    struct フィールドに null 値を含めることを許可するフラグです。

- **description** (*str*) -

    デフォルト: `""`

    struct フィールドの説明です。

**戻り値の型:**

*StructFieldSchema*

**戻り値:**

ネストされたフィールドと nullable/default メタデータを含む struct フィールドスキーマのインスタンスです。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

StructFieldSchema の使用方法を示します。

```python
from pymilvus import CollectionSchema, DataType, FieldSchema, StructFieldSchema

chunk = StructFieldSchema(
    nullable=True,
    description="Optional chunk metadata",
)
chunk.add_field(
    "source",
    DataType.VARCHAR,
    max_length=128,
)

schema = CollectionSchema(fields=[
    FieldSchema(
        name="id",
        dtype=DataType.INT64,
        is_primary=True,
    ),
    FieldSchema(
        name="vector",
        dtype=DataType.FLOAT_VECTOR,
        dim=3,
    ),
])
print(schema)
```
