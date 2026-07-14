---
title: "get_compaction_state() | Python | ORM"
slug: /python/python/Collection-get_compaction_state
sidebar_label: "get_compaction_state()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在の compaction 状態を取得します。 | Python | ORM"
type: docx
token: AXcMd0xiOovIX6xR4ZrcKA15nwh
sidebar_position: 13
keywords: 
  - Chroma ベクトルデータベース
  - nlp 検索
  - llm 幻覚
  - マルチモーダル検索
  - zilliz
  - zilliz cloud
  - cloud
  - get_compaction_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compaction_state()

この操作は現在の compaction 状態を取得します。 

## リクエスト構文\{#request-syntax}

```python
get_compaction_state(
    timeout: float | None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。

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
collection.get_compaction_state()

# CompactionState
#  - compaction id: 446738261026568285
#  - State: Completed
#  - executing plan number: 4
#  - timeout plan number: 0
#  - complete plan number: 4
```

## 関連する操作\{#related-operations}

以下の操作は `get_compaction_state()` に関連しています。

- [compact()](./Collection-compact)

- [get_compaction_plans()](./Collection-get_compaction_plans)

- [wait_for_compaction_completed()](./Collection-wait_for_compaction_completed)

