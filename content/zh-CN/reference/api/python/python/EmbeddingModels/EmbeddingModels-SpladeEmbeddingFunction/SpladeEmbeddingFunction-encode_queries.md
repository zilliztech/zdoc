---
title: "encode_queries() | Python"
slug: /python/python/SpladeEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收查询字符串列表，并将每个查询编码为向量嵌入。 | Python"
type: docx
token: S9zPdiLkpokjfkxfZ68cWIFynnd
sidebar_position: 2
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
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
) -> csr_array
```

**参数：**

- **queries** (*List[str]*)

    一个字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的查询。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*csr_array*

**返回值：**

表示查询嵌入的压缩稀疏行矩阵。

**异常：**

- **ImportError**

    当未安装 transformers 库时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import model

splade_ef = model.sparse.SpladeEmbeddingFunction(
    model_name="naver/splade-cocondenser-selfdistil", 
    device="cpu"
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = splade_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# since the output embeddings are in a 2D csr_array format, we convert them to a list for easier manipulation.
print("Sparse dim:", splade_ef.dim, list(query_embeddings)[0].shape)

# Embeddings:   (0, 2001)   0.6353746056556702
#   (0, 2194)   0.015553371049463749
#   (0, 2301)   0.2756537199020386
# ...
#   (1, 18522)  0.1282549500465393
#   (1, 23602)  0.13133203983306885
#   (1, 28639)  2.8150033950805664
# Sparse dim: 30522 (1, 30522)
```
