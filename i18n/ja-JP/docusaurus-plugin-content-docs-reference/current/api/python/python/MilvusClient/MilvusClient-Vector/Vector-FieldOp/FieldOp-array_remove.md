---
title: "array_remove() | Python | MilvusClient"
slug: /python/python/FieldOp-array_remove
sidebar_label: "array_remove()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "アップサート中に、既存のフィールド値から一致する配列要素を削除する操作を作成します。 | Python | MilvusClient"
type: docx
token: Ki33dZaE6oZq0fxDSHcc9cKzn5d
sidebar_position: 2
keywords: 
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - zilliz
  - zilliz cloud
  - クラウド
  - array_remove()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# array_remove()

アップサート中に、既存のフィールド値から一致する配列要素を削除する操作を作成します。

## リクエスト構文\{#request-syntax}

```python
FieldOp.array_remove() -> FieldPartialUpdateOp
```

**RETURN TYPE:**

*FieldPartialUpdateOp*

**RETURNS:**

ARRAY_REMOVE の動作を選択する操作メッセージです。

## 例\{#examples}

tags フィールドに ARRAY_REMOVE を適用します。

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[
        {
            "id": 1,
            "vector": [0.1, 0.2, 0.3, 0.4],
            "tags": ["obsolete"],
        }
    ],
    field_ops={"tags": FieldOp.array_remove()},
)
```
