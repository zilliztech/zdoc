---
title: "add() | Python | MilvusClient"
slug: /python/python/EmbeddingList-add
sidebar_label: "add()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、単一の vector embedding を現在の EmbeddingList インスタンスに追加します。 | Python | MilvusClient"
type: docx
token: R0E9dLzIAoYGCcxRVj6cjJmWnPe
sidebar_position: 1
keywords: 
  - knn
  - 画像検索
  - LLMs
  - 機械学習
  - zilliz
  - zilliz cloud
  - cloud
  - add()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add()

この操作は、単一の vector embedding を現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンスに追加します。

## リクエスト構文\{#request-syntax}

```python
add(
    self,
    embedding: Union[np.ndarray, List[Any]]
)
```

**パラメータ:**

- **embedding** (*np.ndarray, List[Any]*) - 

    現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンスに追加する vector embedding。

**戻り値の型:**

*[EmbeddingList](./MilvusClient-EmbeddingList)*

**戻り値:**

メソッドチェーンのための現在の **[EmbeddingList](./MilvusClient-EmbeddingList)** インスタンス自身

**例外:**

- **ValueError**:

    提供された vector embedding の次元数が既存のものと一致しない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings one after another
embeddingList.add([0.1, 0.2, 0.3, 0.4, 0.5])
embeddingList.add([0.5, 0.4, 0.3, 0.2, 0.1])
```
