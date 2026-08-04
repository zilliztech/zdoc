---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "コンストラクタの動作が変更されました。既存のクラスページに新しい nullable プロパティが記載されています。 | Python | MilvusClient"
type: docx
token: ZnKKd2PsyoRc1MxtC1BcJQjgnBh
sidebar_position: 3
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - StructFieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

コンストラクタの動作が変更されました。既存のクラスページに新しい nullable プロパティが記載されています。

## リクエスト構文\{#request-syntax}

```python
StructFieldSchema(
    nullable: bool = False,
    description: str = "",
)
```

**パラメータ:**

- **nullable** (*bool*) -<br/>
  デフォルト: `False`<br/>
  struct field に null 値を含めることを許可するフラグです。

- **description** (*str*) -<br/>
  デフォルト: `""`<br/>
  struct field の説明です。

**戻り値の型:**

*StructFieldSchema*

**戻り値:**

ネストされた field と nullable/default メタデータを含む struct field schema インスタンス。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細はサーバーのエラーメッセージを確認してください。

## 例\{#examples}

StructFieldSchema の使用方法を示します。

```python
from pymilvus import CollectionSchema, DataType, FieldSchema, StructFieldSchema

chunk = StructFieldSchema(nullable=True, description="Optional chunk metadata")
chunk.add_field("source", DataType.VARCHAR, max_length=128)

schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=3),
])
print(schema)
```
