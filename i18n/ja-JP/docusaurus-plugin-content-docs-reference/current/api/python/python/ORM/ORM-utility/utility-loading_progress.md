---
title: "loading_progress() | Python | ORM"
slug: /python/python/utility-loading_progress
sidebar_label: "loading_progress()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection のロード進行状況を返します。 | Python | ORM"
type: docx
token: HQiHd82orov0XvxAzLWcl5xRnzc
sidebar_position: 31
keywords: 
  - milvus ベクトルデータベース
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - loading_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# loading_progress()

この操作は、特定の collection のロード進行状況を返します。

## リクエスト構文\{#request-syntax}

```python
loading_progress(
    collection_name: str,
    partition_names: list[str] | None,
    using: str = "default",
    timeout: float | None,
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    collection の名前。

- **partition_names** (*list[str]*) -

    partition 名のリスト。

    いずれかの partition 名が指定されている場合、これらの partition のいずれかを release すると、**NotLoad** 状態が返されます。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*dict*

**戻り値:**

index_building の進行状況に関する情報を含む辞書。

この辞書には次のキーがあります。

- **loading_progress** (*str*)

    指定された collection のロード進行状況。

**例外:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合、この例外が発生します。

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

# Load the collection
collection.load()

# Get the load progress
utility.loading_progress(
    collection_name="test_collection",
) # {loading_progress: '100%' }
```

## 関連する操作\{#related-operations}

次の操作は `loading_progress()` に関連しています。

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [release()](./Collection-release)

- [load_state()](./utility-load_state)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

