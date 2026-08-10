---
title: "to_numpy() | Python | MilvusClient"
slug: /python/python/EmbeddingList-to_numpy
sidebar_label: "to_numpy()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将当前 EmbeddingList 转换为包含所有向量嵌入的 NumPy 数组。 | Python | MilvusClient"
type: docx
token: XQAQd2tPKon4JgxKEoAc0CCHnUg
sidebar_position: 6
keywords: 
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - zilliz
  - zilliz cloud
  - 云
  - to_numpy()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_numpy()

此操作将当前 **[EmbeddingList](./MilvusClient-EmbeddingList)** 实例转换为包含所有向量嵌入的二维（2D）NumPy 数组。

## 请求语法\{#request-syntax}

```python
to_numpy()
```

**返回类型：**

*np.ndarray*

**返回值：**

一个二维（2D）NumPy 数组，包含所有向量嵌入，形状为 **(num_embeddings, dim)**。

**异常：**

- **ValueError**：

    如果当前 **[EmbeddingList](./MilvusClient-EmbeddingList)** 实例为空，则会引发此异常。

## 示例\{#examples}

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

