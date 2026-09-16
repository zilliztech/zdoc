---
title: "flush() | Python | MilvusClient"
slug: /python/python/Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ストリーミングデータをフラッシュし、セグメントをシールします。小さなセグメントが生成されて検索パフォーマンスが低下する可能性があるため、すべてのデータをコレクションに挿入した後にこの操作を呼び出すことは推奨されません。 | Python | MilvusClient"
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

この操作は、ストリーミングデータをフラッシュし、セグメントをシールします。小さなセグメントが生成されて検索パフォーマンスが低下する可能性があるため、すべてのデータをコレクションに挿入した後にこの操作を呼び出すことは推奨されません。

<Admonition type="info" title="Notes">

これは管理対象のコレクションにのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
flush(
    self,
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメーター:**

- **collection_name** (*str*) -

    対象のコレクションの名前。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間。

    これを None に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

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

client.flush(
    collection_name="collection_name"
)
```

