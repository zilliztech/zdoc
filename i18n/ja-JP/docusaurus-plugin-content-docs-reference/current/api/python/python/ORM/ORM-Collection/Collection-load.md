---
title: "load() | Python | ORM"
slug: /python/python/Collection-load
sidebar_label: "load()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の collection のデータをメモリに読み込みます。 | Python | ORM"
type: docx
token: HQDndiGwloWKIexgPCUcEZGenOh
sidebar_position: 20
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - ナレッジベース
  - zilliz
  - zilliz cloud
  - cloud
  - load()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load()

この操作は、現在の collection のデータをメモリに読み込みます。 

## リクエスト構文\{#request-syntax}

```python
load(
    partition_names: list[str] | None, 
    replica_number: int, 
    timeout: float | None, 
)
```

<Admonition type="info" icon="📘" title="注意">

この操作はノンブロッキングです。現在のプロセスをブロックするには、`utility.wait_for_loading_complete()` を呼び出します。

</Admonition>

**パラメータ:**

- **partition_names** (*list(str)* | *None*) - 

    読み込む現在の collection の partition です。指定しない場合は、すべての partition が読み込まれます。

- **timeout** (*float* | *None*)  -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に送出される例外です。

<Admonition type="warning" icon="🚧" title="警告">

index が作成されていない collection を読み込もうとすると、**MilvusException** が返されます。

</Admonition>

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

# Load the entire collection with one replica of the collection data
collection.load()

# Load the entire collection with two replicas of the collection data
collection.load(
    replica_number=2
)

# Load a specific partition with two replicas of the partition data
collection.load(
    partition_names=["partitionA"],
    replica_number=2
)
```

## 関連する操作\{#related-operations}

以下の操作は `load()` に関連しています。

- [Partition](./ORM-Partition)

- [release()](./Collection-release)

- [load_state()](./utility-load_state)

- [loading_progress()](./utility-loading_progress)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

