---
title: "encode_documents() | Python"
slug: /python/python/CohereEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: FIyedc51So0onWxtPAjcHFkmnHe
sidebar_position: 2
keywords: 
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画類似検索
  - ベクトル検索
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

    各文字列がエンコードのために埋め込みモデルに渡されるドキュメントを表す、文字列値のリストです。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリストです。

**例外:**

- **ValueError**

    この例外は、複数の埋め込み型を指定した場合、または CohereEmbeddingFunction の初期化で `int8` または `uint8` データ型を使用した場合に発生します。

## 例\{#examples}

```python
from pymilvus.model.dense import CohereEmbeddingFunction

cohere_ef = CohereEmbeddingFunction(
    model_name="embed-english-light-v3.0",
    api_key="YOUR_COHERE_API_KEY",
    input_type="search_document",
    embedding_types=["float"]
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = cohere_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", cohere_ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([ 3.43322754e-02,  1.16252899e-03, -5.25207520e-02,  1.32846832e-03,
#        -6.80541992e-02,  6.10961914e-02, -7.06176758e-02,  1.48925781e-01,
#         1.54174805e-01,  1.98516846e-02,  2.43835449e-02,  3.55224609e-02,
#         1.82952881e-02,  7.57446289e-02, -2.40783691e-02,  4.40063477e-02,
# ...
#         0.06359863, -0.01971436, -0.02253723,  0.00354195,  0.00222015,
#         0.00184727,  0.03408813, -0.00777817,  0.04919434,  0.01519775,
#        -0.02862549,  0.04760742, -0.07891846,  0.0124054 ], dtype=float32)]
# Dim: 384 (384,)
```
