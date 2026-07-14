---
title: "index_building_progress() | Python | ORM"
slug: /python/python/utility-index_building_progress
sidebar_label: "index_building_progress()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、インデックス構築プロセスの進行状況を返します。 | Python | ORM"
type: docx
token: OVfodiKa6o3qTGxadYicI975nhh
sidebar_position: 21
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - cloud
  - index_building_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# index_building_progress()

この操作は、インデックス構築プロセスの進行状況を返します。

## Request Syntax\{#request-syntax}

```python
index_building_progress(
    collection_name: str,
    index_name: str = "",
    using: str = "default",
    timeout: float | None,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存の collection の名前です。

    存在しない collection に設定すると、**CollectionNotExistException** が発生します。

- **index_name** (*str*) -

    この操作の対象となる index の名前です。

    指定しない場合、デフォルトの index が適用されます。collection に複数の index がある場合、このパラメータは必須です。

    存在しない index に設定すると、**IndexNotExistException** が発生します。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*dict*

**RETURNS:**
指定された collection 内の、インデックス済み entity 数と総 entity 数を含む辞書です。
この辞書には以下のキーがあります。

- **total_rows** (*int*)

    指定された collection 内の entity の総数です。

- **indexed_rows** (*int*)

    指定された collection 内のインデックス済み entity 数です。

- **pending_index_rows** (*int*)

    インデックス化待ちの entity 数です。

**EXCEPTIONS:**

- **CollectionNotExistException**

    指定された collection が存在しない場合に発生します。

- **IndexNotExistException**

    指定された index が存在しない場合に発生します。

- **AmbiguousIndexName**

    複数の index が存在するにもかかわらず、index 名が指定されていない場合に発生します。

## Examples\{#examples}

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

# Get the building progress of a specific index
utility.index_building_progress(
    collection_name="test_collection",
    index_name="_default_idx_101"
)
```

## Related operations\{#related-operations}

以下の操作は `index_building_progress()` に関連しています。

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

