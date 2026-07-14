---
title: "wait_for_compaction_completed() | Python | ORM"
slug: /python/python/Collection-wait_for_compaction_completed
sidebar_label: "wait_for_compaction_completed()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、compaction リクエストが完了するまで現在のセッションをブロックします。 | Python | ORM"
type: docx
token: VFKIdx0tDoeAzSx4Ud6c3u5Snsf
sidebar_position: 29
keywords: 
  - ANNS
  - ベクトル検索
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - wait_for_compaction_completed()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# wait_for_compaction_completed()

この操作は、compaction リクエストが完了するまで現在のセッションをブロックします。

## Request Syntax\{#request-syntax}

```python
wait_for_compaction_completed(
    timeout: float | None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に発生します。

## Examples\{#examples}

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
collection.wait_for_compaction_completed()
```

## Related operations\{#related-operations}

`wait_for_compaction_completed()` に関連する操作は次のとおりです。

- [compact()](./Collection-compact)

- [get_compaction_plans()](./Collection-get_compaction_plans)

- [get_compaction_state()](./Collection-get_compaction_state)

