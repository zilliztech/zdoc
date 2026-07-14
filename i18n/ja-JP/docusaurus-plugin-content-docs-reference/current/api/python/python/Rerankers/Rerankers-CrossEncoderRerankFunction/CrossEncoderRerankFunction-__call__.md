---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/CrossEncoderRerankFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CrossEncoderRerankFunction のこの操作は、クエリとドキュメント文字列を受け取り、スコア順にランク付けされた上位 k 件のドキュメントを含む `RerankResult` オブジェクトのリストを返します。 | Python"
type: docx
token: Vy5GdSeTdoNbSqxCdsOcSmQPnvf
sidebar_position: 2
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
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

[CrossEncoderRerankFunction](./Rerankers-CrossEncoderRerankFunction) のこの操作は、クエリとドキュメント文字列を受け取り、スコア順にランク付けされた上位 k 件のドキュメントを含む `RerankResult` オブジェクトのリストを返します。

## リクエスト構文\{#request-syntax}

```python
# Instance created
ce_rf = CrossEncoderRerankFunction()

# __call__ method will be called
ce_rf(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> List[RerankResult]
```

**パラメーター:**

- `query` (*string*)

    ランキングに使用するクエリ文字列です。

- `documents` (*List[str]*)

    指定されたクエリに対してランク付けされるドキュメント文字列のリストです。

- `top_k` (*int*)

    返される上位ランクのドキュメントの最大数です。デフォルトは **5** です。

**戻り値の型:**

*List[RerankResult]*

**戻り値:**

`RerankResult` オブジェクトのリストです。

```plaintext
├── RerankResult
|    └── text
|    └── score
|    └── index
```

各 `RerankResult` オブジェクトには以下が含まれます。

- `text`: 一致したドキュメントのテキスト。

- `score`: reranking モデルによってそのドキュメントに割り当てられたスコア。

- `index`: 元の documents リスト内でのドキュメントのインデックス。

**例外:**

- **ImportError**

    Sentence Transformer モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus.model.reranker import CrossEncoderRerankFunction

# Define the rerank function
ce_rf = CrossEncoderRerankFunction(
    model_name="cross-encoder/ms-marco-MiniLM-L-6-v2",  # Specify the model name. Defaults to an emtpy string.
    device="cpu" # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)

query = "What event in 1956 marked the official birth of artificial intelligence as a discipline?"

documents = [
    "In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.",
    "The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.",
    "In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.",
    "The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems."
]

ce_rf(query, documents)

# [RerankResult(text="The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.", score=6.250532627105713, index=1),
#  RerankResult(text="In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.", score=-2.9546022415161133, index=0),
#  RerankResult(text='The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems.', score=-4.771512031555176, index=3),
#  RerankResult(text='In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.', score=-8.325657844543457, index=2)]
```
