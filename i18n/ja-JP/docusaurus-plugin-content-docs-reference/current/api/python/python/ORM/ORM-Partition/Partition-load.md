---
title: "load() | Python | ORM"
slug: /python/python/Partition-load
sidebar_label: "load()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の partition のデータをメモリにロードします。 | Python | ORM"
type: docx
token: TWxddf6iboyM15xK4Kzc8ASknRb
sidebar_position: 6
keywords: 
  - managed milvus
  - Serverless ベクトルデータベース
  - milvus オープンソース
  - milvus の仕組み
  - zilliz
  - zilliz cloud
  - クラウド
  - load()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load()

この操作は、現在の partition のデータをメモリにロードします。

<Admonition type="info" icon="📘" title="注記">

**[Collection](./ORM-Collection)** オブジェクトの **load()** メソッドで **partition_names** パラメータを使用することは、対応する **[Partition](./ORM-Partition)** オブジェクトの **load()** メソッドを使用することと同等です。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
load(
    replica_number: int,
    timeout: float | None
)
```

**パラメータ:**

- **replica_number** (*int*)

    現在の partition にロードするレプリカ数。デフォルト値は **1** で、現在の partition に 1 つのレプリカがロードされることを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に発生します。

## 例\{#examples}

```python
from pymilvus import Collection, Partition, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Create a partition
partition = Partition(
    collection=collection,
    name="test_partition"
)

# Load a partition with one replica of the collection data
partition.load()

# Load a partition with two replicas of the collection data
partition.load(
    replica_number=2
)
```

## 関連操作\{#related-operations}

以下の操作は `load()` に関連しています。

- [drop()](./Partition-drop)

- [get_replicas()](./Partition-get_replicas)

- [release()](./Partition-release)

