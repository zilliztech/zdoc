---
title: "add() | Python | MilvusClient"
slug: /python/python/EmbeddingList-add
sidebar_label: "add()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a single vector embedding to the current EmbeddingList instance. | Python | MilvusClient"
type: docx
token: R0E9dLzIAoYGCcxRVj6cjJmWnPe
sidebar_position: 1
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - add()
  - pymilvus26
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add()

This operation adds a single vector embedding to the current **EmbeddingList** instance.

## Request syntax\{#request-syntax}

```python
add(
    self,
    embedding: Union[np.ndarray, List[Any]]
)
```

**PARAMETERS:**

- **embedding** (*np.ndarray, List[Any]*) - 

    The vector embedding that is to be added to the current **EmbeddingList** instance.

**RETURN TYPE:**

*EmbeddingList*

**RETURNS:**

The current **EmbeddingList** instance itself for method chaining

**EXCEPTIONS:**

- **ValueError**:

    This exception will be raised if the provided vector embedding does not match the existing ones in dimensionality.

## Examples\{#examples}

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings one after another
embeddingList.add([0.1, 0.2, 0.3, 0.4, 0.5])
embeddingList.add([0.5, 0.4, 0.3, 0.2, 0.1])
```
