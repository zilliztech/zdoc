---
title: "drop() | Python | ORM"
slug: /python/python/Collection-drop
sidebar_label: "drop()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在のコレクションを削除します。 | Python | ORM"
type: docx
token: L8UTdDNkPoeew0x6LoDcfHx4nof
sidebar_position: 8
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - drop()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop()

この操作は現在のコレクションを削除します。 

## リクエスト構文\{#request-syntax}

```python
drop(
    timeout: float | None
)
```

**パラメータ:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返されるかエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

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

# Drop the collection
collection.drop()
```

## 関連する操作\{#related-operations}

以下の操作は `drop()` に関連しています。

- [describe()](./Collection-describe)

- [flush()](./Collection-flush)

- [get_replicas()](./Collection-get_replicas)

- [set_properties()](./Collection-set_properties)

