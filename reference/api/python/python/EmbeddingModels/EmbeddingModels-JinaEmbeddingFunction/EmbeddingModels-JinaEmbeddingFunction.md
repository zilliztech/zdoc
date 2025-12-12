---
title: "JinaEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-JinaEmbeddingFunction
sidebar_label: "JinaEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "JinaEmbeddingFunction is a class in pymilvus that handles encoding text into embeddings using Jina AI embedding models to support embedding retrieval in Milvus. | Python"
type: docx
token: U7NJd5eKAo0c1TxYZndcgPj2nlc
sidebar_position: 3
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - JinaEmbeddingFunction
  - pymilvus26
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# JinaEmbeddingFunction

JinaEmbeddingFunction is a class in pymilvus that handles encoding text into embeddings using Jina AI embedding models to support embedding retrieval in Milvus.

```python
pymilvus.model.dense.JinaEmbeddingFunction
```

## Constructor\{#constructor}

Constructs a JinaEmbeddingFunction for common use cases.

```python
JinaEmbeddingFunction(
    model_name: str = "jina-embeddings-v2-base-en",
    api_key: Optional[str] = None,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*)

    The name of the Jina AI embedding model to use for encoding. You can specify any of the available Jina AI embedding model names, for example, `jina-embeddings-v2-base-en`, `jina-embeddings-v2-small-en`, etc. If you leave this parameter unspecified, `jina-embeddings-v2-base-en` will be used. For a list of available models, refer to [Jina Embeddings](https://jina.ai/embeddings/).

- **api_key** (*string*)

    The API key for accessing the Jina AI API.

- **kwargs**

    Allows additional keyword arguments to be passed to the model initialization. For more information, refer to [Embedding API](https://jina.ai/embeddings/).

## Examples\{#examples}

```python
from pymilvus.model.dense import JinaEmbeddingFunction

jina_ef = JinaEmbeddingFunction(
    model_name="jina-embeddings-v2-base-en", # Defaults to `jina-embeddings-v2-base-en`
    api_key="YOUR_JINAAI_API_KEY" # Provide your Jina AI API key
)
```
