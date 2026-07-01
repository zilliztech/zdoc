---
title: "add_batch() | Python | MilvusClient"
slug: /python/python/EmbeddingList-add_batch
sidebar_key: python/EmbeddingList-add_batch
sidebar_label: "add_batch()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation adds multiple vector embeddings to the current EmbeddingList instance. | Python | MilvusClient"
type: docx
token: TJundbM8FoU8UKxczaMcix3QnHb
sidebar_position: 2
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - add_batch()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_batch()

This operation adds multiple vector embeddings to the current **[EmbeddingList](./MilvusClient-EmbeddingList)** instance.

## Request syntax\{#request-syntax}

```python
add_batch(
    self,
    embedding: Union[List[np.ndarray], np.ndarray]
)
```

**PARAMETERS:**

- **embeddings** (*List[np.ndarray], np.ndarray*) - 

    The vector embeddings that are to be added to the current **[EmbeddingList](./MilvusClient-EmbeddingList)** instance.

**RETURN TYPE:**

*[EmbeddingList](./MilvusClient-EmbeddingList)*

**RETURNS:**

The current **[EmbeddingList](./MilvusClient-EmbeddingList)** instance itself for method chaining

**EXCEPTIONS:**

- **ValueError**:

    This exception will be raised if the provided vector embeddings do not match the existing ones in dimensionality.

## Examples\{#examples}

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings in a batch
embeddingList.add_batch(
    embeddings=[[0.1, 0.2, 0.3, 0.4, 0.5], [0.5, 0.4, 0.3, 0.2, 0.1]]
)
```

