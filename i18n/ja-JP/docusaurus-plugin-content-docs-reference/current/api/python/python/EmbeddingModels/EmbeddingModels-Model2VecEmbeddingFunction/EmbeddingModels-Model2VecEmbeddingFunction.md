---
title: "Model2VecEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-Model2VecEmbeddingFunction
sidebar_label: "Model2VecEmbeddingFunction"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Model2VecEmbeddingFunction は、Milvus での埋め込み検索をサポートするために、model2vec モジュールを使用してテキストを埋め込みにエンコードする処理を行う pymilvus のクラスです。 | Python"
type: docx
token: WiT4dJ1SJod0fdx4z23cwFbAn7c
sidebar_position: 3
keywords: 
  - ベクトルストア
  - オープンソース vector database
  - Vector index
  - オープンソース vector database
  - zilliz
  - zilliz cloud
  - クラウド
  - Model2VecEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Model2VecEmbeddingFunction

**Model2VecEmbeddingFunction** は、Milvus での埋め込み検索をサポートするために、model2vec モジュールを使用してテキストを埋め込みにエンコードする処理を行う pymilvus のクラスです。

```python
pymilvus.model.dense.Model2VecEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けに Model2VecEmbeddingFunction を構築します。

```python
Model2VecEmbeddingFunction(
    model_source: Union[str, Path] = "minishlab/potion-base-8M",
    **kwargs
)
```

**PARAMETERS:**

- **model_source (string) -**

    モデルのソースです。Hugging Face の model identifier、または model2vec embedding model へのローカルパスのいずれかを指定できます。 

    Hugging Face model identifier として有効なオプションは、**minishlab/potion-base-8M**（デフォルト）、**minishlab/potion-base-4M**、**minishlab/potion-base-2M**、**minishlab/potion-base-32M**、および **minishlab/potion-retrieval-32M** です。

- **&ast;&ast;kwargs**

    Hugging Face Hub からモデルを読み込む際に、huggingface の認証トークンなどのパラメータを含む追加のキーワード引数をモデルの初期化に渡せるようにします。

## Examples\{#examples}

```python
from pymilvus import model

model2vec_ef = Model2VecEmbeddingFunction(
    model_source="minishlab/potion-base-8M" # モデルソースを指定します（Hugging Face またはローカルパスから読み込みます）
)
```

