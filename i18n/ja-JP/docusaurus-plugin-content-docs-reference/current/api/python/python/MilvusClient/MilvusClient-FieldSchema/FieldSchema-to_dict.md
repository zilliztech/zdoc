---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/FieldSchema-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、FieldSchema オブジェクトを辞書表現に変換します。 | Python | MilvusClient"
type: docx
token: DkqSdCSOJo5DI1xZ7z3cTZuUnAc
sidebar_position: 3
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k 近傍アルゴリズム
  - ANNS
  - zilliz
  - zilliz cloud
  - クラウド
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_dict()

この操作では、FieldSchema オブジェクトを辞書表現に変換します。

## リクエスト構文\{#request-syntax}

```python
to_dict()
```

**戻り値の型：**

*dict*

**戻り値：**

フィールドスキーマの辞書表現です。

**例外：**

- **MilvusException**

    この操作中にエラーが発生すると、この例外がスローされます。この操作中にエラーが発生すると、この例外がスローされます。

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
    dim=768
)

# Get dictionary representation
primary_key_dict = primary_key.to_dict()
vector_dict = vector.to_dict()

print(primary_key_dict)
print(vector_dict)

# Output
# {'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}
# {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}
```
