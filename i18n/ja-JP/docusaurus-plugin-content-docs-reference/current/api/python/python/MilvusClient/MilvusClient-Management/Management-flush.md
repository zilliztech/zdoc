---
title: "flush() | Python | MilvusClient"
slug: /python/python/Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はストリーミングデータを flush してセグメントを seal します。小さなセグメントが生成されて検索パフォーマンスが低下する可能性があるため、collection へのすべてのデータ挿入後にこの操作を呼び出すことは推奨されません。 | Python | MilvusClient"
type: docx
token: JnPrdOiPyo2e5gxzzFycbnvwnSd
sidebar_position: 6
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush()

この操作はストリーミングデータを flush してセグメントを seal します。小さなセグメントが生成されて検索パフォーマンスが低下する可能性があるため、collection へのすべてのデータ挿入後にこの操作を呼び出すことは推奨されません。

<Admonition type="info" icon="📘" title="注意">

これは managed collection にのみ適用されます。

</Admonition>

## Request Syntax\{#request-syntax}

```python
flush(
    self,
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    対象の collection の名前。

- **timeout** (*Optional[float]*) - 

    この操作のタイムアウト時間。

    これを None に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

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

client.flush(
    collection_name="collection_name"
)
```

