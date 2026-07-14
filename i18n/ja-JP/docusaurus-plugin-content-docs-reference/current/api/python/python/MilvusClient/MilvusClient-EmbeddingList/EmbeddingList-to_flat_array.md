---
title: "to_flat_array() | Python | MilvusClient"
slug: /python/python/EmbeddingList-to_flat_array
sidebar_label: "to_flat_array()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の EmbeddingList インスタンスを、すべてのベクトル埋め込みを連結した平坦化された NumPy 配列に変換します。 | Python | MilvusClient"
type: docx
token: Z76PdoAJkoGaMPxG4CFcCmShnwh
sidebar_position: 5
keywords: 
  - オープンソース vector データベース
  - Vector index
  - オープンソース vector database
  - オープンソース vector db
  - zilliz
  - zilliz cloud
  - cloud
  - to_flat_array()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_flat_array()

この操作は、現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンスを、すべてのベクトル埋め込みを連結した平坦化された NumPy 配列に変換します。

## リクエスト構文\{#request-syntax}

```python
to_flat_array()
```

**RETURN TYPE:**

*np.ndarray*

**RETURNS:**

すべてのベクトル埋め込みを連結した平坦化された NumPy 配列。

**EXCEPTIONS:**

- **ValueError**:

    現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンスが空の場合、この例外が発生します。

## 例\{#examples}

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
