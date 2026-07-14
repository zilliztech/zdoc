---
title: "list_indexes() | Python | ORM"
slug: /python/python/utility-list_indexes
sidebar_label: "list_indexes()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection のすべての index を一覧表示します。 | Python | ORM"
type: docx
token: XLepdUCcTow6rpx5vxxcbLXZnyb
sidebar_position: 25
keywords: 
  - milvus
  - Zilliz
  - milvus ベクターデータベース
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - list_indexes()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_indexes()

この操作は、特定の collection のすべての index を一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_indexes(
    collection_name: str,
    using: str = "default",
    timeout: float | None,
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    既存の collection の名前です。

    存在しない collection を指定すると、**CollectionNotExistException** が発生します。

- **index_name** (*str*) -

    この操作の対象 index の名前です。

    指定しない場合は、デフォルトの index が適用されます。collection に複数の index がある場合、このパラメーターは必須です。

    存在しない index を指定すると、**IndexNotExistException** が発生します。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*list*

**戻り値:**

構築済みのすべての index の名前をリストで返します。

**例外:**

- **CollectionNotExistException**

    指定した collection が存在しない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import (
    connections, 
    Collection, 
    CollectionSchema, 
    FieldSchema, 
    DataType, 
    utility,
)

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a collection
collection = Collection(
    name="test_collection",
    schema=CollectionSchema([
        FieldSchema("id", DataType.INT64, is_primary=True),
        FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
    ])
)

# Create an index on a scalar field
collection.create_index(
    field_name="id"
)

# Set the index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {
        "nprobe": 10
    }
}

# Create an index on the vector field
collection.create_index(
    field_name="vector", 
    index_params=index_params, 
    timeout=None
)

# List all indexes
utility.list_indexes(
    collection_name="test_collection"
) # ['_default_idx_101', '_default_idx_100']
```

## 関連する操作\{#related-operations}

以下の操作は `list_indexes()` に関連しています

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

