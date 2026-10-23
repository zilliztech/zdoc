---
title: "alter_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_function
sidebar_label: "alter_collection_function()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内の既存の関数を新しい関数スキーマに置き換えて変更します。 | Python | MilvusClient"
type: docx
token: TBe0dMVZlogHEdxUs97cHDownUd
sidebar_position: 22
keywords: 
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトル DB とは
  - ベクトルデータベースとは何か
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_collection_function()

この操作は、コレクション内の既存の関数を新しい関数スキーマに置き換えて変更します。

<Admonition type="info" title="Note">

これは外部コレクションには適用されません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.alter_collection_function(
    collection_name: str,
    function_name: str,
    function: Function,
    timeout: float = None,
    **kwargs
)
```

**パラメータ:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    コレクションの名前です。

- **function_name** (*str*) -

    **[REQUIRED]**

    変更する関数の名前です。

- **function** (*[Function](Function/Function.md*) -

    **[REQUIRED]**

    既存の関数スキーマを置き換える新しい関数スキーマです。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトすることを示します。

- **kwargs** (*dict*) -

    オプションの追加パラメータです。

**戻り値の型:**

*NoneType*

**戻り値:**

None。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#examples}

```python
from pymilvus import MilvusClient, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

updated_function = Function(
    name="bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
    params={"bm25_k1": 1.5, "bm25_b": 0.75},
)

client.alter_collection_function(
    collection_name="my_collection",
    function_name="bm25",
    function=updated_function,
)
```
