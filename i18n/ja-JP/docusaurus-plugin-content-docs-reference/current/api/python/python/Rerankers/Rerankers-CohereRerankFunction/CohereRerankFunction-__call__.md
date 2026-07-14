---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/CohereRerankFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CohereRerankFunction におけるこの操作は、クエリとドキュメント文字列を受け取り、スコア順にランク付けされた上位 k 件のドキュメントを含む `RerankResult` オブジェクトのリストを返します。 | Python"
type: docx
token: M7pWdbu8foKkJAxY3uBcMfHrnrh
sidebar_position: 2
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - \_\_call\_\_()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call\_\_()

[CohereRerankFunction](./Rerankers-CohereRerankFunction) におけるこの操作は、クエリとドキュメント文字列を受け取り、スコア順にランク付けされた上位 k 件のドキュメントを含む `RerankResult` オブジェクトのリストを返します。

## リクエスト構文\{#request-syntax}

```python
# Instance created
cohere_rf = CohereRerankFunction()

# __call__ method will be called
cohere_rf(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> List[RerankResult]
```

**PARAMETERS:**

- `query` (*string*)

    ランキングに使用するクエリ文字列。

- `documents` (*List[str]*)

    指定されたクエリに対してランク付けされるドキュメント文字列のリスト。

- `top_k` (*int*)

    返される上位ランクのドキュメントの最大数。デフォルトは **5** です。

**RETURN TYPE:**

*List[RerankResult]*

**RETURNS:**

`RerankResult` オブジェクトのリスト。

```plaintext
├── RerankResult
|    └── text
|    └── score
|    └── index
```

各 `RerankResult` オブジェクトには以下が含まれます。

- `text`: 一致したドキュメントのテキスト。

- `score`: reranking モデルによってそのドキュメントに割り当てられたスコア。

- `index`: 元の documents リスト内におけるドキュメントのインデックス。

**EXCEPTIONS:**

- **ImportError**

    Cohere モジュールがインストールされていない場合に発生する例外です。

## 例\{#examples}

```python
from pymilvus.model.reranker import CohereRerankFunction

# Define the rerank function
cohere_rf = CohereRerankFunction(
    model_name="rerank-english-v3.0",  # Specify the model name. Defaults to `rerank-english-v2.0`.
    api_key=COHERE_API_KEY # Replace with your Cohere API key
)

query = "What event in 1956 marked the official birth of artificial intelligence as a discipline?"

documents = [
    "In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.",
    "The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.",
    "In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.",
    "The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems."
]

cohere_rf(query, documents)

# [RerankResult(text="The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.", score=0.99691266, index=1),
#  RerankResult(text="The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems.", score=0.8578872, index=3),
#  RerankResult(text='The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems.', score=0.006514905766152258, index=3),
#  RerankResult(text='In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.', score=0.3589146, index=0)]
```
