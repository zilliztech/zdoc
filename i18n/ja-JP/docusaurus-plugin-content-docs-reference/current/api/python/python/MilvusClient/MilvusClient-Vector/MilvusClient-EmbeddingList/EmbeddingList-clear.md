---
title: "clear() | Python | MilvusClient"
slug: /python/python/EmbeddingList-clear
sidebar_label: "clear()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、現在の EmbeddingList インスタンスからベクトル埋め込みをクリアします。 | Python | MilvusClient"
type: docx
token: DCf4dDSyMoclYrxrZoCcyqrrnhg
sidebar_position: 3
keywords: 
  - 低コストのベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - zilliz
  - zilliz cloud
  - クラウド
  - clear()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# clear()

この操作は、現在の **EmbeddingList** インスタンスからベクトル埋め込みをクリアします。

## リクエスト構文\{#request-syntax}

```python
clear()
```

**戻り値の型：**

*EmbeddingList*

**戻り値：**

空の EmbeddingList インスタンスです。

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
