---
title: "get_load_state() | Python | MilvusClient"
slug: /python/python/Management-get_load_state
sidebar_label: "get_load_state()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection または partition がロードされているかどうかを表示します。 | Python | MilvusClient"
type: docx
token: KEPYdKup1o3nHdxKbjvcQUzwnnd
sidebar_position: 8
keywords: 
  - 音声類似検索
  - Elastic vector database
  - Pinecone と Milvus の比較
  - Chroma と Milvus の比較
  - zilliz
  - zilliz cloud
  - cloud
  - get_load_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_load_state()

この操作は、指定された collection または partition がロードされているかどうかを表示します。

<Admonition type="info" icon="📘" title="注意">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
get_load_state(
    collection_name: str,
    partition_name: Optional[str] = "",
    timeout: Optional[float] = None
) -> Dict
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    collection の名前。

- **partition_name** (*str*) -

    partition の名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。これを **None** に設定すると、いずれかのレスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*dict*

**戻り値:**

指定された collection または partition の状態を含む辞書。 

<Admonition type="info" icon="📘" title="注意">

collection は、その partition のいずれかまたはすべてがロードされている場合、loaded 状態になります。

</Admonition>

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="quick_setup", dimension=5)

# 3. Check the load status of the collection
client.get_load_state(collection_name="quick_setup") 

# {'state': <LoadState: Loaded>}

# 4. Release the collection
client.release_collection(collection_name="quick_setup")
client.get_load_state(collection_name="quick_setup") 

# {'state': <LoadState: NotLoad>}

# 5. Create a partition
client.create_partition(
    collection_name="quick_setup", 
    partition_name="partition_A"
)

# 6. Load a partition
client.load_partitions(
    collection_name="quick_setup",
    partition_names=["partition_A"]
)

client.get_load_state(collection_name="quick_setup") 

# {'state': <LoadState: Loaded>}

client.get_load_state(
    collection_name="quick_setup",
    partition_name="partition_A"
) 

# {'state': <LoadState: Loaded>}
```

## 関連メソッド\{#related-methods}

- [load_collection()](./Management-load_collection)

- [refresh_load()](./Management-refresh_load)

- [release_collection()](./Management-release_collection)

