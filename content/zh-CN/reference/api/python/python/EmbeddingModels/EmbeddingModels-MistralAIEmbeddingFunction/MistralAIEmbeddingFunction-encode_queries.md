---
title: "encode_queries() | Python"
slug: /python/python/MistralAIEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收查询字符串列表，并将每个查询编码为向量嵌入。 | Python"
type: docx
token: SptWdOyFqoGM5VxVS16cofqfnDg
sidebar_position: 2
keywords: 
  - 多模态 RAG
  - llm 幻觉
  - 混合搜索
  - 词法搜索
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

此操作接收查询字符串列表，并将每个查询编码为向量嵌入。

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

- **ValueError**

    当未提供 `api_key` 且也未设置 `MISTRALAI_API_KEY` 环境变量时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.dense import MistralAIEmbeddingFunction

ef = MistralAIEmbeddingFunction(
    model_name="mistral-embed", # Defaults to `mistral-embed`
    api_key="MISTRAL_API_KEY" # Provide your Mistral AI API key
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-0.04916382,  0.04568481,  0.03594971, ..., -0.02653503,
#         0.02804565,  0.00600815]), array([-0.05938721,  0.07098389,  0.01773071, ..., -0.01708984,
#         0.03582764,  0.00366592])]
# Dim 1024 (1024,)
```
