---
title: "add_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_function
sidebar_label: "add_collection_function()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションに新しい関数を追加します。関数を使用すると、BM25 スコアリングや埋め込み生成などのカスタム処理ロジックを定義できます。 | Python | MilvusClient"
type: docx
token: Qe3GdWZa9oAxjrx85tkct8ManRe
sidebar_position: 21
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースはどのように動作するか
  - ベクトル DB の比較
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

<Admonition type="info" title="Notes">

これは外部コレクションには適用されません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.add_collection_function(
    collection_name: str,
    function: Function,
    timeout: float = None,
    **kwargs
)
```

**パラメータ:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    コレクションの名前。

- **[function](./MilvusClient-Function)** (*[Function](./MilvusClient-Function)*) -

    **[REQUIRED]**

    追加する関数スキーマ。これは、関数名、型、入力フィールド、出力フィールド、およびパラメータを定義する `Function` オブジェクトです。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

- **kwargs** (*dict*) -

    追加のオプションパラメータ。

**戻り値の型:**

*NoneType*

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

## 例\{#example}

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
