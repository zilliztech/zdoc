---
title: "encode_queries() | Python"
slug: /python/python/MGTEEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收一个查询字符串列表，并将每个查询编码为向量嵌入。 | Python"
type: docx
token: HEWIdid9BoFMyNxN8Bbc0P3nn6g
sidebar_position: 2
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
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
) -> Dict
```

**参数：**

- **queries** (*List[str]*)

    一个字符串值列表，其中每个字符串表示将传递给嵌入模型进行编码的查询。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*Dict*

**返回：**

一个包含编码后嵌入的字典，包括 dense 和 sparse 两种表示。

**异常：**

*无*

## 示例\{#examples}

```python
from pymilvus.model.hybrid import MGTEEmbeddingFunction

ef = MGTEEmbeddingFunction()

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print(ef.dim)

# Embeddings: {'dense': [tensor([ 6.5883e-03, -7.9415e-03, -3.3669e-02, -2.6450e-02,  1.4345e-02,
#          1.9612e-02, -8.1679e-02,  5.6361e-02,  6.9020e-02,  1.9827e-02,
#         -9.2933e-03, -1.9995e-02, -1.0055e-01, -5.4053e-02, -8.5991e-02,
#          8.3004e-02,  1.0870e-01,  1.1565e-01,  2.1268e-02, -1.3782e-02,
#         ...
#          3.2847e-02, -2.3751e-02,  3.4475e-02,  5.3623e-02, -3.3894e-02,
#          7.9408e-02,  8.2720e-03, -2.3459e-02], device='mps:0')], 'sparse': <Compressed Sparse Row sparse array of dtype 'float64'
#         with 13 stored elements and shape (2, 250002)>}

# {'dense': 768, 'sparse': 250002}
```
