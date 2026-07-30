---
title: "encode_queries() | Python"
slug: /python/python/JinaEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收一个查询字符串列表，并将每个查询编码为一个向量嵌入。 | Python"
type: docx
token: FgbjdQHBEoITxgxk7NMc1NzpnAc
sidebar_position: 2
keywords: 
  - 什么是向量嵌入
  - 向量数据库教程
  - 向量数据库如何工作
  - 向量数据库对比
  - zilliz
  - zilliz cloud
  - cloud
  - encode_queries()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# encode_queries()

此操作接收一个查询字符串列表，并将每个查询编码为一个向量嵌入。

## 请求语法\{#request-syntax}

```python
encode_queries(
    queries: List[str], 
) -> List[np.array]
```

**参数：**

- **queries** (*List[str]*)

    一个字符串值列表，其中每个字符串表示将传递给嵌入模型进行编码的查询。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **RuntimeError**

    当来自 Jina API 的响应中不包含 `data` 键时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.dense import JinaEmbeddingFunction

jina_ef = JinaEmbeddingFunction(
    model_name="jina-embeddings-v2-base-en", # Defaults to `jina-embeddings-v2-base-en`
    api_key="YOUR_JINAAI_API_KEY" # Provide your Jina AI API key
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = jina_ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", jina_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-5.99164660e-01, -3.49827350e-01,  8.22405160e-01, -1.18632730e-01,
#         5.78107540e-01,  1.09789170e-01,  2.91604200e-01, -3.29306450e-01,
#         2.93779640e-01, -2.17880800e-01, -6.84535440e-01, -3.79752000e-01,
#        -3.47541800e-01,  9.20846100e-02, -6.13804400e-01,  6.31312800e-01,
# ...
#        -1.84993740e-02,  9.38629150e-01,  2.74858470e-02,  1.09396360e+00,
#         3.96270750e-01,  7.44445800e-01, -1.95404050e-01, -6.08383200e-01,
#        -3.75076300e-01,  3.87512200e-01,  8.11889650e-01, -3.76407620e-01])]
# Dim 768 (768,)
```
