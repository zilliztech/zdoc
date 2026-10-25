---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/StructFieldSchema-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、StructFieldSchema オブジェクトを辞書表現に変換します。 | Python | MilvusClient"
type: docx
token: Q2ArdGwoDoZcAxxsVTRcqrudnvg
sidebar_position: 4
keywords: 
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# to_dict()

この操作は、**StructFieldSchema** オブジェクトを辞書表現に変換します。

## リクエスト構文\{#request-syntax}

```python
to_dict()
```

**戻り値の型:**

*dict*

**戻り値:**

コレクションスキーマの辞書表現です。

**例外:**

- **MilvusException**

    この操作中にエラーが発生した場合、この例外が発生します。この操作中にエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import StructFieldSchema, FieldSchema, DataType  

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

varchar = FieldSchema(
    name="varchar",
    dtype=DataType.VARCHAR,
    max_length=512
)

# Create a StructFieldSchema with field schemas

schema = StructFieldSchema(
    name="struct_schema",
    fields = [vector, varchar]
)

# Call to_dict() to get a dictionary representation of the schema 

schema_dict = schema.to_dict()
```
