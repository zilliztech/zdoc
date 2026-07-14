---
title: "\\_\\_call()\\_\\_ | Python"
slug: /python/python/CohereEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CohereEmbeddingFunction のこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。 | Python"
type: docx
token: P2n8d2wQtoK8YqxnccocmNwRnKb
sidebar_position: 4
keywords: 
  - 自然言語検索
  - 類似検索
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - \_\_call()\_\_
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call()\_\_

[CohereEmbeddingFunction](./EmbeddingModels-CohereEmbeddingFunction) のこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。

CohereEmbeddingFunction の **\_\_call\_\_()** メソッドは、[encode_documents()](./CohereEmbeddingFunction-encode_documents) および [encode_queries()](./CohereEmbeddingFunction-encode_queries) と同じ機能を共有します。

## リクエスト構文\{#request-syntax}

```python
# インスタンスを作成済み

cohere_ef = CohereEmbeddingFunction()

# __call__ メソッドが呼び出されます
cohere_ef(
    texts: List[str]
) -> List[np.array]
```

**パラメータ:**

- **texts** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために embedding model に渡されるテキストを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリストです。

**例外:**

- **ValueError**

    この例外は、複数の embedding type を指定した場合、または CohereEmbeddingFunction の初期化時に `int8` もしくは `uint8` データ型を使用した場合に発生します。

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

cohere_ef(docs)

# [array([ 3.43322754e-02,  1.16252899e-03, -5.25207520e-02,  1.32846832e-03,
#         -6.80541992e-02,  6.10961914e-02, -7.06176758e-02,  1.48925781e-01,
#          1.54174805e-01,  1.98516846e-02,  2.43835449e-02,  3.55224609e-02,
#          1.82952881e-02,  7.57446289e-02, -2.40783691e-02,  4.40063477e-02,
# ...
#          0.06008911, -0.05160522, -0.02758789, -0.06750488,  0.03050232,
#          0.01448822,  0.0236969 ,  0.09527588, -0.01791382, -0.04812622,
#          0.06359863, -0.01971436, -0.02253723,  0.00354195,  0.00222015,
#          0.00184727,  0.03408813, -0.00777817,  0.04919434,  0.01519775,
#         -0.02862549,  0.04760742, -0.07891846,  0.0124054 ], dtype=float32)]
```
