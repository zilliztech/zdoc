---
title: "encode_queries() | Python"
slug: /python/python/GeminiEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクエリ文字列のリストを受け取り、各クエリをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: KtyxdkxpSoTvacxJp27cOXwCnhe
sidebar_position: 2
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - encode_queries()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# encode_queries()

この操作はクエリ文字列のリストを受け取り、各クエリをベクトル埋め込みにエンコードします。

## リクエスト構文\{#request-syntax}

```python
encode_queries(
    queries: List[str], 
) -> List[np.array]
```

**パラメーター:**

- **queries** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために embedding model に渡されるクエリを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリストです。

**例外:**

- **ImportError**

    model2vec モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

gemini_ef = model.dense.GeminiEmbeddingFunction(
    model_name="gemini-embedding-exp-03-07",
    api_key="YOUR_API_KEY",
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = gemini_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# Print dimension and shape of embeddings
print("Dim:", gemini_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-0.02066572,  0.02459551,  0.00707774, ...,  0.00259341,
#        -0.01797572, -0.00626168], shape=(3072,)), array([ 0.00674969,  0.03023903,  0.01230692, ...,  0.00160009,
#        -0.01710967,  0.00972728], shape=(3072,))]
# Dim 3072 (3072,)
```

