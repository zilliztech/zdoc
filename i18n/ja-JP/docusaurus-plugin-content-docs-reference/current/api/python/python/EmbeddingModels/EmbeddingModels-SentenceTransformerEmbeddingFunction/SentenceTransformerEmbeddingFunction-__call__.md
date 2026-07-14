---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/SentenceTransformerEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "SentenceTransformerEmbeddingFunction のこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。 | Python"
type: docx
token: ZWLCdBWwOo4OSVxfnNRcDrv5nhe
sidebar_position: 4
keywords: 
  - Pinecone vector database
  - Audio search
  - semantic search とは
  - 埋め込みモデル
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

[SentenceTransformerEmbeddingFunction](./EmbeddingModels-SentenceTransformerEmbeddingFunction) のこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。

**\_\_call()\_\_** メソッドを直接使用した際の潜在的なエラーを防ぐため、SentenceTransformerEmbeddingFunction の初期化時には **query_instruction** または **doc_instruction** を使用しないでください。詳細については、[SentenceTransformerEmbeddingFunction](./EmbeddingModels-SentenceTransformerEmbeddingFunction) を参照してください。

## リクエスト構文\{#request-syntax}

```python
# Instance created
sentence_transformer_ef = SentenceTransformerEmbeddingFunction()

# __call__ method will be called
sentence_transformer_ef(
    texts: List[str]
) -> List[np.array]
```

**パラメータ:**

- **texts** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるテキストを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリストです。

**例外:**

- **ImportError**

    必要な sentence-transformers モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

sentence_transformer_ef = model.dense.SentenceTransformerEmbeddingFunction(
    model_name='all-MiniLM-L6-v2', # Specify the model name
    device='cpu' # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

sentence_transformer_ef(docs)

# [array([-3.09392996e-02, -1.80662833e-02,  1.34775648e-02,  2.77156215e-02,
#         -4.86349640e-03, -3.12581174e-02, -3.55921760e-02,  5.76934684e-03,
#          2.80773244e-03,  1.35783911e-01,  3.59678417e-02,  6.17732145e-02,
# ...
#         -1.43224243e-02,  4.15765122e-02, -2.97174603e-02,  4.85958979e-02,
#          1.26190051e-01,  6.31634071e-02,  8.69929418e-02,  5.49541414e-03,
#         -4.61330153e-02, -4.85207550e-02,  3.13997865e-02,  7.82178566e-02,
#         -4.75336798e-02,  5.21207601e-02,  9.04406682e-02, -5.36676683e-02],
#        dtype=float32)]
```
