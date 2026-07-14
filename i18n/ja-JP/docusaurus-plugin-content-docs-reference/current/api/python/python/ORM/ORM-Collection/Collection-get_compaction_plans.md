---
title: "get_compaction_plans() | Python | ORM"
slug: /python/python/Collection-get_compaction_plans
sidebar_label: "get_compaction_plans()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在の compaction プランを取得します。 | Python | ORM"
type: docx
token: D6Q7dq4USotLS3xxMP0cFiGLnsf
sidebar_position: 12
keywords: 
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - get_compaction_plans()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compaction_plans()

この操作は現在の compaction プランを取得します。

## リクエスト構文\{#request-syntax}

```python
get_compaction_plans(
    timeout: float | None
)
```

**パラメータ:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Compact small segments
collection.compact()

# Check the compaction state
collection.get_compaction_plans()

# Compaction Plans:
#  - compaction id: 446738261026576357
#  - state: Completed
#  - plans: []
```

## 関連する操作\{#related-operations}

次の操作は `get_compaction_plans()` に関連しています。

- [compact()](./Collection-compact)

- [get_compaction_state()](./Collection-get_compaction_state)

- [wait_for_compaction_completed()](./Collection-wait_for_compaction_completed)

