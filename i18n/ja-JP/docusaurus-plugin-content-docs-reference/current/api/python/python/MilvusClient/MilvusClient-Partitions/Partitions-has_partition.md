---
title: "has_partition() | Python | MilvusClient"
slug: /python/python/Partitions-has_partition
sidebar_label: "has_partition()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection に指定された partition が存在するかどうかを確認します。 | Python | MilvusClient"
type: docx
token: MxTAd0haboKnRrxQvoOckGghn1T
sidebar_position: 4
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - has_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_partition()

この操作は、指定された collection に指定された partition が存在するかどうかを確認します。

<Admonition type="info" icon="📘" title="注意">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
has_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None
) -> bool
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    既存の collection の名前。

- **partition_name** (*string*)

    **[必須]**

    確認する partition の名前。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*bool*

**戻り値:**

指定された partition が存在するかどうかを示すブール値。

**例外:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合に、この例外が発生します。

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

# 4. Check whether the partition exists
client.has_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
) 

# True
```

## 関連メソッド\{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

- [release_partitions()](./Partitions-release_partitions)

