---
title: "encode_documents() | Python"
slug: /python/python/GeminiEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: Tjq5dE0wdodKcgxH0yZcmNdrnSg
sidebar_position: 1
keywords: 
  - cosine distance
  - vector database とは
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - encode_documents()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# encode_documents()

この操作は、ドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。

## Request syntax\{#request-syntax}

```python
encode_documents(
    documents: List[str], 
) -> List[np.array]
```

**パラメーター:**

- **documents** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるドキュメントを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリストです。

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

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", gemini_ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([-0.00894029,  0.00573813,  0.013351  , ..., -0.00042766,
#        -0.00603091, -0.00341043], shape=(3072,)), array([ 0.00222347,  0.03725113,  0.01152256, ...,  0.01047272,
#        -0.01701597,  0.00565377], shape=(3072,)), array([ 0.00661134,  0.00232328, -0.01342973, ..., -0.00514429,
#        -0.02374139, -0.00701721], shape=(3072,))]
# Dim: 3072 (3072,)
```

