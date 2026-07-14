---
title: "encode_queries() | Python"
slug: /python/python/Model2VecEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクエリ文字列のリストを受け取り、各クエリを vector embedding にエンコードします。 | Python"
type: docx
token: Px9Ydg6KSoNFV2xBumpcGBNqn8d
sidebar_position: 2
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
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

この操作はクエリ文字列のリストを受け取り、各クエリを vector embedding にエンコードします。

## リクエスト構文\{#request-syntax}

```python
encode_queries(
    queries: List[str], 
) -> List[np.array]
```

**PARAMETERS:**

- **queries** (*List[str]*)

    各文字列がエンコードのために embedding model に渡されるクエリを表す、文字列値のリストです。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**RETURN TYPE:**

*List[np.array]*

**RETURNS:**

各要素が NumPy 配列であるリストです。

**Exceptions:**

- **ImportError**

    model2vec モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

model2vec_ef = Model2VecEmbeddingFunction(
    model_source="minishlab/potion-base-8M" # Specify the model source (loads from Hugging Face or local path)
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = model2vec_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# Print dimension and shape of embeddings
print("Dim:", model2vec_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-1.87109038e-02, -2.81724217e-03, -1.67356253e-01, -5.30372337e-02,
#        1.08304240e-01, -1.09269567e-01, -2.53464818e-01, -1.77880954e-02,
#        3.05427872e-02,  1.68244764e-01, -7.25950347e-03, -2.52178032e-02,
#       -1.22040585e-01, -4.19903360e-02, -1.28572553e-01,  6.58077672e-02,
# ...
#       -2.45161876e-02,  4.75575700e-02,  1.03392657e-02,  5.65353176e-03,
#        8.60440824e-03,  2.12906860e-03,  1.50156394e-02, -1.29304864e-02,
#       -3.66544276e-02,  5.01735881e-03, -1.53137008e-02,  9.57900891e-04],
#      dtype=float32)]
# Dim: 256 (256,)
```

