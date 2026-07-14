---
title: "create_partition() | Python | MilvusClient"
slug: /python/python/Partitions-create_partition
sidebar_label: "create_partition()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は対象のコレクションにパーティションを作成します。 | Python | MilvusClient"
type: docx
token: I6hvdlYUuoUaw3xWqSnce4Fin9g
sidebar_position: 1
keywords: 
  - openai vector db
  - 自然言語処理データベース
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - create_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_partition()

この操作は対象のコレクションにパーティションを作成します。

<Admonition type="info" icon="📘" title="注記">

これはマネージドコレクションにのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
create_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None
) -> None
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    既存のコレクションの名前。

- **partition_name** (*string*)

    **[必須]**

    作成するパーティションの名前。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*[Partition](./ORM-Partition)*

**戻り値:**

パーティションオブジェクト。

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
```

## 関連メソッド\{#related-methods}

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

- [release_partitions()](./Partitions-release_partitions)

