---
title: "add_batch() | Python | MilvusClient"
slug: /python/python/EmbeddingList-add_batch
sidebar_label: "add_batch()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、複数の vector embedding を現在の EmbeddingList インスタンスに追加します。 | Python | MilvusClient"
type: docx
token: TJundbM8FoU8UKxczaMcix3QnHb
sidebar_position: 2
keywords: 
  - マルチモーダル検索
  - vector 検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - add_batch()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_batch()

この操作は、複数の vector embedding を現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンスに追加します。

## リクエスト構文\{#request-syntax}

```python
add_batch(
    self,
    embedding: Union[List[np.ndarray], np.ndarray]
)
```

**パラメーター:**

- **embeddings** (*List[np.ndarray], np.ndarray*) - 

    現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンスに追加する vector embedding です。

**戻り値の型:**

*[EmbeddingList](./MilvusClient-EmbeddingList)*

**戻り値:**

メソッドチェーンのための、現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンス自体

**例外:**

- **ValueError**:

    提供された vector embedding の次元数が既存のものと一致しない場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings in a batch
embeddingList.add_batch(
    embeddings=[[0.1, 0.2, 0.3, 0.4, 0.5], [0.5, 0.4, 0.3, 0.2, 0.1]]
)
```

