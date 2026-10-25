---
title: "list_indexes() | Python | ORM"
slug: /python/python/utility-list_indexes
sidebar_label: "list_indexes()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all インデックス of a specific コレクション. | Python | ORM"
type: docx
token: XLepdUCcTow6rpx5vxxcbLXZnyb
sidebar_position: 25
keywords: 
  - milvus
  - Zilliz
  - milvus ベクトル データベース
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - list_indexes()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_indexes()

This operation lists all インデックス of a specific コレクション.

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

    The name of an existing コレクション.

    Setting this to a non-existing コレクション leads to a **CollectionNotExistException**.

- **index_name** (*str*) -

    The name of the target インデックス of this operation.

    If left unspecified, the default インデックス applies. If the コレクション has multiple インデックス, this parameter is mandatory.

    Setting this to a non-existing インデックス leads to an **IndexNotExistException**.

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*list*

**戻り値:**

The names of all built インデックス in a list.

**例外:**

- **CollectionNotExistException**

    This exception will be raised if the specified コレクション does not exist.

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

- [インデックス()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

