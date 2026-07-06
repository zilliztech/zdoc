---
title: "GeminiEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-GeminiEmbeddingFunction
sidebar_label: "GeminiEmbeddingFunction"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Model2VecEmbeddingFunction is a class in pymilvus that handles encoding text into embeddings using the GeminiEmbeddingFunction module to support embedding retrieval in Milvus. | Python"
type: docx
token: DhZRdYbfMoYIBtxrudGcwWjrngd
sidebar_position: 3
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - GeminiEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# GeminiEmbeddingFunction

**[Model2VecEmbeddingFunction](./EmbeddingModels-Model2VecEmbeddingFunction)** is a class in pymilvus that handles encoding text into embeddings using the GeminiEmbeddingFunction module to support embedding retrieval in Milvus.

```python
pymilvus.model.dense.GeminiEmbeddingFunction
```

## Constructor\{#constructor}

Constructs an GeminiEmbeddingFunction for common use cases.

```python
GeminiEmbeddingFunction(
    model_name: str = "gemini-embedding-exp-03-07",
    api_key: Optional[str] = None,
    config: Optional['types.EmbedContentConfig']=None,
    **kwargs,
)
```

**PARAMETERS:**

- **model_name (string) -**

    The name of the Gemini model to use for encoding. Valid options are **gemini-embedding-exp-03-07**(default), **models/embedding-001**, and **models/text-embedding-004**.

- **api_key (*string*)-**

The API key for accessing the Gemini API.

- **config** **(*types.EmbedContentConfig*) -**

    Optional configuration for the embedding model.

    - The **output_dimensionality** can be specified to the number of resulting output embeddings.

        | **Model Name** | **Dimensions** |
        | --- | --- |
        | emini-embedding-exp-03-07 | 3072(*default*),1536,768 |
        | models/embedding-001 | 768 |
        | models/text-embedding-004 | 768 |

    - The **task_type** can be specified to generate optimized embeddings for specific tasks, saving you time and cost and improving performance. Only supported in the **gemini-embedding-exp-03-07** model.

        | Task Type | Description |
        | --- | --- |
        | SEMANTIC_SIMILARITY | Used to generate embeddings that are optimized to assess text similarity. |
        | CLASSIFICATION | Used to generate embeddings that are optimized to classify texts according to preset labels. |
        | CLUSTERING | Used to generate embeddings that are optimized to cluster texts based on their similarities. |
        | RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, QUESTION_ANSWERING, and FACT_VERIFICATION | Used to generate embeddings that are optimized for document search or information retrieval. |
        | CODE_RETRIEVAL_QUERY | Used to retrieve a code block based on a natural language query, such as sort an array or reverse a linked list. Embeddings of the code blocks are computed using RETRIEVAL_DOCUMENT. |

## Examples\{#examples}

```python
from pymilvus import model

gemini_ef = model.dense.GeminiEmbeddingFunction(
    model_name="gemini-embedding-exp-03-07",
    api_key="YOUR_API_KEY",
)
```

