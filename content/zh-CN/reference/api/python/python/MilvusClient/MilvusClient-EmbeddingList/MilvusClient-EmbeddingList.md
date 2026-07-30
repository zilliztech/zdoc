---
title: "EmbeddingList | Python | MilvusClient"
slug: /python/python/MilvusClient-EmbeddingList
sidebar_label: "EmbeddingList"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "EmbeddingList 实例表示一个向量嵌入列表。您可以使用 EmbeddingList 实例来构建查询向量，以便在 Array of Structs 字段中的向量字段上执行搜索。 | Python | MilvusClient"
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

**EmbeddingList** 实例表示一个向量嵌入列表。您可以使用 **EmbeddingList** 实例来构建查询向量，以便在 Array of Structs 字段中的向量字段上执行搜索。

```python
class pymilvus.EmbeddingList
```

## 构造函数\{#constructor}

构造一个空的嵌入列表，或由给定向量嵌入组成的列表。

```python
EmbeddingList(
    embeddings: Optional[Union[np.ndarray, List[np.ndarray]],
    dim: Optional[int],
    dtype: Optional[Union[np.dtype, str, DataType]]
)
```

**参数：**

- **embeddings** (*np.ndarray, List[np.ndarray*) -

    向量嵌入列表，可以是以下任一类型：

    - 形状为 **(n, dim)** 的 **np.ndarray**，表示由多个向量嵌入组成的列表

    - 形状为 **(dim,)** 的 **np.ndarray**，表示单个向量嵌入

    - **List[np.ndarray]**，表示一个由向量嵌入数组组成的列表

- **dim** (*int*) -

    在验证时，用于指定 **embedding** 参数中向量嵌入的维度。 

    如果提供了该参数，则所有指定的向量嵌入都必须符合该维度限制。

- **dtype** (*np.dtype, str, [DataType](./Collections-DataType)*) -  

    - **np.dtype**，例如 `np.float32`、`np.float16` 或 `np.unit8`

    - **string**，例如 `'float32'`、`'float16'` 或 `'uint8'`

    - **[DataType](./Collections-DataType)**，例如 `DataType.FLOAT_VECTOR`、`DataType.FLOAT16_VECTOR`、`DataType.BFLOAT16_VECTOR`、`DataType.INT8_VECTOR` 或 `DataType.BINARY_VECTOR`

**返回类型：**

*EmbeddingList*

**返回：**

一个 **EmbeddingList** 实例。

## 示例\{#examples}

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

