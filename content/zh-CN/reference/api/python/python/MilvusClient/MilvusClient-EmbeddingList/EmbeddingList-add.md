---
title: "add() | Python | MilvusClient"
slug: /python/python/EmbeddingList-add
sidebar_label: "add()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将单个向量嵌入添加到当前的 EmbeddingList 实例中。 | Python | MilvusClient"
type: docx
token: R0E9dLzIAoYGCcxRVj6cjJmWnPe
sidebar_position: 1
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
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

此操作会将单个向量嵌入添加到当前的 **[EmbeddingList](./MilvusClient-EmbeddingList)** 实例中。

## 请求语法\{#request-syntax}

```python
add(
    self,
    embedding: Union[np.ndarray, List[Any]]
)
```

**参数：**

- **embedding** (*np.ndarray, List[Any]*) - 

    要添加到当前 **[EmbeddingList](./MilvusClient-EmbeddingList)** 实例中的向量嵌入。

**返回类型：**

*[EmbeddingList](./MilvusClient-EmbeddingList)*

**返回：**

当前 **[EmbeddingList](./MilvusClient-EmbeddingList)** 实例本身，以便进行方法链式调用

**异常：**

- **ValueError**:

    如果提供的向量嵌入与现有嵌入的维度不一致，则会引发此异常。

## 示例\{#examples}

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings one after another
embeddingList.add([0.1, 0.2, 0.3, 0.4, 0.5])
embeddingList.add([0.5, 0.4, 0.3, 0.2, 0.1])
```
