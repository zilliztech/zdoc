---
title: "SpladeEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-SpladeEmbeddingFunction
sidebar_label: "SpladeEmbeddingFunction"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "SpladeEmbeddingFunction は、SPLADE モデルを使用してテキストを embedding にエンコードし、Milvus での embedding retrieval をサポートする pymilvus のクラスです。 | Python"
type: docx
token: UdeRd0YVhoDBeVxrQaBcoikVnAI
sidebar_position: 3
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - SpladeEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SpladeEmbeddingFunction

**SpladeEmbeddingFunction** は、SPLADE モデルを使用してテキストを embeddings にエンコードし、Milvus での embedding retrieval をサポートする pymilvus のクラスです。

```python
pymilvus.model.sparse.SpladeEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの SpladeEmbeddingFunction を構築します。

```python
SpladeEmbeddingFunction(
    model_name: str = "naver/splade-cocondenser-ensembledistil",
    batch_size: int = 32,
    query_instruction: str = "",
    doc_instruction: str = "",
    device: Optional[str] = "cpu",
    k_tokens_query: Optional[int] = None,
    k_tokens_document: Optional[int] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **model_name** (*string*) -

    エンコードに使用する SPLADE モデルの名前です。有効なオプションは **naver/splade-cocondenser-ensembledistil**（デフォルト）、**naver/splade_v2_max**、**naver/splade_v2_distil**、および **naver/splade-cocondenser-selfdistil** です。詳細については、[モデルを試す](https://github.com/naver/splade?tab=readme-ov-file#playing-with-the-model) を参照してください。

- **batch_size** (*int*) -

    計算に使用される batch size です。

- **query_instruction** (*string*) -

    エンコードに使用する query です。

- **doc_instruction** (*string*) -

    エンコードに使用する document です。

- **device** (*string*) -

    使用するデバイスです。CPU には **cpu**、n 番目の GPU デバイスには **cuda:n** を使用します。

- **k_tokens_query** (*int*) -

    query encoding に使用する上位トークン数です。指定しない場合、ゼロでないすべてのトークンを使用します。

- **k_tokens_document** (*int*) -

    document encoding に使用する上位トークン数です。指定しない場合、ゼロでないすべてのトークンを使用します。

- **&ast;&ast;kwargs**

    モデル初期化に追加のキーワード引数を渡せます。詳細については、[AutoModelForMaskedLM](https://huggingface.co/docs/transformers/model_doc/auto#transformers.AutoModelForMaskedLM) を参照してください。

## Examples\{#examples}

```python
from pymilvus import model

splade_ef = model.sparse.SpladeEmbeddingFunction(
    model_name="naver/splade-cocondenser-selfdistil", 
    device="cpu"
)
```
