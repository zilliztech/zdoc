---
title: "to_dict() | Python | ORM"
slug: /python/python/FieldSchema-to_dict
sidebar_label: "to_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、FieldSchema オブジェクトを辞書表現に変換します。 | Python | ORM"
type: docx
token: G1gsdGWwuoPOPrxJdABcfa76nUd
sidebar_position: 3
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k nearest neighbor algorithm
  - ANNS
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

この操作は、FieldSchema オブジェクトを辞書表現に変換します。

## リクエスト構文\{#request-syntax}

```python
to_dict()
```

**PARAMETERS:**

なし

**RETURN TYPE:**

*dict*

**RETURNS:**

フィールドスキーマの辞書表現です。

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

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

