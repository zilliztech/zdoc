---
title: "clear() | Python | MilvusClient"
slug: /python/python/EmbeddingList-clear
sidebar_label: "clear()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会清除当前 EmbeddingList 实例中的向量嵌入。 | Python | MilvusClient"
type: docx
token: M6mrdinAjo8CwrxirOQcR6E1nUc
sidebar_position: 3
keywords: 
  - 低成本向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - clear()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# clear()

此操作会清除当前 **[EmbeddingList](./MilvusClient-EmbeddingList)** 实例中的向量嵌入。

## 请求语法\{#request-syntax}

```python
clear()
```

**返回类型：**

*[EmbeddingList](./MilvusClient-EmbeddingList)*

**返回：**

一个空的 **[EmbeddingList](./MilvusClient-EmbeddingList)** 实例。

## 示例\{#examples}

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
