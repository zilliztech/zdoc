---
title: "verify() | Python | MilvusClient"
slug: /python/python/CollectionSchema-verify
sidebar_label: "verify()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、明らかな問題を検出するために CollectionSchema に対して最終的な検証チェックを実行します。 | Python | MilvusClient"
type: docx
token: TfV3dOYPyoKVSMxShrTc9SZ2nqh
sidebar_position: 5
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
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

**PARAMETERS:**

なし

**RETURN TYPE:**

なし

**RETURNS:**

なし

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
    dim=768,
)

# Create a CollectionSchema with field schemas

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Call verify() to validate the schema 
schema.verify()
```

