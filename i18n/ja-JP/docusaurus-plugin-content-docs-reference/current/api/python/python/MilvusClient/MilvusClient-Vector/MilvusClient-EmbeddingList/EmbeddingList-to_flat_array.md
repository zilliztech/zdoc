---
title: "to_flat_array() | Python | MilvusClient"
slug: /python/python/EmbeddingList-to_flat_array
sidebar_label: "to_flat_array()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、現在の EmbeddingList インスタンスを、連結されたすべてのベクトル埋め込みを含むフラット化された NumPy 配列に変換します。 | Python | MilvusClient"
type: docx
token: EH8ndWH5FoGTlExix0tcZjUEnKd
sidebar_position: 5
keywords: 
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - オープンソースのベクトル DB
  - zilliz
  - zilliz cloud
  - クラウド
  - to_flat_array()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# to_flat_array()

この操作は、現在の **EmbeddingList** インスタンスを、連結されたすべてのベクトル埋め込みを含むフラット化された NumPy 配列に変換します。

## リクエスト構文\{#request-syntax}

```python
to_flat_array()
```

**戻り値の型:**

*np.ndarray*

**戻り値:**

連結されたすべてのベクトル埋め込みを含むフラット化された NumPy 配列です。

**例外:**

- **ValueError**

    現在の **EmbeddingList** インスタンスが空の場合、この例外が発生します。現在の **EmbeddingList** インスタンスが空の場合、この例外が発生します。

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
