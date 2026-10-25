---
title: "wait_for_index_building_complete() | Python | ORM"
slug: /python/python/utility-wait_for_index_building_complete
sidebar_label: "wait_for_index_building_complete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation blocks the current process until the specified インデックス has been built. | Python | ORM"
type: docx
token: MfR8dw5TioPvw3xvrstcgYixnUb
sidebar_position: 43
keywords: 
  - ベクトル インデックス
  - ベクトル データベース open source
  - open source ベクトル db
  - ベクトル データベース example
  - zilliz
  - zilliz cloud
  - cloud
  - wait_for_index_building_complete()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# wait_for_index_building_complete()

This operation blocks the current process until the specified インデックス has been built.

## リクエスト構文\{#request-syntax}

```python
wait_for_index_building_complete(
    collection_name: str,
    index_name: str = "",
    timeout: float | None,
    using: str = "default",
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

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

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **CollectionNotExistException**

    This exception will be raised if the specified コレクション does not exist.

- **IndexNotExistException**

    This exception will be raised if the specified インデックス does not exist.

- **AmbiguousIndexName**

    This exception will be raised if multiple インデックス exist but the インデックス name is left unspecified.

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

# Connection to YOUR_CLUSTER_ENDPOINT
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

# Wait for the index being built
utility.wait_for_index_building_complete(
    collection_name="test_collection",
    index_name="_default_idx_100",
)
```

## 関連操作\{#related-operations}

以下の操作は `wait_for_index_building_complete()` に関連しています。

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [インデックス()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [list_indexes()](./utility-list_indexes)

