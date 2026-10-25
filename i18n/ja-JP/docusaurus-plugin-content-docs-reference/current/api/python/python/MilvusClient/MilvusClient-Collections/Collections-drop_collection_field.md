---
title: "drop_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_field
sidebar_label: "drop_collection_field()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、フィールド名またはフィールド ID を指定して、既存のコレクションスキーマからフィールドを削除します。 | Python | MilvusClient"
type: docx
token: SpmqdHRBjoRKQuxTibQcx0zMnnb
sidebar_position: 27
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k 近傍アルゴリズム
  - ANNS
  - zilliz
  - zilliz cloud
  - クラウド
  - drop_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_collection_field()

この操作では、フィールド名またはフィールド ID を指定して、既存のコレクションスキーマからフィールドを削除します。

## リクエスト構文\{#request-syntax}

```python
drop_collection_field(
```

**パラメーター:**

- **collection_name** (*str*) -

    対象コレクションの名前です。

- **field_name** (*str*) -

    削除するフィールド名です。フィールドを名前で識別する場合に指定します。

- **field_id** (*int*) -

    削除するフィールド ID です。ワークフローでスキーマをフィールド ID で追跡する場合に使用します。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト（秒）です。

- **kwargs** (*dict*) -

    基盤となる RPC に渡される追加のリクエストオプションです。

**戻り値の型:**

*NoneType*

**戻り値:**

この操作ではデータは返されません。

**例外:**

- **MilvusException**

    コレクションが存在しない場合、フィールドを解決できない場合、またはリクエストが失敗した場合に発生します。コレクションが存在しない場合、フィールドを解決できない場合、またはリクエストが失敗した場合に発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.drop_collection_field(
    collection_name="products",
    field_name="legacy_score",
)
```
