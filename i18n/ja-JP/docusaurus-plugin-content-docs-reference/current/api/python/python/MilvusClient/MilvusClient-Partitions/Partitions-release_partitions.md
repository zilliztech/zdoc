---
title: "release_partitions() | Python | MilvusClient"
slug: /python/python/Partitions-release_partitions
sidebar_label: "release_partitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクション内のパーティションをメモリから解放します。 | Python | MilvusClient"
type: docx
token: VblKdUEU4o4t31xcFiicIGtjn9g
sidebar_position: 7
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - クラウド
  - release_partitions()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# release_partitions()

この操作は、指定したコレクション内のパーティションをメモリから解放します。

<Admonition type="info" title="Notes">

これは管理対象のコレクションにのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
release_partitions(
    collection_name: str,
    partition_names: str | List[str],
    timeout: Optional[float] = None
) -> None
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    既存のコレクションの名前。

- **partition_names** (*str | list[str]*) -

    **[必須]**

    解放するパーティションの名前のリスト。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

<Admonition type="info" title="Notes">

コレクションがロード済み状態になるのは、そのパーティションの一部またはすべてがロードされている場合のみです。

</Admonition>

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

# 2. Create a collection and get its load status
client.create_collection(collection_name="test_collection", dimension=5)

res = client.get_load_state(
    collection_name="test_collection"
)

print(res)

# {'state': <LoadState: Loaded>}

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)

# 4. Check the load status of the partition
res = client.get_load_state(
    collection_name="test_collection",
    partition_name="partition_A",
)

print(res)

# {'state': <LoadState: Loaded>}

# 5. Release the partition
client.release_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# 6. Check the load status
res = client.get_load_state(
    collection_name="test_collection",
    partition_name="partition_A"
)

print(res)

# {'state': <LoadState: NotLoad>}

res = client.get_load_state(
    collection_name="test_collection"
)

# {'state': <LoadState: Loaded>}
```

## 関連メソッド\{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

