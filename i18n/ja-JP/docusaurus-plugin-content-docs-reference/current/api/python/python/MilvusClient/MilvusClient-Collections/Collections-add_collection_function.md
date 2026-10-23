---
title: "add_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_function
sidebar_label: "add_collection_function()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションに新しい関数を追加します。関数を使用すると、BM25 スコアリングや埋め込み生成などのカスタム処理ロジックを定義できます。 | Python | MilvusClient"
type: docx
token: SHnzddV1yo6yO3xCxJpcztCCnsw
sidebar_position: 21
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - cloud
  - add_collection_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_collection_function()

この操作は、コレクションに新しい関数を追加します。関数を使用すると、BM25 スコアリングや埋め込み生成などのカスタム処理ロジックを定義できます。

<Admonition type="info" title="Note">

PyMilvus v3.0.2 以降では非推奨です。Milvus 3.0 以降では関数を個別に追加できないため、このメソッドは非推奨となりました。代わりに add_function_field() を使用してください。このメソッドは、関数を出力フィールドおよびインデックスとともに追加します。

</Admonition>

<Admonition type="info" title="Note">

これは外部コレクションには適用されません。

</Admonition>

## Request Syntax\{#request-syntax}

```python
client.add_collection_function(
    collection_name: str,
    function: Function,
    timeout: float = None,
    **kwargs
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    コレクションの名前です。

- **function** (*[Function](Function/Function.md*) -

    **[REQUIRED]**

    追加する関数スキーマです。これは、関数名、タイプ、入力フィールド、出力フィールド、およびパラメーターを定義する Function オブジェクトです。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。None に設定すると、応答が返されたとき、またはエラーが発生したときにこの操作がタイムアウトすることを示します。

- **kwargs** (*dict*) -

    オプションの追加パラメーターです。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

なし。

**EXCEPTIONS:**

- **MilvusException**

    この操作中にエラーが発生すると、この例外が発生します。この操作中にエラーが発生すると、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import MilvusClient, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

bm25_function = Function(
    name="bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
)

client.add_collection_function(
    collection_name="my_collection",
    function=bm25_function,
)
```
