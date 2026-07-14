---
title: "load_state() | Python | ORM"
slug: /python/python/utility-load_state
sidebar_label: "load_state()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションのロード状態を返します。 | Python | ORM"
type: docx
token: BJysdlj1MoksHZxNRxicHn9fnSh
sidebar_position: 33
keywords: 
  - ANN Search
  - vector 埋め込みとは
  - vector database チュートリアル
  - vector database の仕組み
  - zilliz
  - zilliz cloud
  - cloud
  - load_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load_state()

この操作は、特定のコレクションのロード状態を返します。

## リクエスト構文\{#request-syntax}

```python
load_state(
    collection_name: str,
    partition_names: list[str] | None
    using: str = "default",
    timeout: float | None
) -> LoadState
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    コレクションの名前。

- **partition_names** (*list[str]*) -

    パーティション名のリスト。

    いずれかのパーティション名が指定されている場合、これらのパーティションのいずれかをリリースすると、**NotLoad** 状態が返されます。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*LoadState*

**戻り値:**
指定されたコレクションのロード状態を示す **LoadState** オブジェクト。

取り得る状態は次のとおりです。

- **Loaded**

    指定されたコレクションがロードされていることを示します。

- **Loading**

    指定されたコレクションがロード中であることを示します。

- **NotExist**

    指定されたコレクションが存在しないことを示します。 

    **partition_names** に存在しないパーティションを含めると、**MilvusException** が発生します。

- **NotLoad**

    指定されたコレクションがロードされていないことを示します。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

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

# Create two partitions
partition1 = collection.create_partition("partition1")
partition2 = collection.create_partition("partition2")

# Check the load
utility.load_state(
    collection_name="test_collection",
    partition_names=["partition1", "partition2"],
    using=using,
    timeout=timeout,
) # <LoadState: Loaded>

# Release a partition
partition2.release()

utility.load_state(collection_name="test_collection") # <LoadState: Loaded>

utility.load_state(
    collection_name="test_collection",
    partition_names=["partition1", "partition2"],
) # <LoadState: NotLoad>
```

## 関連する操作\{#related-operations}

以下の操作は `load_state()` に関連しています。

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [release()](./Collection-release)

- [loading_progress()](./utility-loading_progress)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

