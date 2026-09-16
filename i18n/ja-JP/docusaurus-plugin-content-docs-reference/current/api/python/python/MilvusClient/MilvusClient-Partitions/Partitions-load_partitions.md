---
title: "load_partitions() | Python | MilvusClient"
slug: /python/python/Partitions-load_partitions
sidebar_label: "load_partitions()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクション内の特定のパーティションセットをメモリにロードします。 | Python | MilvusClient"
type: docx
token: TMq5d6wFmoT8u3xwuruc8k6wnTg
sidebar_position: 6
keywords: 
  - 最近傍探索
  - Agentic RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - zilliz
  - zilliz cloud
  - クラウド
  - load_partitions()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load_partitions()

この操作は、指定されたコレクション内の特定のパーティションセットをメモリにロードします。

<Admonition type="info" title="Notes">

これはマネージドコレクションにのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
load_partitions(
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

    ロードするパーティションの名前のリスト。

- **priority** (*string*) -

    現在のコレクションのロード優先度。この値は、ロード処理中の CPU 使用率に影響する可能性があります。指定可能な値は `low` と `high` です。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

<Admonition type="info" title="Notes">

コレクションは、そのパーティションの一部またはすべてがロードされている場合にのみ loaded 状態になります。

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

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)

# 4. Release the collection
client.release_collection(collection_name="test_collection")

# 5. Load a partition
client.load_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# 6. Check the load status of the collection
client.get_load_state(collection_name="test_collection") 

# {'state': <LoadState: Loaded>}

# 7. Check the load status of the partition
client.get_load_state(
    collection_name="test_collection",
    partition_name="partition_A",
)

# {'state': <LoadState: Loaded>}
```

## 関連メソッド\{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [release_partitions()](./Partitions-release_partitions)

