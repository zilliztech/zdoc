---
title: "FieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "フィールドの名前、データ型、説明、および追加のスキーマオプションを定義します。 | Python | MilvusClient"
type: docx
token: OD8mdC5aXo0XHbxSthRczioXnaf
sidebar_position: 1
keywords: 
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - FieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldSchema

フィールドの名前、データ型、説明、および追加のスキーマオプションを定義します。

## リクエスト構文\{#request-syntax}

```python
FieldSchema(
    name: str,
    dtype: DataType,
    description: str = "",
    **kwargs
)
```

**パラメーター:**

- **name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  フィールドの名前。

- **dtype** ([DataType](./Collections-DataType)) -<br/>
  **[REQUIRED]**<br/>
  フィールドのデータ型。

- **description** (*str*) -<br/>
  デフォルト: `""`<br/>
  フィールドの説明。

- **kwargs** (*Any*) -<br/>
  追加のフィールドオプション。

**戻り値の型:**

*FieldSchema*

**戻り値:**

構成されたデータ型、制約、デフォルト、および nullable メタデータを含むフィールドスキーマのインスタンスです。

**例外:**

- **MilvusException**<br/>
  指定されたフィールドオプションが無効な場合に発生します。無効なデータ型またはフィールド制約の詳細については、例外メッセージを確認してください。

## 例\{#examples}

コレクションスキーマのフィールド定義を作成します。

```python
from pymilvus import CollectionSchema, DataType, FieldSchema

schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=3),
])
print(schema)
```
