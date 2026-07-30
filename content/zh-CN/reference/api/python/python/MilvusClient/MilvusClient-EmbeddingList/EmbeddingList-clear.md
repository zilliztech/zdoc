---
displayed_sidbar: pythonSidebar
title: "clear() | Python | MilvusClient"
slug: /python/python/EmbeddingList-clear
sidebar_label: "clear()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation clears the vector embeddings from the current EmbeddingList instance. | Python | MilvusClient"
type: docx
token: M6mrdinAjo8CwrxirOQcR6E1nUc
sidebar_position: 3
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - clear()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# clear()

This operation clears the vector embeddings from the current **EmbeddingList** instance.

## Request Syntax

```python
clear()
```

**RETURN TYPE:**

*EmbeddingList*

**RETURNS:**

An empty **EmbeddingList** instance.

## Examples

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings in a batch
embeddingList.add_batch(
    embeddings=[[0.1, 0.2, 0.3, 0.4, 0.5], [0.5, 0.4, 0.3, 0.2, 0.1]]
)

# clear the vector embeddings from the instance
embeddingList.clear()
```
