---
displayed_sidbar: pythonSidebar
title: "VoyageEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-VoyageEmbeddingFunction
sidebar_label: "VoyageEmbeddingFunction"
beta: false
notebook: false
description: "VoyageEmbeddingFunction is a class in pymilvus that handles encoding text into embeddings using Voyage models to support embedding retrieval in Milvus. | Python"
type: docx
token: HEyLd2lxzo3bl4xqVBOco8vWn1c
sidebar_position: 3
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - VoyageEmbeddingFunction
  - pymilvus25
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# VoyageEmbeddingFunction

**VoyageEmbeddingFunction** is a class in pymilvus that handles encoding text into embeddings using Voyage models to support embedding retrieval in Milvus.

```python
pymilvus.model.dense.VoyageEmbeddingFunction
```

## Constructor{#constructor}

Constructs an VoyageEmbeddingFunction for common use cases.

```python
VoyageEmbeddingFunction(
    model_name: str = "voyage-2",
    api_key: Optional[str] = None,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*)

    The name of the Voyage model to use for encoding. You can specify any of the available Voyage model names, for example, `voyage-law-2`, `voyage-code-2`, etc. If you leave this parameter unspecified, `voyage-2` will be used. For a list of available models, refer to [Voyage official documentation](https://docs.voyageai.com/docs/embeddings).

- **api_key** (*string*)

    The API key for accessing the Voyage API. For information on how to create an API key, refer to [API Key and Python Client](https://docs.voyageai.com/docs/api-key-and-installation).

- **kwargs**

    Allows additional keyword arguments to be passed to the model initialization. For more information, refer to [Python API](https://docs.voyageai.com/docs/embeddings#python-api).

## Examples{#examples}

```python
from pymilvus.model.dense import VoyageEmbeddingFunction

voyage_ef = VoyageEmbeddingFunction(
    model_name="voyage-lite-02-instruct", # Defaults to `voyage-2`
    api_key='YOUR_API_KEY' # Replace with your own Voyage API key
)
```
