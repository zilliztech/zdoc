---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/VoyageEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "VoyageEmbeddingFunction におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。 | Python"
type: docx
token: DQFbdMhfcodFuxxhYFeccDzEnkf
sidebar_position: 4
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - \_\_call\_\_()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call\_\_()

[VoyageEmbeddingFunction](./EmbeddingModels-VoyageEmbeddingFunction) におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。

VoyageEmbeddingFunction の **\_\_call\_\_()** メソッドは、[encode_documents()](./VoyageEmbeddingFunction-encode_documents) および [encode_queries()](./VoyageEmbeddingFunction-encode_queries) と同じ機能を持ちます。

## リクエスト構文\{#request-syntax}

```python
# Instance created

voyage_ef = VoyageEmbeddingFunction()

# __call__ method will be called
voyage_ef(
    texts: List[str]
) -> List[np.array]
```

**パラメーター:**

- **texts** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるテキストを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリスト。

**例外:**

- **ImportError**

    Voyage モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus.model.dense import VoyageEmbeddingFunction

voyage_ef = VoyageEmbeddingFunction(
    model_name="voyage-lite-02-instruct", # Defaults to `voyage-2`
    api_key='YOUR_API_KEY' # Replace with your own Voyage API key
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

voyage_ef(docs)

# [array([ 0.02582654, -0.00907086, -0.04604037, ..., -0.01227521,
#          0.04420955, -0.00038829]),
#  array([ 0.03844212, -0.01597065, -0.03728884, ..., -0.02118733,
#          0.03349845,  0.0065346 ]),
#  array([ 0.05143557, -0.01096631, -0.02690451, ..., -0.02416254,
#          0.07658645,  0.03064499])]
```
