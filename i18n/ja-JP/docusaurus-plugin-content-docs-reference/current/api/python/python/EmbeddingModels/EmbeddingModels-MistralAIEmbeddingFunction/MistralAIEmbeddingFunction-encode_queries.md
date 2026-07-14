---
title: "encode_queries() | Python"
slug: /python/python/MistralAIEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクエリ文字列のリストを受け取り、各クエリをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: SptWdOyFqoGM5VxVS16cofqfnDg
sidebar_position: 2
keywords: 
  - マルチモーダル RAG
  - llm ハルシネーション
  - ハイブリッド検索
  - lexical search
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

    各文字列がエンコードのために埋め込みモデルに渡されるクエリを表す、文字列値のリストです。モデルはリスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリストです。

**例外:**

- **ValueError**

    `api_key` が指定されておらず、`MISTRALAI_API_KEY` 環境変数も設定されていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus.model.dense import MistralAIEmbeddingFunction

ef = MistralAIEmbeddingFunction(
    model_name="mistral-embed", # Defaults to `mistral-embed`
    api_key="MISTRAL_API_KEY" # Provide your Mistral AI API key
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-0.04916382,  0.04568481,  0.03594971, ..., -0.02653503,
#         0.02804565,  0.00600815]), array([-0.05938721,  0.07098389,  0.01773071, ..., -0.01708984,
#         0.03582764,  0.00366592])]
# Dim 1024 (1024,)
```
