---
title: "to_flat_array() | Python | MilvusClient"
slug: /python/python/EmbeddingList-to_flat_array
sidebar_label: "to_flat_array()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将当前 EmbeddingList 实例转换为一个展平的 NumPy 数组，其中包含拼接后的所有向量嵌入。 | Python | MilvusClient"
type: docx
token: Z76PdoAJkoGaMPxG4CFcCmShnwh
sidebar_position: 5
keywords: 
  - 开源向量 Database
  - 向量索引
  - 开源向量 Database
  - 开源向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - to_flat_array()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_flat_array()

此操作会将当前 **[EmbeddingList](./MilvusClient-EmbeddingList)** 实例转换为一个展平的 NumPy 数组，其中包含拼接后的所有向量嵌入。

## 请求语法\{#request-syntax}

```python
to_flat_array()
```

**返回类型：**

*np.ndarray*

**返回：**

一个展平的 NumPy 数组，其中包含拼接后的所有向量嵌入。

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

embeddingList.to_flat_array()
```
