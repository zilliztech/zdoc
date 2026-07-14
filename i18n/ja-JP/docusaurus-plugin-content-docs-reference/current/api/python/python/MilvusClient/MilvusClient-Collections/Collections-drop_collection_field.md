---
title: "drop_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_field
sidebar_label: "drop_collection_field()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、フィールド名またはフィールド ID によって既存の collection スキーマからフィールドを削除します。 | Python | MilvusClient"
type: docx
token: SpmqdHRBjoRKQuxTibQcx0zMnnb
sidebar_position: 26
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k 最近傍アルゴリズム
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection_field()

この操作は、フィールド名またはフィールド ID によって既存の collection スキーマからフィールドを削除します。

## リクエスト構文\{#request-syntax}

```python
drop_collection_field(
    self,
    collection_name: str,
    field_name: str = "",
    field_id: int = 0,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメーター:**

- **collection_name** (*str*) -

    対象の collection の名前。

- **field_name** (*str*) -

    削除するフィールド名です。フィールドを名前で識別する場合に指定します。

- **field_id** (*int*) -

    削除するフィールド ID です。ワークフローで field ID によってスキーマを追跡している場合に使用します。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト（秒）。

- **kwargs** (*dict*) -

    基盤となる RPC に渡される追加のリクエストオプション。

**戻り値の型:**

*NoneType*

この操作はデータを返しません。

**例外:**

- **MilvusException**

    collection が存在しない場合、フィールドを解決できない場合、またはリクエストが失敗した場合に発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

client.drop_collection_field(
    collection_name="products",
    field_name="legacy_score",
)
```
