---
title: "drop_collection_properties() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_properties
sidebar_label: "drop_collection_properties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定された collection プロパティを削除します。 | Python | MilvusClient"
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

この操作は、指定された collection プロパティを削除します。

<Admonition type="info" icon="📘" title="Notes">

これは external collection には適用されません。

</Admonition>

## Request Syntax\{#request-syntax}

```python
drop_collection_properties(
    self,
    collection_name: str,
    property_keys: List[str],
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    対象 collection の名前。

- **property_keys** (*List[str]*) -

    リスト内で削除するプロパティの名前です。指定可能な値は次のとおりです。

    - `collection.ttl.seconds`

    - `ttl_field`

    - `mmap.enabled`

    - `partitionkey.isolation`

- **timeout** (*Optional[float]*) - 

    この操作のタイムアウト時間。

    これを None に設定すると、何らかのレスポンスが到着したとき、または何らかのエラーが発生したときにこの操作はタイムアウトすることを示します。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定された alias が存在しない場合に発生します。

## Example\{#example}

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

