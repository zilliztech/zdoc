---
title: "to_numpy() | Python | MilvusClient"
slug: /python/python/EmbeddingList-to_numpy
sidebar_label: "to_numpy()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の EmbeddingList を、すべてのベクトル埋め込みを含む NumPy 配列に変換します。 | Python | MilvusClient"
type: docx
token: XQAQd2tPKon4JgxKEoAc0CCHnUg
sidebar_position: 6
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - zilliz
  - zilliz cloud
  - クラウド
  - to_numpy()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_numpy()

この操作は、現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンスを、すべてのベクトル埋め込みを含む 2 次元（2D）NumPy 配列に変換します。

## リクエスト構文\{#request-syntax}

```python
to_numpy()
```

**RETURN TYPE:**

*np.ndarray*

**RETURNS:**

形状が **(num_embeddings, dim)** の、すべてのベクトル埋め込みを含む 2D NumPy 配列。

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

embeddingList.to_numpy()
```

