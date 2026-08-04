---
title: "encode_queries() | Python"
slug: /python/python/VoyageEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收一个查询字符串列表，并将每个查询编码为一个向量嵌入。 | Python"
type: docx
token: CHnGdE7XlosONPxsVDDc6Fv5n8c
sidebar_position: 2
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
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

    一个字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的查询。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **ImportError**

    当未安装 Voyage 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.dense import VoyageEmbeddingFunction

voyage_ef = VoyageEmbeddingFunction(
    model_name="voyage-lite-02-instruct", # Defaults to `voyage-2`
    api_key='YOUR_API_KEY' # Replace with your own Voyage API key
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = voyage_ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", voyage_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([ 0.01733501, -0.0230672 , -0.05208827, ..., -0.00957995,
#         0.04493361,  0.01485138]), array([ 0.05937521, -0.00729363, -0.02184347, ..., -0.02107683,
#         0.05706626,  0.0263358 ])]
# Dim 1024 (1024,)
```
