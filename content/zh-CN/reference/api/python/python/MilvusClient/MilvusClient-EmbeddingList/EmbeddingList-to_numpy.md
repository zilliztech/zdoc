---
displayed_sidbar: pythonSidebar
title: "to_numpy() | Python | MilvusClient"
slug: /python/python/EmbeddingList-to_numpy
sidebar_label: "to_numpy()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation converts the current EmbeddingList instance into a two-dimensional (2D) NumPy array containing all vector embeddings. | Python | MilvusClient"
type: docx
token: XQAQd2tPKon4JgxKEoAc0CCHnUg
sidebar_position: 6
keywords: 
  - Machine Learning
  - RAG
  - NLP
  - Neural Network
  - zilliz
  - zilliz cloud
  - cloud
  - to_numpy()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# to_numpy()

This operation converts the current **EmbeddingList** instance into a two-dimensional (2D) NumPy array containing all vector embeddings.

## Request Syntax

```python
to_numpy()
```

**RETURN TYPE:**

*np.ndarray*

**RETURNS:**

A 2D NumPy array containing all vector embeddings in the shape **(num_embeddings, dim)**.

**EXCEPTIONS:**

- **ValueError**:

    This exception will be raised if the current **EmbeddingList** instance is empty.

## Examples

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings in a batch
embeddingList.add_batch(
    embeddings=[[0.1, 0.2, 0.3, 0.4, 0.5], [0.5, 0.4, 0.3, 0.2, 0.1]]
)

embeddingList.to_numpy()
```

