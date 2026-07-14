---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/CollectionSchema-to_dict
sidebar_label: "to_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、CollectionSchema オブジェクトを辞書表現に変換します。 | Python | MilvusClient"
type: docx
token: NnIxd6VYso9IBPx6bJDcJJmUnNd
sidebar_position: 4
keywords: 
  - ベクターデータベースはどのように動作するか
  - vector db comparison
  - openai vector db
  - 自然言語処理データベース
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_dict()

この操作は、CollectionSchema オブジェクトを辞書表現に変換します。

## リクエスト構文\{#request-syntax}

```python
to_dict()
```

**パラメーター:**

なし

**戻り値の型:**

*dict*

**戻り値:**

コレクションスキーマの辞書表現。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。

## 例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType  

# Create field schemas
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

# Create a CollectionSchema with field schemas

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Call to_dict() to get a dictionary representation of the schema 

schema_dict = schema.to_dict()  
print(schema_dict)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}]}
```

