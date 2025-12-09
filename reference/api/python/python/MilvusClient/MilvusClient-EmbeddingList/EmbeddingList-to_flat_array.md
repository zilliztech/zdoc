---
title: "to_flat_array() | Python | MilvusClient"
slug: /python/python/EmbeddingList-to_flat_array
sidebar_label: "to_flat_array()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation converts the current EmbeddingList instance into a flattened NumPy array containing all vector embeddings concatenated. | Python | MilvusClient"
type: docx
token: Z76PdoAJkoGaMPxG4CFcCmShnwh
sidebar_position: 5
keywords: 
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - to_flat_array()
  - pymilvus26
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_flat_array()

This operation converts the current **EmbeddingList** instance into a flattened NumPy array containing all vector embeddings concatenated.

## Request Syntax\{#request-syntax}

```python
to_flat_array()
```

**RETURN TYPE:**

*np.ndarray*

**RETURNS:**

A flattened NumPy array containing all vector embeddings concatenated.

**EXCEPTIONS:**

- **ValueError**:

    This exception will be raised if the current **EmbeddingList** instance is empty.

## Examples\{#examples}

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings in a batch
embeddingList.add_batch(
    embeddings=[[0.1, 0.2, 0.3, 0.4, 0.5], [0.5, 0.4, 0.3, 0.2, 0.1]]
)

embeddingList.to_flat_array()
```
