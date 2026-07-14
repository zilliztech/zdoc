---
title: "list_partitions() | Python | MilvusClient"
slug: /python/python/Partitions-list_partitions
sidebar_label: "list_partitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection 内の partitions を一覧表示します。 | Python | MilvusClient"
type: docx
token: Dxgqdvlk5o2VScxqmL1ctc1Inqb
sidebar_position: 5
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - クラウド
  - list_partitions()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_partitions()

この操作は、指定された collection 内の partitions を一覧表示します。

<Admonition type="info" icon="📘" title="注記">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
list_partitions(
    collection_name: str,
    timeout: Optional[float] = None
) -> list
```

**パラメータ:**

- **collection_name** (*str*) -

    **[必須]**

    既存の collection の名前。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*list*

**戻り値:**

partition 名のリスト。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)

# 4. List the names of all existing partitions
client.list_partitions(
    collection_name="test_collection", 
)

# ['_default', 'partition_A']
```

## 関連メソッド\{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [load_partitions()](./Partitions-load_partitions)

- [release_partitions()](./Partitions-release_partitions)

