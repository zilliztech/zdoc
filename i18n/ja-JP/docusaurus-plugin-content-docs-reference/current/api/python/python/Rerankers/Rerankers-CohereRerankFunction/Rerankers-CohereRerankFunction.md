---
title: "CohereRerankFunction | Python"
slug: /python/python/Rerankers-CohereRerankFunction
sidebar_label: "CohereRerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CohereRerankFunction は milvusmodel のクラスで、query と document を入力として受け取り、embeddings の代わりに類似度スコアを直接返します。この機能は基盤となる Cohere reranking モデルを使用します。 | Python"
type: docx
token: GAWOdft83oZPvHxtxzZcjrQunGg
sidebar_position: 1
keywords: 
  - rag vector database
  - vector db とは
  - vector databases とは何か
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - CohereRerankFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CohereRerankFunction

**CohereRerankFunction** は [milvus_model](https://github.com/milvus-io/milvus-model) のクラスで、query と document を入力として受け取り、embeddings の代わりに類似度スコアを直接返します。この機能は基盤となる Cohere reranking モデルを使用します。

```python
pymilvus.model.reranker.CohereRerankFunction
```

## Constructor\{#constructor}

一般的なユースケース向けに CohereRerankFunction を構築します。

```python
CohereRerankFunction(
    model_name: str = "rerank-english-v2.0",
    api_key: Optional[str] = None
)
```

**PARAMETERS:**

- **model_name** (*string*)

    使用するモデルの名前です。利用可能な Cohere reranker モデル名のいずれかを指定できます。たとえば、`rerank-english-v3.0`、`rerank-multilingual-v3.0` などです。このパラメータを指定しない場合は、`rerank-english-v2.0` が使用されます。利用可能なモデルの一覧については、[Rerank](https://docs.cohere.com/docs/rerank-2) を参照してください。

- **api_key** (*string*)

    Cohere API にアクセスするための API key です。API key の作成方法については、[Cohere dashboard](https://dashboard.cohere.com/api-keys) を参照してください。

## Examples\{#examples}

```python
from pymilvus.model.reranker import CohereRerankFunction

# Define the rerank function
cohere_rf = CohereRerankFunction(
    model_name="rerank-english-v3.0",  # Specify the model name. Defaults to `rerank-english-v2.0`.
    api_key=COHERE_API_KEY # Replace with your Cohere API key
)
```
