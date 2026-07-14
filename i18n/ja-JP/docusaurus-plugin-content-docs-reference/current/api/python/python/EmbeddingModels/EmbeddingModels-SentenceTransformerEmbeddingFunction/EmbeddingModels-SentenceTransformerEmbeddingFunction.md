---
title: "SentenceTransformerEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-SentenceTransformerEmbeddingFunction
sidebar_label: "SentenceTransformerEmbeddingFunction"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "SentenceTransformerEmbeddingFunction は、Sentence Transformer モデルを使用してテキストを embeddings にエンコードし、Milvus での embedding 取得をサポートする pymilvus のクラスです。 | Python"
type: docx
token: JOFedA4h8otTjHxsYQ7cnjsunHd
sidebar_position: 3
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
  - zilliz
  - zilliz cloud
  - cloud
  - SentenceTransformerEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SentenceTransformerEmbeddingFunction

**SentenceTransformerEmbeddingFunction** は、Sentence Transformer モデルを使用してテキストを embeddings にエンコードし、Milvus での embedding 取得をサポートする pymilvus のクラスです。

```python
pymilvus.model.dense.SentenceTransformerEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの SentenceTransformerEmbeddingFunction を構築します。

```python
SentenceTransformerEmbeddingFunction(
    model_name: str = "all-MiniLM-L6-v2",
    batch_size: int = 32,
    query_instruction: str = "",
    doc_instruction: str = "",
    device: str = "cpu",
    normalize_embeddings: bool = True,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*) -

    エンコードに使用する Sentence Transformer モデルの名前です。デフォルト値は **all-MiniLM-L6-v2** です。Sentence Transformers の事前学習済みモデルを任意に使用できます。利用可能なモデルの一覧については、[Pretrained models](https://www.sbert.net/docs/pretrained_models.html) を参照してください。

- **batch_size** (*int*) -

    計算に使用される batch size です。

- **query_instruction** (*string*) -

    クエリテキストの前にコンテキスト指示を付加し、特定のモデルにおける embedding 品質を向上させます（例: "Represent the Wikipedia question for retrieving supporting documents:"）。

- **doc_instruction** (*string*) -

    ドキュメントテキストの前にコンテキスト指示を付加し、特定のモデルにおける embedding 品質を向上させます（例: "Represent the Wikipedia document for retrieval:"）。

- **device** (*string*) -

    使用するデバイスです。CPU の場合は **cpu**、n 番目の GPU デバイスの場合は **cuda:n** を指定します。

- **normalize_embeddings** (*bool*)

    返される vector を長さ 1 に正規化するかどうかを指定します。その場合、cosine similarity の代わりに、より高速な dot-product (`util.dot_score`) を使用できます。

- **&ast;&ast;kwargs**

    モデルの初期化に追加のキーワード引数を渡せます。詳細については、[SentenceTransformer](https://github.com/UKPLab/sentence-transformers/blob/master/sentence_transformers/SentenceTransformer.py) を参照してください。

## Examples\{#examples}

```python
from pymilvus import model

sentence_transformer_ef = model.dense.SentenceTransformerEmbeddingFunction(
    model_name='all-MiniLM-L6-v2', # Specify the model name
    device='cpu' # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)
```
