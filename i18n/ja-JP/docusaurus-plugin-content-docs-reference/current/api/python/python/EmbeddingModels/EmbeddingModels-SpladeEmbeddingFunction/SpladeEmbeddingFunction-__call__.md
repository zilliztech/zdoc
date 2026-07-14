---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/SpladeEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "SpladeEmbeddingFunction におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。 | Python"
type: docx
token: LJqud2x3AojxV4xKONocTe4YnFb
sidebar_position: 4
keywords: 
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
  - Vector Dimension
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

[SpladeEmbeddingFunction](./EmbeddingModels-SpladeEmbeddingFunction) におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。

**doc_instruction** または **query_instruction** を先頭に付加し、結果の刈り込みに **k_tokens_document** または **k_tokens_query** を使用できる [encode_documents()](./SpladeEmbeddingFunction-encode_documents) や [encode_queries()](./SpladeEmbeddingFunction-encode_queries) とは異なり、**\_\_call\_\_()** メソッドは、命令の付加や結果の刈り込みを行うオプションを提供せずに、埋め込みを直接返します。

## リクエスト構文\{#request-syntax}

```python
# Instance created
splade_ef = SpladeEmbeddingFunction()

# __call__ method will be called
splade_ef(
    texts: List[str]
) -> csr_array
```

**PARAMETERS:**

- **texts** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるテキストを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**RETURN TYPE:**

*csr_array*

**RETURNS:**

ドキュメント埋め込みを表す compressed sparse row 行列。

**Exceptions:**

- **ImportError**

    transformers ライブラリがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

splade_ef = model.sparse.SpladeEmbeddingFunction(
    model_name="naver/splade-cocondenser-selfdistil", 
    device="cpu"
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

splade_ef(docs)

# <3x30522 sparse array of type '<class 'numpy.float32'>'
#   with 298 stored elements in Compressed Sparse Row format>
```
