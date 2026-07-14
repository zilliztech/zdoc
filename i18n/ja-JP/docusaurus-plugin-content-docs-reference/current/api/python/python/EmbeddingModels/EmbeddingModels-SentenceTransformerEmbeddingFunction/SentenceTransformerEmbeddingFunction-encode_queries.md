---
title: "encode_queries() | Python"
slug: /python/python/SentenceTransformerEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クエリ文字列のリストを受け取り、各クエリを vector embedding にエンコードします。 | Python"
type: docx
token: HTx1dgoAloCELUxWLGxc0GPlno6
sidebar_position: 2
keywords: 
  - 動画類似検索
  - Vector retrieval
  - 音声類似検索
  - Elastic vector database
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

この操作は、クエリ文字列のリストを受け取り、各クエリを vector embedding にエンコードします。

## リクエスト構文\{#request-syntax}

```python
encode_queries(
    queries: List[str], 
) -> List[np.array]
```

**PARAMETERS:**

- **queries** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために embedding model に渡されるクエリを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**RETURN TYPE:**

*List[np.array]*

**RETURNS:**

各要素が NumPy 配列であるリスト。

**Exceptions:**

- **ImportError**

    必要な sentence-transformers モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

sentence_transformer_ef = model.dense.SentenceTransformerEmbeddingFunction(
    model_name='all-MiniLM-L6-v2', # Specify the model name
    device='cpu' # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = sentence_transformer_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# Print dimension and shape of embeddings
print("Dim:", sentence_transformer_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-2.52114702e-02, -5.29330298e-02,  1.14570223e-02,  1.95571519e-02,
#        -2.46500354e-02, -2.66519729e-02, -8.48201662e-03,  2.82961670e-02,
#        -3.65092754e-02,  7.50745758e-02,  4.28900979e-02,  7.18822703e-02,
# ...
#        -6.76431581e-02, -6.45996556e-02, -4.67132553e-02,  4.78532910e-02,
#        -2.31596199e-03,  4.13446948e-02,  1.06935494e-01, -1.08258888e-01],
#       dtype=float32)]
# Dim: 384 (384,)
```
