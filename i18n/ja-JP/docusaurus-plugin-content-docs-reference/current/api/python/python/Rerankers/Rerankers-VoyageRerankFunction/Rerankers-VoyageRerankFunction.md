---
title: "VoyageRerankFunction | Python"
slug: /python/python/Rerankers-VoyageRerankFunction
sidebar_label: "VoyageRerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "VoyageRerankFunction は、query と document を入力として受け取り、embeddings ではなく類似度スコアを直接返す milvusmodel のクラスです。この機能は基盤となる Voyage reranking model を使用します。 | Python"
type: docx
token: Smobd2lIho2yQPxtRhLcLcKznCf
sidebar_position: 1
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - VoyageRerankFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VoyageRerankFunction

**VoyageRerankFunction** は、[milvus_model](https://github.com/milvus-io/milvus-model) のクラスで、query と document を入力として受け取り、embeddings ではなく類似度スコアを直接返します。この機能は基盤となる Voyage reranking model を使用します。

```python
pymilvus.model.reranker.VoyageRerankFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの VoyageRerankFunction を構築します。

```python
VoyageRerankFunction(
    model_name: str = "rerank-lite-1",
    api_key: Optional[str] = None
)
```

**PARAMETERS:**

- **model_name** (*string*)

    エンコードに使用する Voyage model の名前です。利用可能な Voyage model 名を任意に指定できます。たとえば、`voyage-law-2`、`voyage-code-2` などです。このパラメータを指定しない場合は、`voyage-2` が使用されます。利用可能な model の一覧については、[Voyage official documentation](https://docs.voyageai.com/docs/embeddings) を参照してください。

- **api_key** (*string*)

    Voyage API にアクセスするための API key です。API key の作成方法については、[API Key and Python Client](https://docs.voyageai.com/docs/api-key-and-installation) を参照してください。

## Examples\{#examples}

```python
from pymilvus.model.reranker import VoyageRerankFunction

# Define the rerank function
voyage_rf = VoyageRerankFunction(
    model_name="rerank-lite-1",  # Specify the model name. Defaults to `rerank-lite-1`.
    api_key=VOYAGE_API_KEY # Replace with your Voyage API key
)
```
