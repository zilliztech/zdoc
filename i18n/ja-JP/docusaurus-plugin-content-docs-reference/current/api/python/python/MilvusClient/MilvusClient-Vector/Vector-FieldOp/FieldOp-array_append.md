---
title: "array_append() | Python | MilvusClient"
slug: /python/python/FieldOp-array_append
sidebar_label: "array_append()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "アップサート時に受信した配列要素を既存のフィールド値に追加する操作を作成します。 | Python | MilvusClient"
type: docx
token: S7Otdiukfo0a4GxNUWpcQca3nSb
sidebar_position: 1
keywords: 
  - LLMs
  - 機械学習
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - クラウド
  - array_append()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# array_append()

アップサート時に受信した配列要素を既存のフィールド値に追加する操作を作成します。

## リクエスト構文\{#request-syntax}

```python
FieldOp.array_append() -> FieldPartialUpdateOp
```

**戻り値の型:**

*FieldPartialUpdateOp*

**戻り値:**

ARRAY_APPEND の動作を選択する操作メッセージ。

## 例\{#examples}

tags フィールドに ARRAY_APPEND を適用します。

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[
        {
            "id": 1,
            "vector": [0.1, 0.2, 0.3, 0.4],
            "tags": ["science"],
        }
    ],
    field_ops={"tags": FieldOp.array_append()},
)
```
