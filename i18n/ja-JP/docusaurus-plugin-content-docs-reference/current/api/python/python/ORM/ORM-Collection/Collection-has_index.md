---
title: "has_index() | Python | ORM"
slug: /python/python/Collection-has_index
sidebar_label: "has_index()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の collection に構築済みの index があるかどうかを確認します。 | Python | ORM"
type: docx
token: WDk4dXY8IoV3SJxp9e7c3aq1nBh
sidebar_position: 15
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - zilliz
  - zilliz cloud
  - クラウド
  - has_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_index()

この操作は、現在の collection に構築済みの index があるかどうかを確認します。

## Request Syntax\{#request-syntax}

```python
has_index(timeout: float | None)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*bool*

**RETURNS:**

現在の collection に構築済みの index があるかどうかを示すブール値です。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

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

# Set the index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {
        "nprobe": 10
    }
}

# Create an index
collection.create_index(
    field_name="test_collection", 
    index_params=index_params, 
    timeout=None
)

# Check the index
collection.has_index() # True

# Drop the index
collection.drop_index()

# Check the index
collection.has_index() # False
```

## Related operations\{#related-operations}

以下の操作は `has_index()` に関連しています。

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

