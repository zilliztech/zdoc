---
title: "encode_queries() | Python"
slug: /python/python/JinaEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクエリ文字列のリストを受け取り、各クエリを vector embedding にエンコードします。 | Python"
type: docx
token: FgbjdQHBEoITxgxk7NMc1NzpnAc
sidebar_position: 2
keywords: 
  - vector embedding とは
  - vector database チュートリアル
  - vector database はどのように動作するか
  - vector db 比較
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

    文字列値のリストです。各文字列は、エンコードのために embedding model に渡されるクエリを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**RETURN TYPE:**

*List[np.array]*

**RETURNS:**

各要素が NumPy 配列であるリストです。

**Exceptions:**

- **RuntimeError**

    Jina API からのレスポンスに `data` キーが含まれていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus.model.dense import JinaEmbeddingFunction

jina_ef = JinaEmbeddingFunction(
    model_name="jina-embeddings-v2-base-en", # Defaults to `jina-embeddings-v2-base-en`
    api_key="YOUR_JINAAI_API_KEY" # Provide your Jina AI API key
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = jina_ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", jina_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-5.99164660e-01, -3.49827350e-01,  8.22405160e-01, -1.18632730e-01,
#         5.78107540e-01,  1.09789170e-01,  2.91604200e-01, -3.29306450e-01,
#         2.93779640e-01, -2.17880800e-01, -6.84535440e-01, -3.79752000e-01,
#        -3.47541800e-01,  9.20846100e-02, -6.13804400e-01,  6.31312800e-01,
# ...
#        -1.84993740e-02,  9.38629150e-01,  2.74858470e-02,  1.09396360e+00,
#         3.96270750e-01,  7.44445800e-01, -1.95404050e-01, -6.08383200e-01,
#        -3.75076300e-01,  3.87512200e-01,  8.11889650e-01, -3.76407620e-01])]
# Dim 768 (768,)
```
