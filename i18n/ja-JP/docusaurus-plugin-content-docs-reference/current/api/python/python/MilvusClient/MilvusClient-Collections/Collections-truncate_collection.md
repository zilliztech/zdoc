---
title: "truncate_collection() | Python | MilvusClient"
slug: /python/python/Collections-truncate_collection
sidebar_label: "truncate_collection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスキーマ、制約、インデックスを保持したまま、すべてのエンティティを削除します。現在のタイムスタンプより前にフラッシュされたすべてのエンティティを検索とクエリから隠し、バックグラウンドで削除するため、エンティティを削除するよりも効率的です。 | Python | MilvusClient"
type: docx
token: QsIndHtmXohzARxrQdBcVTJun9g
sidebar_position: 25
keywords: 
  - Zilliz
  - Milvus ベクトルデータベース
  - Milvus データベース
  - Milvus ベクトルデータベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - truncate_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# truncate_collection()

この操作は、コレクションのスキーマ、制約、インデックスを保持したまま、すべてのエンティティを削除します。現在のタイムスタンプより前にフラッシュされたすべてのエンティティを検索とクエリから隠し、バックグラウンドで削除するため、エンティティを削除するよりも効率的です。

<Admonition type="info" title="Notes">

これは外部コレクションには適用されません。

</Admonition>

<Admonition type="info" title="Note">

これは外部コレクションには適用されません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
truncate_collection(
```

**パラメーター:**

- **collection_name** (*string*) -

    **[必須]**

    対象のコレクションの名前です。

- **timeout** (*float*) -

    RPC リクエストのタイムアウト（秒単位）。None の場合、呼び出しは無期限に待機します。

**戻り値の型:**

*None*

**戻り値:**

None。

**例外:**

- **CollectionNotExists**

    この例外は、指定されたコレクションが存在しない場合に送出されます。この例外は、指定されたコレクションが存在しない場合に送出されます。

## 例\{#examples}

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.truncate_collection(
    collection_name="my_collection"
)
```
