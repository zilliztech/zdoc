---
title: "release_partitions() | Python | MilvusClient"
slug: /python/python/Partitions-release_partitions
sidebar_label: "release_partitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定した collection 内の partition をメモリから解放します。 | Python | MilvusClient"
type: docx
token: VblKdUEU4o4t31xcFiicIGtjn9g
sidebar_position: 7
keywords: 
  - AI chatbots
  - cosine distance
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - release_partitions()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# release_partitions()

この操作は、指定した collection 内の partition をメモリから解放します。

<Admonition type="info" icon="📘" title="注意">

これは管理対象の collection にのみ適用されます。

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

    既存の collection の名前。

- **partition_names** (*str | list[str]*) -

    **[必須]**

    解放する partition の名前のリスト。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

<Admonition type="info" icon="📘" title="注意">

collection は、その partition のいずれかまたはすべてがロードされている場合にのみ loaded 状態になります。

</Admonition>

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

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

