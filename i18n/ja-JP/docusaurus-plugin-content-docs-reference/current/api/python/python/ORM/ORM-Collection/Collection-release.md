---
title: "release() | Python | ORM"
slug: /python/python/Collection-release
sidebar_label: "release()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の collection のデータをメモリから解放します。 | Python | ORM"
type: docx
token: CBwkdDs7MoKkVKx0kJgcPUNxn6s
sidebar_position: 24
keywords: 
  - ANNS
  - ベクトル検索
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - release()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# release()

この操作は、現在の collection のデータをメモリから解放します。

## リクエスト構文\{#request-syntax}

```python
release(
    timeout=None,
)
```

**パラメーター:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

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

# Load the entire collection with one replica of the collection data
collection.load()

# Release the entire collection data
collection.release()
```

## 関連する操作\{#related-operations}

以下の操作は `release()` に関連しています。

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [load_state()](./utility-load_state)

- [loading_progress()](./utility-loading_progress)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

