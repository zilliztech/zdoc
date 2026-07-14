---
title: "add_function() | Python | MilvusClient"
slug: /python/python/Function-add_function
sidebar_label: "add_function()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、生データをベクトル表現に変換する関数を追加します。 | Python | MilvusClient"
type: docx
token: XhcVd1JXvoAgUfxSEpQcL2H6nVg
sidebar_position: 1
keywords: 
  - 自然言語処理データベース
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - add_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_function()

この操作は、生データをベクトル表現に変換する関数を追加します。

## リクエスト構文\{#request-syntax}

```python
add_function(
   function: Function
)
```

**パラメーター:**

- `function` (*[Function](./MilvusClient-Function)*)

    **[必須]**

    データをベクトル埋め込みに変換する `Function` クラスのインスタンスです。この関数はコレクションのスキーマに追加されます。

**戻り値の型:**

*[CollectionSchema](./MilvusClient-CollectionSchema)*

**戻り値:**

`CollectionSchema` オブジェクト

**例外:**

- `FunctionIncorrectType`

    `function` パラメーターの型が正しくない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient, Function, FunctionType

schema = MilvusClient.create_schema()

bm25_function = Function(
    name="bm25_fn",
    input_field_names=["document_content"],
    output_field_names="sparse_vector",
    function_type=FunctionType.BM25,
)

schema.add_function(bm25_function)
```

