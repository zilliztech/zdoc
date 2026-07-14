---
title: "drop_partition() | Python | MilvusClient"
slug: /python/python/Partitions-drop_partition
sidebar_label: "drop_partition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、現在の collection から指定された partition を削除します。 | Python | MilvusClient"
type: docx
token: HkOFdhgbOoz1wlxJIgWcU7EonWc
sidebar_position: 2
keywords: 
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - zilliz cloud
  - cloud
  - drop_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_partition()

この操作は、現在の collection から指定された partition を削除します。

<Admonition type="info" icon="📘" title="注意">

partition を削除する前に、まずそれを release する必要があります。

</Admonition>

<Admonition type="info" icon="📘" title="注意">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
drop_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存の collection の名前。

- **partition_name** (*str*) -

    **[REQUIRED]**

    削除する partition の名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# Create a partition
client.create_partition(
    collection_name="test_collection",
    partition_name="partition_A"
)

# Release partition before dropping
client.release_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# Drop the partition
client.drop_partition(
    collection_name="test_collection",
    partition_name="partition_A"
)
```
