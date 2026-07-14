---
title: "verify() | Python | MilvusClient"
slug: /python/python/Function-verify
sidebar_label: "verify()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、CollectionSchema で定義された関数の入力フィールドと出力フィールドを検証します。 | Python | MilvusClient"
type: docx
token: YXogdv0Dpovi2Pxbyh2cdA4nnbe
sidebar_position: 5
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
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

この操作は、CollectionSchema で定義された関数の入力フィールドと出力フィールドを検証します。

## リクエスト構文\{#request-syntax}

```python
verify(
    schema: CollectionSchema
)
```

**パラメータ:**

なし

**戻り値の型:**

なし

**戻り値:**

なし

**例外:**

- `MilvusException`

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient, Function, FunctionType

schema = MilvusClient.create_schema()

bm25_function = Function(
    name="bm25_fn",
    input_field_names=["document_content"],
    output_field_names="sparse_vector",
    function_type=FunctionType.BM25,
)

schema.add_function(bm25_function)

# Verify the function
bm25_function.verify(schema)
```
