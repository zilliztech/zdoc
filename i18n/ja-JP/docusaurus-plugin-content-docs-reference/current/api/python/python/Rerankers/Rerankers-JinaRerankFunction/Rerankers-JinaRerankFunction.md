---
title: "JinaRerankFunction | Python"
slug: /python/python/Rerankers-JinaRerankFunction
sidebar_label: "JinaRerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "JinaRerankFunction は、query と document を入力として受け取り、embeddings の代わりに類似度スコアを直接返す milvusmodel のクラスです。この機能は基盤となる Jina AI の reranking モデルを使用します。 | Python"
type: docx
token: E3opdXwZCoY8igxMjQ1cwsTbnzh
sidebar_position: 1
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - JinaRerankFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# JinaRerankFunction

JinaRerankFunction は、[milvus_model](https://github.com/milvus-io/milvus-model) 内のクラスで、query と document を入力として受け取り、embeddings の代わりに類似度スコアを直接返します。この機能は基盤となる Jina AI の reranking モデルを使用します。

```python
pymilvus.model.reranker.JinaRerankFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの JinaRerankFunction を構築します。

```python
JinaRerankFunction(
    model_name: str = "jina-reranker-v2-base-multilingual",
    api_key: Optional[str] = None
)
```

**PARAMETERS:**

- **model_name** (*string*)

    エンコーディングに使用する Jina AI reranker モデルの名前です。このパラメータを指定しない場合は、`jina-reranker-v2-base-multilingual` が使用されます。利用可能なモデルの一覧については、[Jina AI Rerankers](https://jina.ai/reranker/) を参照してください。

- **api_key** (*string*)

    Jina AI API にアクセスするための API key です。

## Examples\{#examples}

```python
from pymilvus.model.reranker import JinaRerankFunction

jina_rf = JinaRerankFunction(
    model_name="jina-reranker-v2-base-multilingual", # Defaults to `jina-reranker-v2-base-multilingual`
    api_key="YOUR_JINAAI_API_KEY"
)
```
