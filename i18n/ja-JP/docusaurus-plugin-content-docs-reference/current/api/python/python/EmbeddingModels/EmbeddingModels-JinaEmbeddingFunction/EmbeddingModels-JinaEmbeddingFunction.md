---
title: "JinaEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-JinaEmbeddingFunction
sidebar_label: "JinaEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "JinaEmbeddingFunction は、Jina AI の embedding モデルを使用してテキストを embedding にエンコードし、Milvus での embedding 検索をサポートする pymilvus のクラスです。 | Python"
type: docx
token: U7NJd5eKAo0c1TxYZndcgPj2nlc
sidebar_position: 3
keywords: 
  - 非構造化データ
  - vector database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - JinaEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# JinaEmbeddingFunction

JinaEmbeddingFunction は、Jina AI の embedding モデルを使用してテキストを embedding にエンコードし、Milvus での embedding 検索をサポートする pymilvus のクラスです。

```python
pymilvus.model.dense.JinaEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けに JinaEmbeddingFunction を構築します。

```python
JinaEmbeddingFunction(
    model_name: str = "jina-embeddings-v2-base-en",
    api_key: Optional[str] = None,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*)

    エンコードに使用する Jina AI embedding モデルの名前です。利用可能な任意の Jina AI embedding モデル名を指定できます。たとえば、`jina-embeddings-v2-base-en`、`jina-embeddings-v2-small-en` などです。このパラメータを指定しない場合は、`jina-embeddings-v2-base-en` が使用されます。利用可能なモデルの一覧については、[Jina Embeddings](https://jina.ai/embeddings/) を参照してください。

- **api_key** (*string*)

    Jina AI API にアクセスするための API key です。

- **kwargs**

    モデルの初期化に追加のキーワード引数を渡せます。詳細については、[Embedding API](https://jina.ai/embeddings/) を参照してください。

## Examples\{#examples}

```python
from pymilvus.model.dense import JinaEmbeddingFunction

jina_ef = JinaEmbeddingFunction(
    model_name="jina-embeddings-v2-base-en", # Defaults to `jina-embeddings-v2-base-en`
    api_key="YOUR_JINAAI_API_KEY" # Provide your Jina AI API key
)
```
