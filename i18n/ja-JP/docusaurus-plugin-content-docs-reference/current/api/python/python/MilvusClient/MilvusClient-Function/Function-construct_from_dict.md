---
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/Function-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、辞書表現から `Function` オブジェクトを構築します。 | Python | MilvusClient"
type: docx
token: I0EbdzommoeSo7xQSeXcRXeanfg
sidebar_position: 2
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - クラウド
  - construct_from_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

この操作は、辞書表現から `Function` オブジェクトを構築します。

## リクエスト構文\{#request-syntax}

```python
construct_from_dict(
```

**パラメーター:**

- **raw** (*dict*) -

    コレクションスキーマを構築するための生データを含む辞書です。

**戻り値の型:**

*[Function](./MilvusClient-Function)*

**戻り値:**

Function オブジェクトです。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import Function  

function_dict = {  
    "name": "bm25",  
    "type": "BM25",  
    "input_field_names": ["text"],  
    "output_field_names": ["score"],  
    "description": "BM25 text search function",  
}  

function = Function.construct_from_dict(function_dict)  

print(function)
```
