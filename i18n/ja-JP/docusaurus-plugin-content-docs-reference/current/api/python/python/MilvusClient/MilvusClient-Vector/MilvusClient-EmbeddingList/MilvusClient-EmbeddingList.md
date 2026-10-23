---
title: "EmbeddingList | Python | MilvusClient"
slug: /python/python/MilvusClient-EmbeddingList
sidebar_label: "EmbeddingList"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "EmbeddingList インスタンスは、ベクトル埋め込みのリストを表します。EmbeddingList インスタンスを使用すると、Array of Structs フィールド内のベクトルフィールドに対する検索でクエリベクトルを構築できます。 | Python | MilvusClient"
type: docx
token: UFBPdaaIloEeBexOxG3c6WMZnLe
sidebar_position: 4
keywords: 
  - IVF
  - knn
  - 画像検索
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - EmbeddingList
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# EmbeddingList

**EmbeddingList** インスタンスは、ベクトル埋め込みのリストを表します。**EmbeddingList** インスタンスを使用すると、Array of Structs フィールド内のベクトルフィールドに対する検索でクエリベクトルを構築できます。

## リクエスト構文\{#request-syntax}

```python
class pymilvus.EmbeddingList
```

**パラメーター:**

- **embeddings** (*np.ndarray, List[np.ndarray*) -

    ベクトル埋め込みのリストです。次のいずれかの型を指定できます。np.ndarray **（形状 (n, dim)）** は、複数のベクトル埋め込みのリストを示します。np.ndarray **（形状 (dim,)）** は、単一のベクトル埋め込みを示します。**List[np.ndarray]** は、ベクトル埋め込みの配列のリストを示します。

- **dim** (*int*) -

    embedding パラメーターで指定するベクトル埋め込みの次元数です。検証目的で使用されます。指定する場合、すべてのベクトル埋め込みが次元の制約に従っている必要があります。

- **dtype** (*np.dtype, str, [DataType](../../Collections/DataType.md*) -

    *) - np.dtype（`np.float32`、`np.float16`、`np.unit8` など）、文字列（`'float32'`、`'float16'`、`'uint8'` など）、または DataType*&ast;（`DataType.FLOAT_VECTOR`、`DataType.FLOAT16_VECTOR`、`DataType.BFLOAT16_VECTOR`、`DataType.INT8_VECTOR`、`DataType.BINARY_VECTOR` など）を指定するオプションです。

**戻り値の型:**

*EmbeddingList*

**戻り値:**

EmbeddingList インスタンスです。

## 例\{#examples}

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList1 = EmbeddingList()

# create an embedding list with a single vector embedding of 5 dimensions
embeddingList2 = EmbeddingList(
    embeddings=[0.1, 0.2, 0.3, 0.4, 0.5],
    dim=5
)

# create an embedding list with two vector embeddings, each having five dimensions
embeddingList3 = EmbeddingList(
    embeddings= [[0.1, 0.2, 0.3, 0.4, 0.5], [0.5, 0.4, 0.3, 0.2, 0.1]],
    dim=5
)
```
