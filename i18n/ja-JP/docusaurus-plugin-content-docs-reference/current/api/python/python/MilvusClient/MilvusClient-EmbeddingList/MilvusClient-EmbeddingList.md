---
title: "EmbeddingList | Python | MilvusClient"
slug: /python/python/MilvusClient-EmbeddingList
sidebar_label: "EmbeddingList"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "EmbeddingList インスタンスは、vector embedding のリストを表します。EmbeddingList インスタンスを使用して、Array of Structs フィールド内の vector フィールドに対する検索でクエリ vector を構築できます。 | Python | MilvusClient"
type: docx
token: Ve2WdUAfwoz456xwBIJcGvltn6b
sidebar_position: 4
keywords: 
  - IVF
  - knn
  - Image Search
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

**EmbeddingList** インスタンスは、vector embedding のリストを表します。**EmbeddingList** インスタンスを使用して、Array of Structs フィールド内の vector フィールドに対する検索でクエリ vector を構築できます。

```python
class pymilvus.EmbeddingList
```

## Constructor\{#constructor}

空の embedding リスト、または指定された vector embedding のリストを構築します。

```python
EmbeddingList(
    embeddings: Optional[Union[np.ndarray, List[np.ndarray]],
    dim: Optional[int],
    dtype: Optional[Union[np.dtype, str, DataType]]
)
```

**PARAMETERS:**

- **embeddings** (*np.ndarray, List[np.ndarray*) -

    vector embedding のリスト。以下のいずれかの型を指定できます。

    - shape が **(n, dim)** の **np.ndarray**。複数の vector embedding のリストを示します

    - shape が **(dim,)** の **np.ndarray**。単一の vector embedding を示します

    - **List[np.ndarray]**。vector embedding 配列のリストを示します

- **dim** (*int*) -

    検証を目的として、**embedding** パラメータで指定された vector embedding の次元数です。 

    指定した場合、すべての vector embedding はこの次元数の制約に従う必要があります。

- **dtype** (*np.dtype, str, [DataType](./Collections-DataType)*) -  

    - `np.float32`、`np.float16`、`np.unit8` などの **np.dtype**

    - `'float32'`、`'float16'`、`'uint8'` などの **string**

    - `DataType.FLOAT_VECTOR`、`DataType.FLOAT16_VECTOR`、`DataType.BFLOAT16_VECTOR`、`DataType.INT8_VECTOR`、`DataType.BINARY_VECTOR` などの **[DataType](./Collections-DataType)**

**RETURN TYPE:**

*EmbeddingList*

**RETURNS:**

**EmbeddingList** インスタンス。

## Examples\{#examples}

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

