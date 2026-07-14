---
title: "encode_documents() | Python"
slug: /python/python/MGTEEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: GyrmdRjGZoOFKdxsYyCcvNG7npg
sidebar_position: 1
keywords: 
  - vector database とは
  - vector database の比較
  - Faiss
  - Video search
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
) -> Dict
```

**パラメータ:**

- **documents** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるドキュメントを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*Dict*

**戻り値:**

dense と sparse の両方のエンコード済みの埋め込みを含む辞書。

**例外:**

*None*

## 例\{#examples}

```python
from pymilvus.model.hybrid import MGTEEmbeddingFunction

ef = MGTEEmbeddingFunction()

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension of embeddings
print(ef.dim)

# Embeddings: {'dense': [tensor([-4.9149e-03,  1.6553e-02, -9.5524e-03, -2.1800e-02,  1.2075e-02,
#          1.8500e-02, -3.0632e-02,  5.5909e-02,  8.7365e-02,  1.8763e-02,
#          2.1708e-03, -2.7530e-02, -1.1523e-01,  6.5810e-03, -6.4674e-02,
#          6.7966e-02,  1.3005e-01,  1.1942e-01, -1.2174e-02, -4.0426e-02,
#         ...
#          2.0129e-02, -2.3657e-02,  2.2626e-02,  2.1858e-02, -1.9181e-02,
#          6.0706e-02, -2.0558e-02, -4.2050e-02], device='mps:0')], 'sparse': <Compressed Sparse Row sparse array of dtype 'float64'
#         with 41 stored elements and shape (3, 250002)>}

# {'dense': 768, 'sparse': 250002}
```

