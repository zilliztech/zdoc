---
title: "encode_queries() | Python"
slug: /python/python/BGEM3EmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクエリ文字列のリストを受け取り、各クエリをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: UehMdosTGoZVzaxdTcUcpy1ynef
sidebar_position: 3
keywords: 
  - Sparse と Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
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
) -> Dict
```

**パラメータ:**

- **queries** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために embedding model に渡されるクエリを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**戻り値の型:**

*Dict*

**戻り値:**

クエリの埋め込みを含む辞書です。

[BGEM3EmbeddingFunction](./EmbeddingModels-BGEM3EmbeddingFunction) を初期化する際に、**return_dense**、**return_sparse**、および **return_colbert_vecs** が **True** に設定されている場合、返される辞書には **dense**、**sparse**、および **colbert_vecs** のキーが含まれ、それぞれ対応する dense embedding、sparse word embedding、および ColBERT vector が格納されます。

**例外:**

- **ImportError**

    この例外は、FlagEmbedding モジュールがインストールされていない場合に発生します。

## 例\{#examples}

```python
from pymilvus import model

bge_m3_ef = model.hybrid.BGEM3EmbeddingFunction(
    model_name='BAAI/bge-m3', # Specify t`he model name
    device='cpu', # Specify the device to use, e.g., 'cpu' or 'cuda:0'
    use_fp16=False # Whether to use fp16. `False` for `device='cpu'`.
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = bge_m3_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# Print dimension of dense embeddings
print("Dense query dim:", bge_m3_ef.dim["dense"], query_embeddings["dense"][0].shape)
# Since the sparse embeddings are in a 2D csr_array format, we convert them to a list for easier manipulation.
print("Sparse query dim:", bge_m3_ef.dim["sparse"], list(query_embeddings["sparse"])[0].shape)

# Embeddings: {'dense': [array([-0.02024024, -0.01514386,  0.02380808, ...,  0.00234648,
#        -0.00264978, -0.04317448], dtype=float32), array([ 0.00648045, -0.0081542 , -0.02717067, ..., -0.00380103,
#         0.04200587, -0.01274772], dtype=float32)], 'sparse': <2x250002 sparse array of type '<class 'numpy.float32'>'
#   with 14 stored elements in Compressed Sparse Row format>}
# Dense query dim: 1024 (1024,)
# Sparse query dim: 250002 (1, 250002)
```
