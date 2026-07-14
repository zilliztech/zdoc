---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/GeminiEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Model2VecEmbeddingFunction におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。 | Python"
type: docx
token: Pvdhdb8IrozdCgx3N4fcTWdWnPg
sidebar_position: 4
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
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

[Model2VecEmbeddingFunction](./EmbeddingModels-Model2VecEmbeddingFunction) におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。

Model2VecEmbeddingFunction の **[GeminiEmbeddingFunction()](./EmbeddingModels-GeminiEmbeddingFunction)** メソッドは、[encode_documents()](./Model2VecEmbeddingFunction-encode_documents) および [encode_queries()](./Model2VecEmbeddingFunction-encode_queries) と同じ機能を共有します。

## リクエスト構文\{#request-syntax}

```python
# Instance created
gemini_ef = model.dense.GeminiEmbeddingFunction()

# __call__ method will be called
gemini_ef(
    texts: List[str]
) -> List[np.array]
```

**パラメータ:**

- **texts** (*List[str]*)

    各文字列がエンコードのために埋め込みモデルに渡されるテキストを表す、文字列値のリストです。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリスト。

**例外:**

- **ImportError**

    model2vec モジュールがインストールされていない場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

gemini_ef = model.dense.GeminiEmbeddingFunction(
    model_name="gemini-embedding-exp-03-07",
    api_key="YOUR_API_KEY",
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = gemini_ef.encode_documents(docs)

# Embeddings: [array([-0.00894029,  0.00573813,  0.013351  , ..., -0.00042766,
#        -0.00603091, -0.00341043], shape=(3072,)), array([ 0.00222347,  0.03725113,  0.01152256, ...,  0.01047272,
#        -0.01701597,  0.00565377], shape=(3072,)), array([ 0.00661134,  0.00232328, -0.01342973, ..., -0.00514429,
#        -0.02374139, -0.00701721], shape=(3072,))]
# Dim: 3072 (3072,)
```

