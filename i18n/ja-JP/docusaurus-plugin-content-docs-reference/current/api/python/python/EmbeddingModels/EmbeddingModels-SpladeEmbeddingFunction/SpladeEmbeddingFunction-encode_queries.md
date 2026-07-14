---
title: "encode_queries() | Python"
slug: /python/python/SpladeEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クエリ文字列のリストを受け取り、各クエリをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: S9zPdiLkpokjfkxfZ68cWIFynnd
sidebar_position: 2
keywords: 
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - Large language model
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

この操作は、クエリ文字列のリストを受け取り、各クエリをベクトル埋め込みにエンコードします。

## リクエスト構文\{#request-syntax}

```python
encode_queries(
    queries: List[str], 
) -> csr_array
```

**PARAMETERS:**

- **queries** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるクエリを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**RETURN TYPE:**

*csr_array*

**RETURNS:**

クエリ埋め込みを表す圧縮疎行（CSR）行列です。

**Exceptions:**

- **ImportError**

    `transformers` ライブラリがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

splade_ef = model.sparse.SpladeEmbeddingFunction(
    model_name="naver/splade-cocondenser-selfdistil", 
    device="cpu"
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = splade_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# since the output embeddings are in a 2D csr_array format, we convert them to a list for easier manipulation.
print("Sparse dim:", splade_ef.dim, list(query_embeddings)[0].shape)

# Embeddings:   (0, 2001)   0.6353746056556702
#   (0, 2194)   0.015553371049463749
#   (0, 2301)   0.2756537199020386
# ...
#   (1, 18522)  0.1282549500465393
#   (1, 23602)  0.13133203983306885
#   (1, 28639)  2.8150033950805664
# Sparse dim: 30522 (1, 30522)
```
