---
title: "MistralAIEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-MistralAIEmbeddingFunction
sidebar_label: "MistralAIEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "MistralAIEmbeddingFunction は pymilvus のクラスで、Mistral AI の埋め込みモデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートします。 | Python"
type: docx
token: CvxodXz8OoWXrlxD7OVcqqJLn8e
sidebar_position: 3
keywords: 
  - ANNS
  - ベクトル検索
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - MistralAIEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# MistralAIEmbeddingFunction

MistralAIEmbeddingFunction は pymilvus のクラスで、Mistral AI の埋め込みモデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートします。

```python
pymilvus.model.dense.MistralAIEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けに MistralAIEmbeddingFunction を構築します。

```python
MistralAIEmbeddingFunction(
    api_key: str,
    model_name: str = "mistral-embed",
    **kwargs
)
```

**PARAMETERS:**

- **api_key** (*string*)

    Mistral AI API にアクセスするための API key。

- **model_name** (*string*)

    エンコードに使用する Mistral AI 埋め込みモデルの名前です。デフォルト値は `mistral-embed` です。詳細については、[Embeddings](https://docs.mistral.ai/capabilities/embeddings/) を参照してください。

- **kwargs**

    追加のキーワード引数をモデルの初期化に渡せます。詳細については、[Embedding API](https://docs.mistral.ai/api/#tag/embeddings/operation/embeddings_v1_embeddings_post) を参照してください。

## Examples\{#examples}

```python
from pymilvus.model.dense import MistralAIEmbeddingFunction

ef = MistralAIEmbeddingFunction(
    model_name="mistral-embed", # Defaults to `mistral-embed`
    api_key="MISTRAL_API_KEY" # Provide your Mistral AI API key
)
```
