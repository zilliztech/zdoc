---
title: "add() | Python | MilvusClient"
slug: /python/python/EmbeddingList-add
sidebar_label: "add()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、現在の EmbeddingList インスタンスに単一のベクトル埋め込みを追加します。 | Python | MilvusClient"
type: docx
token: NP6adseqQoQS2zxaxYhc1kn6n9c
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

この操作は、現在の **EmbeddingList** インスタンスに単一のベクトル埋め込みを追加します。

## リクエスト構文\{#request-syntax}

```python
add(
    self,
    embedding: Union[np.ndarray, List[Any]]
)
```

**パラメーター:**

- **embedding**（*np.ndarray、List[Any]*）-

    現在の EmbeddingList インスタンスに追加するベクトル埋め込みです。

**戻り値の型:**

*[EmbeddingList](./MilvusClient-EmbeddingList)*

**戻り値:**

メソッドチェーンで使用するための、現在の EmbeddingList インスタンス自体です。

**例外:**

- **ValueError**

    指定されたベクトル埋め込みの次元が既存のベクトル埋め込みと一致しない場合、この例外が発生します。指定されたベクトル埋め込みの次元が既存のベクトル埋め込みと一致しない場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings one after another
embeddingList.add([0.1, 0.2, 0.3, 0.4, 0.5])
embeddingList.add([0.5, 0.4, 0.3, 0.2, 0.1])
```
