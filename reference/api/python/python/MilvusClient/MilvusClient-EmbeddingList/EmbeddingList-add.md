---
title: "add() | Python | MilvusClient"
slug: /python/python/EmbeddingList-add
sidebar_key: python/EmbeddingList-add
sidebar_label: "add()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation adds a single vector embedding to the current EmbeddingList instance. | Python | MilvusClient"
type: docx
token: R0E9dLzIAoYGCcxRVj6cjJmWnPe
sidebar_position: 1
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - add()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add()

This operation adds a single vector embedding to the current **[EmbeddingList](./MilvusClient-EmbeddingList)** instance.

## Request syntax\{#request-syntax}

```python
add(
    self,
    embedding: Union[np.ndarray, List[Any]]
)
```

**PARAMETERS:**

- **embedding** (*np.ndarray, List[Any]*) - 

    The vector embedding that is to be added to the current **[EmbeddingList](./MilvusClient-EmbeddingList)** instance.

**RETURN TYPE:**

*[EmbeddingList](./MilvusClient-EmbeddingList)*

**RETURNS:**

The current **[EmbeddingList](./MilvusClient-EmbeddingList)** instance itself for method chaining

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
