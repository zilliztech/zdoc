---
title: "verify() | Python | ORM"
slug: /python/python/CollectionSchema-verify_1
sidebar_label: "verify()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、明らかな問題を検出するために CollectionSchema に対して最終的な検証チェックを実行します。 | Python | ORM"
type: docx
token: KSECdBDcUoIkL7xI4KOc29Ukn1g
sidebar_position: 5
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - verify()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# verify()

この操作は、明らかな問題を検出するために CollectionSchema に対して最終的な検証チェックを実行します。

## リクエスト構文\{#request-syntax}

```python
verify()
```

**パラメータ:**

なし

**戻り値の型:**

なし

**戻り値:**

なし

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

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

# Call verify() to validate the schema 
schema.verify()
```

