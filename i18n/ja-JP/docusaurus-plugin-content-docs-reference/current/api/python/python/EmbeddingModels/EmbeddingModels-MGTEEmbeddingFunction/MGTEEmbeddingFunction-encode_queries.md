---
title: "encode_queries() | Python"
slug: /python/python/MGTEEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クエリ文字列のリストを受け取り、各クエリを vector embedding にエンコードします。 | Python"
type: docx
token: HEWIdid9BoFMyNxN8Bbc0P3nn6g
sidebar_position: 2
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
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
) -> Dict
```

**PARAMETERS:**

- **queries** (*List[str]*)

    各文字列がエンコードのために embedding model に渡されるクエリを表す、文字列値のリストです。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**RETURN TYPE:**

*Dict*

**RETURNS:**

dense と sparse の両方のエンコード済み embedding を含む辞書です。

**Exceptions:**

*None*

## 例\{#examples}

```python
from pymilvus.model.hybrid import MGTEEmbeddingFunction

ef = MGTEEmbeddingFunction()

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print(ef.dim)

# Embeddings: {'dense': [tensor([ 6.5883e-03, -7.9415e-03, -3.3669e-02, -2.6450e-02,  1.4345e-02,
#          1.9612e-02, -8.1679e-02,  5.6361e-02,  6.9020e-02,  1.9827e-02,
#         -9.2933e-03, -1.9995e-02, -1.0055e-01, -5.4053e-02, -8.5991e-02,
#          8.3004e-02,  1.0870e-01,  1.1565e-01,  2.1268e-02, -1.3782e-02,
#         ...
#          3.2847e-02, -2.3751e-02,  3.4475e-02,  5.3623e-02, -3.3894e-02,
#          7.9408e-02,  8.2720e-03, -2.3459e-02], device='mps:0')], 'sparse': <Compressed Sparse Row sparse array of dtype 'float64'
#         with 13 stored elements and shape (2, 250002)>}

# {'dense': 768, 'sparse': 250002}
```
