---
title: "FieldOp | Python | MilvusClient"
slug: /python/python/Vector-FieldOp
sidebar_label: "FieldOp"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "フィールドレベルの部分更新操作のためのファクトリークラス。 | Python | MilvusClient"
type: docx
token: LKTzdLal1oEAJYxzEWJcfgkgnhb
sidebar_position: 3
keywords: 
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化
  - k 近傍法
  - zilliz
  - zilliz cloud
  - クラウド
  - FieldOp
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# FieldOp

フィールドレベルの部分更新操作のためのファクトリークラスです。

**戻り値の型:**

*FieldOp*

**戻り値:**

フィールドの部分更新操作メッセージを作成する静的メソッドを備えたファクトリークラスです。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。失敗の正確な詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

既存の配列を置き換えるのではなく、FieldOp.array_append() を使用して値を追加します。

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[{"id": 1, "vector": [0.1, 0.2, 0.3], "tags": ["science"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```
