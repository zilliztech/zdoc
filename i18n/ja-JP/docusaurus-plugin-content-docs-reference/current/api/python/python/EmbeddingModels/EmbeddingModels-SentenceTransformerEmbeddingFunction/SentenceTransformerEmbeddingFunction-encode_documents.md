---
title: "encode_documents() | Python"
slug: /python/python/SentenceTransformerEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: MOPzdeyjzoO8DlxAlL0clX00nBc
sidebar_position: 1
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
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

この操作はドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。

## リクエスト構文\{#request-syntax}

```python
encode_documents(
    documents: List[str], 
) -> List[np.array]
```

**パラメーター:**

- **documents** (*List[str]*)

    文字列値のリストで、各文字列はエンコードのために埋め込みモデルに渡されるドキュメントを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリスト。

**例外:**

- **ImportError**

    必要な sentence-transformers モジュールがインストールされていない場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

sentence_transformer_ef = model.dense.SentenceTransformerEmbeddingFunction(
    model_name='all-MiniLM-L6-v2', # Specify the model name
    device='cpu' # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = sentence_transformer_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", sentence_transformer_ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([-3.09392996e-02, -1.80662833e-02,  1.34775648e-02,  2.77156215e-02,
#        -4.86349640e-03, -3.12581174e-02, -3.55921760e-02,  5.76934684e-03,
#         2.80773244e-03,  1.35783911e-01,  3.59678417e-02,  6.17732145e-02,
# ...
#        -4.61330153e-02, -4.85207550e-02,  3.13997865e-02,  7.82178566e-02,
#        -4.75336798e-02,  5.21207601e-02,  9.04406682e-02, -5.36676683e-02],
#       dtype=float32)]
# Dim: 384 (384,)
```
