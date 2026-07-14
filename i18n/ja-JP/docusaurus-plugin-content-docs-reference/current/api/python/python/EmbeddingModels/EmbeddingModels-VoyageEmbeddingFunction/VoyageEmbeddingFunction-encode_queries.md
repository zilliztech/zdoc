---
title: "encode_queries() | Python"
slug: /python/python/VoyageEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クエリ文字列のリストを受け取り、各クエリを vector embedding にエンコードします。 | Python"
type: docx
token: CHnGdE7XlosONPxsVDDc6Fv5n8c
sidebar_position: 2
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
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

**パラメータ:**

- **queries** (*List[str]*)

    文字列値のリスト。各文字列は、エンコードのために embedding model に渡されるクエリを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリスト。

**例外:**

- **ImportError**

    Voyage モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus.model.dense import VoyageEmbeddingFunction

voyage_ef = VoyageEmbeddingFunction(
    model_name="voyage-lite-02-instruct", # Defaults to `voyage-2`
    api_key='YOUR_API_KEY' # Replace with your own Voyage API key
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = voyage_ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", voyage_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([ 0.01733501, -0.0230672 , -0.05208827, ..., -0.00957995,
#         0.04493361,  0.01485138]), array([ 0.05937521, -0.00729363, -0.02184347, ..., -0.02107683,
#         0.05706626,  0.0263358 ])]
# Dim 1024 (1024,)
```
