---
title: "FieldOpType | Python | MilvusClient"
slug: /python/python/FieldOp-FieldOpType
sidebar_label: "FieldOpType"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "フィールドレベルの部分更新操作タイプの列挙型エイリアスです。 | Python | MilvusClient"
type: docx
token: I8zBdZOdaorBS1xAxl4cC4E5njf
sidebar_position: 4
keywords: 
  - Elastic ベクトルデータベース
  - Pinecone と Milvus
  - Chroma と Milvus
  - Annoy ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - FieldOpType
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldOpType

フィールドレベルの部分更新操作タイプの列挙型エイリアスです。

## 例\{#examples}

操作メッセージを、エクスポートされた列挙値と比較します。

```python
from pymilvus import FieldOp, FieldOpType

op = FieldOp.array_append()
assert op.op == FieldOpType.ARRAY_APPEND
```

## 注記\{#notes}

- REPLACE は、現在のフィールド値を置き換えます。

- ARRAY_APPEND は、受信した要素を現在の配列に追加します。

- ARRAY_REMOVE は、現在の配列から、一致する受信要素をすべて削除します。
