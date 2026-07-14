---
title: "encode_documents() | Python"
slug: /python/python/NomicEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: H8ncdzr6roh9G6xQm8BcJFamnhf
sidebar_position: 1
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
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

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるドキュメントを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリスト。

**例外:**

- **ValueError**

    `api_key` が指定されておらず、`NOMIC_API_KEY` 環境変数も設定されていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus.model.dense import NomicEmbeddingFunction

ef = NomicEmbeddingFunction(
    model_name="nomic-embed-text-v1.5", # Defaults to `mistral-embed`
    api_key="NOMIC_API_KEY" # Provide your Nomic API key
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([ 5.59997560e-02,  7.23266600e-02, -1.51977540e-01, -4.53491200e-02,
#         6.49414060e-02,  4.33654800e-02,  2.26593020e-02, -3.51867680e-02,
#         3.49998470e-03,  1.75571440e-03, -4.30297850e-03,  1.81274410e-02,
#         ...
#        -1.64337160e-02, -3.85437000e-02,  6.14318850e-02, -2.82745360e-02,
#        -7.25708000e-02, -4.15563580e-04, -7.63320900e-03,  1.88446040e-02,
#        -5.78002930e-02,  1.69830320e-02, -8.91876200e-03, -2.37731930e-02])]
# Dim: 768 (768,)
```
