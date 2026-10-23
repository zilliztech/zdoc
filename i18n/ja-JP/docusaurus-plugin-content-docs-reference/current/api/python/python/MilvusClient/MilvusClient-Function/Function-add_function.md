---
title: "add_function() | Python | MilvusClient"
slug: /python/python/Function-add_function
sidebar_label: "add_function()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、生データをベクトル表現に変換する関数を追加します。 | Python | MilvusClient"
type: docx
token: Mzq0dJGdSo4PBBxO3QLcjtjPnxf
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
```

**パラメーター:**

- **function** (*[Function](./MilvusClient-Function)*) -

    **[必須]**

    An instance of the Function class that converts data into ベクトル embeddings. This function will be added to the スキーマ of a コレクション.

**戻り値の型:**

*CollectionSchema*

**戻り値:**

A CollectionSchema object.

**例外:**

- **FunctionIncorrectType**

    This exception will be raised when the `function` parameter is of the incorrect type. This exception will be raised when the `function` parameter is of the incorrect type.

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
