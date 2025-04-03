---
displayed_sidbar: pythonSidebar
title: "Model2VecEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-Model2VecEmbeddingFunction
sidebar_label: "Model2VecEmbeddingFunction"
beta: false
notebook: false
description: "Model2VecEmbeddingFunction is a class in pymilvus that handles encoding text into embeddings using the model2vec module to support embedding retrieval in Milvus. | Python"
type: docx
token: WiT4dJ1SJod0fdx4z23cwFbAn7c
sidebar_position: 3
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - Model2VecEmbeddingFunction
  - pymilvus25
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# Model2VecEmbeddingFunction

**Model2VecEmbeddingFunction** is a class in pymilvus that handles encoding text into embeddings using the model2vec module to support embedding retrieval in Milvus.

```python
pymilvus.model.dense.Model2VecEmbeddingFunction
```

## Constructor{#constructor}

Constructs an Model2VecEmbeddingFunction for common use cases.

```python
Model2VecEmbeddingFunction(
    model_source: Union[str, Path] = "minishlab/potion-base-8M",
    **kwargs
)
```

**PARAMETERS:**

- **model_source (string) -**

    The source of the model, which can either be a Hugging Face model identifier or a local path to a model2vec embedding model. 

    Valid options for Hugging Face model identifier are **minishlab/potion-base-8M** (default), **minishlab/potion-base-4M**, **minishlab/potion-base-2M**, **minishlab/potion-base-32M**, and **minishlab/potion-retrieval-32M**

- ****kwargs**

    Allows additional keyword arguments to be passed to the model initialization when loading a model from the Hugging Face Hub, including parameters such as huggingface authentication tokens.

## Examples{#examples}

```python
from pymilvus import model

model2vec_ef = Model2VecEmbeddingFunction(
    model_source="minishlab/potion-base-8M" # Specify the model source (loads from Hugging Face or local path)
)
```

