---
title: "add_batch() | Python | MilvusClient"
slug: /python/python/EmbeddingList-add_batch
sidebar_label: "add_batch()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向当前 EmbeddingList 实例添加多个向量嵌入。 | Python | MilvusClient"
type: docx
token: PSbXd6sMGoLK6Ix6BRpciHQEnVb
sidebar_position: 2
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - Zilliz
  - Zilliz Cloud
  - 云
  - add_batch()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_batch()

此操作会向当前 **EmbeddingList** 实例添加多个向量嵌入。

## 请求语法\{#request-syntax}

```python
add_batch(
    self,
    embedding: Union[List[np.ndarray], np.ndarray]
)
```

**参数：**

- **embeddings** （*List[np.ndarray], np.ndarray*） -

    要添加到当前 EmbeddingList 实例的向量嵌入。

**返回类型：**

*EmbeddingList*

**返回：**

当前 EmbeddingList 实例本身，以便进行方法链式调用。

**异常：**

- **ValueError**

    如果提供的向量嵌入与现有向量嵌入在维度上不匹配，则会引发此异常。如果提供的向量嵌入与现有向量嵌入在维度上不匹配，则会引发此异常。

## 示例\{#examples}

```python
from pymilvus import EmbeddingList

# create an empty embedding list
embeddingList = EmbeddingList()

# add multiple vector embeddings in a batch
embeddingList.add_batch(
    embeddings=[[0.1, 0.2, 0.3, 0.4, 0.5], [0.5, 0.4, 0.3, 0.2, 0.1]]
)
```
