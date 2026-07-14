---
title: "wait_for_index_building_complete() | Python | ORM"
slug: /python/python/utility-wait_for_index_building_complete
sidebar_label: "wait_for_index_building_complete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された index が構築されるまで現在のプロセスをブロックします。 | Python | ORM"
type: docx
token: MfR8dw5TioPvw3xvrstcgYixnUb
sidebar_position: 43
keywords: 
  - Vector index
  - オープンソース vector database
  - オープンソース vector db
  - vector database の例
  - zilliz
  - zilliz cloud
  - cloud
  - wait_for_index_building_complete()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# wait_for_index_building_complete()

この操作は、指定された index が構築されるまで現在のプロセスをブロックします。

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

    既存の collection の名前です。

    存在しない collection に設定すると、**CollectionNotExistException** が発生します。

- **index_name** (*str*) -

    この操作の対象となる index の名前です。

    指定しない場合、デフォルトの index が適用されます。collection に複数の index がある場合、このパラメーターは必須です。

    存在しない index に設定すると、**IndexNotExistException** が発生します。

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

    指定された collection が存在しない場合に、この例外が発生します。

- **IndexNotExistException**

    指定された index が存在しない場合に、この例外が発生します。

- **AmbiguousIndexName**

    複数の index が存在するにもかかわらず、index 名が指定されていない場合に、この例外が発生します。

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

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [list_indexes()](./utility-list_indexes)

