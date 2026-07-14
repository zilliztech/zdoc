---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/VoyageRerankFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "VoyageRerankFunction のこの操作は、クエリとドキュメント文字列を受け取り、スコアでランク付けされた上位 k 件のドキュメントを含む `RerankResult` オブジェクトのリストを返します。 | Python"
type: docx
token: N2aHdla1Uohk1HxGyPHcdG4lnnb
sidebar_position: 2
keywords: 
  - cosine distance
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
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

[VoyageRerankFunction](./Rerankers-VoyageRerankFunction) のこの操作は、クエリとドキュメント文字列を受け取り、スコアでランク付けされた上位 k 件のドキュメントを含む `RerankResult` オブジェクトのリストを返します。

## リクエスト構文\{#request-syntax}

```python
# インスタンスを作成
voyage_rf = VoyageRerankFunction()

# __call__ メソッドが呼び出されます
voyage_rf(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> List[RerankResult]
```

**パラメーター:**

- `query` (*string*)

    ランキングに使用するクエリ文字列。

- `documents` (*List[str]*)

    指定されたクエリに対してランク付けされるドキュメント文字列のリスト。

- `top_k` (*int*)

    返される上位ランクのドキュメントの最大数。デフォルトは **5** です。

**戻り値の型:**

*List[RerankResult]*

**戻り値:**

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

- `index`: 元の documents リスト内のドキュメントのインデックス。

**例外:**

- **ImportError**

    Voyage モジュールがインストールされていない場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus.model.reranker import VoyageRerankFunction

# rerank 関数を定義
voyage_rf = VoyageRerankFunction(
    model_name="rerank-lite-1",  # モデル名を指定します。デフォルトは `rerank-lite-1` です。
    api_key=VOYAGE_API_KEY # ご自身の Voyage API key に置き換えてください
)

query = "What event in 1956 marked the official birth of artificial intelligence as a discipline?"

documents = [
    "In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.",
    "The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.",
    "In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.",
    "The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems."
]

voyage_rf(query, documents)

# [RerankResult(text="The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.", score=0.8984375, index=1),
#  RerankResult(text='The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems.', score=0.71875, index=3),
#  RerankResult(text="In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.", score=0.6796875, index=0),
#  RerankResult(text='In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.', score=0.5859375, index=2)]
```
