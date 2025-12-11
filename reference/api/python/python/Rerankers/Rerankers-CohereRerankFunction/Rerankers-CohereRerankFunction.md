---
title: "CohereRerankFunction | Python"
slug: /python/python/Rerankers-CohereRerankFunction
sidebar_label: "CohereRerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CohereRerankFunction is a class in milvusmodel that takes a query and document as input and directly returns a similarity score instead of embeddings. This functionality uses the underlying Cohere reranking model. | Python"
type: docx
token: GAWOdft83oZPvHxtxzZcjrQunGg
sidebar_position: 1
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - CohereRerankFunction
  - pymilvus26
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CohereRerankFunction

**CohereRerankFunction** is a class in [milvus_model](https://github.com/milvus-io/milvus-model) that takes a query and document as input and directly returns a similarity score instead of embeddings. This functionality uses the underlying Cohere reranking model.

```python
pymilvus.model.reranker.CohereRerankFunction
```

## Constructor\{#constructor}

Constructs a CohereRerankFunction for common use cases.

```python
CohereRerankFunction(
    model_name: str = "rerank-english-v2.0",
    api_key: Optional[str] = None
)
```

**PARAMETERS:**

- **model_name** (*string*)

    The name of the model to use. You can specify any of the available Cohere reranker model names, for example, `rerank-english-v3.0`, `rerank-multilingual-v3.0`, etc. If you leave this parameter unspecified, `rerank-english-v2.0` will be used. For a list of available models, refer to [Rerank](https://docs.cohere.com/docs/rerank-2).

- **api_key** (*string*)

    The API key for accessing the Cohere API. For information on how to create an API key, refer to [Cohere dashboard](https://dashboard.cohere.com/api-keys).

## Examples\{#examples}

```python
from pymilvus.model.reranker import CohereRerankFunction

# Define the rerank function
cohere_rf = CohereRerankFunction(
    model_name="rerank-english-v3.0",  # Specify the model name. Defaults to `rerank-english-v2.0`.
    api_key=COHERE_API_KEY # Replace with your Cohere API key
)
```
