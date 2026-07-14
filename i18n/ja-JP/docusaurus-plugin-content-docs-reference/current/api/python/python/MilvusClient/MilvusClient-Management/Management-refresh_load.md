---
title: "refresh_load() | Python | MilvusClient"
slug: /python/python/Management-refresh_load
sidebar_label: "refresh_load()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ロード済み collection の未ロードデータをメモリにロードします。 | Python | MilvusClient"
type: docx
token: X3NXdtC2koiAxyxhcUBcv38Wnsh
sidebar_position: 12
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - refresh_load()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# refresh_load()

この操作は、ロード済み collection の未ロードデータをメモリにロードします。

<Admonition type="info" icon="📘" title="注意">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
refresh_load(
    collection_name: str,
    timeout: Optional[str] = None
)
```

**パラメータ:**

- **collection_name** (*str*) -

    **[必須]**

    この操作の対象 collection の名前。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. Refresh the load status of the collection
client.refresh_load(
    collection_name="test_collection"
)
```

## 関連メソッド\{#related-methods}

- [get_load_state()](./Management-get_load_state)

- [load_collection()](./Management-load_collection)

- [release_collection()](./Management-release_collection)

