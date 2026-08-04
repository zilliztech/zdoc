---
title: "encode_queries() | Python"
slug: /python/python/CohereEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收一个查询字符串列表，并将每个查询编码为向量嵌入。 | Python"
type: docx
token: BqtYdPHHPoNhyKxhSnEcVOKenFb
sidebar_position: 3
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
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

此操作接收一个查询字符串列表，并将每个查询编码为向量嵌入。

## 请求语法\{#request-syntax}

```python
encode_queries(
    queries: List[str], 
) -> List[np.array]
```

**参数：**

- **queries** (*List[str]*)

    一个字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的查询。模型会为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **ValueError**

    当您在初始化 `CohereEmbeddingFunction` 时指定了多种嵌入类型，或使用了 `int8` 或 `uint8` 数据类型时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.dense import CohereEmbeddingFunction

cohere_ef = CohereEmbeddingFunction(
    model_name="embed-english-light-v3.0",
    api_key=COHERE_API_KEY,
    input_type="search_document",
    embedding_types=["float"]
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = cohere_ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", cohere_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-1.33361816e-02,  9.79423523e-04, -7.28759766e-02, -1.93786621e-02,
#        -9.71679688e-02,  4.34875488e-02, -9.81445312e-02,  1.16882324e-01,
#         5.89904785e-02, -4.19921875e-02,  4.95910645e-02,  5.83496094e-02,
#         3.47595215e-02, -5.87463379e-03, -7.30514526e-03,  2.92816162e-02,
# ...
#         0.00749969, -0.01192474,  0.02719116,  0.03347778,  0.07696533,
#         0.01409149,  0.00964355, -0.01681519, -0.0073204 ,  0.00043154,
#        -0.04577637,  0.03591919, -0.02807617, -0.04812622], dtype=float32)]
# Dim 384 (384,)
```
