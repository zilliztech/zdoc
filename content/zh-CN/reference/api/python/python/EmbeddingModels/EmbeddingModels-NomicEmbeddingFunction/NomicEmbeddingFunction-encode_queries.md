---
title: "encode_queries() | Python"
slug: /python/python/NomicEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收一个查询字符串列表，并将每个查询编码为一个向量嵌入。 | Python"
type: docx
token: KBujdxXhko2zJjx4hFmcsHGhn4g
sidebar_position: 2
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
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

    一个字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的查询。模型会为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **ValueError**

    当未提供 `api_key` 且也未设置 `NOMIC_API_KEY` 环境变量时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.dense import NomicEmbeddingFunction

ef = NomicEmbeddingFunction(
    model_name="nomic-embed-text-v1.5", # Defaults to `mistral-embed`
    api_key="NOMIC_API_KEY" # Provide your Nomic API key
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", ef.dim, query_embeddings[0].shape)

# Embeddings: [array([ 3.24096680e-02,  7.35473600e-02, -1.63940430e-01, -4.45556640e-02,
#         7.83081050e-02,  2.64587400e-02,  1.35898590e-03, -1.59606930e-02,
#        -3.33557130e-02,  1.05056760e-02, -2.35290530e-02,  2.23388670e-02,
#         ...
#         7.67211900e-02,  4.54406740e-02,  9.70459000e-02,  4.00161740e-03,
#        -3.12805180e-02, -7.05566400e-02,  5.04760740e-02,  5.22766100e-02,
#        -3.87878400e-02, -3.03649900e-03,  5.90515140e-03, -1.95007320e-02])]
# Dim 768 (768,)
```
