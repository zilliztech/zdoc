---
title: "clear() | Python | MilvusClient"
slug: /python/python/EmbeddingList-clear
sidebar_label: "clear()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の EmbeddingList インスタンスから vector embeddings をクリアします。 | Python | MilvusClient"
type: docx
token: M6mrdinAjo8CwrxirOQcR6E1nUc
sidebar_position: 3
keywords: 
  - 安価な vector database
  - マネージド vector database
  - Pinecone vector database
  - 音声検索
  - zilliz
  - zilliz cloud
  - クラウド
  - clear()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# clear()

この操作は、現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンスから vector embeddings をクリアします。

## リクエスト構文\{#request-syntax}

```python
clear()
```

**RETURN TYPE:**

*[EmbeddingList](./MilvusClient-EmbeddingList)*

**RETURNS:**

空の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンス。

## 例\{#examples}

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
