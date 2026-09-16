---
title: "drop_collection_properties() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_properties
sidebar_label: "drop_collection_properties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクションのプロパティを削除します。 | Python | MilvusClient"
type: docx
token: HTnvdQ8SbodURtxPEv5cURL0n5b
sidebar_position: 12
keywords: 
  - マルチモーダルベクターデータベース検索
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection_properties()

この操作は、指定されたコレクションのプロパティを削除します。

<Admonition type="info" title="Notes">

これは外部コレクションには適用されません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
drop_collection_properties(
    self,
    collection_name: str,
    property_keys: List[str],
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメーター:**

- **collection_name** (*str*) -

    対象コレクションの名前です。

- **property_keys** (*List[str]*) -

    削除するプロパティの名前をリストで指定します。指定可能な値は以下のとおりです。

    - `collection.ttl.seconds`

    - `ttl_field`

    - `mmap.enabled`

    - `partitionkey.isolation`

- **timeout** (*Optional[float]*) - 

    この操作のタイムアウト時間です。

    これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定されたエイリアスが存在しない場合に発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# upsert properties
properties = {"collection.ttl.seconds": 500, "mmap.enabled": true}

client.drop_collection_properties(
    collection_name="collection_name", 
    property_keys=property_keys
)
```

