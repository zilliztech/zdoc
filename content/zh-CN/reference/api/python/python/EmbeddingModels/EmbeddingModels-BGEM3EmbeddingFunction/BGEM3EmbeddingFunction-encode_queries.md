---
title: "encode_queries() | Python"
slug: /python/python/BGEM3EmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收一个查询字符串列表，并将每个查询编码为向量嵌入。 | Python"
type: docx
token: UehMdosTGoZVzaxdTcUcpy1ynef
sidebar_position: 3
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
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

    一个字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的查询。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*Dict*

**返回值：**

一个包含查询嵌入的字典。

在初始化 [BGEM3EmbeddingFunction](./EmbeddingModels-BGEM3EmbeddingFunction) 时，如果 **return_dense**、**return_sparse** 和 **return_colbert_vecs** 设置为 **True**，则返回的字典将包含 **dense**、**sparse** 和 **colbert_vecs** 键，分别对应稠密嵌入、稀疏词嵌入和 ColBERT 向量。

**异常：**

- **ImportError**

    当未安装 FlagEmbedding 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import model

bge_m3_ef = model.hybrid.BGEM3EmbeddingFunction(
    model_name='BAAI/bge-m3', # Specify t`he model name
    device='cpu', # Specify the device to use, e.g., 'cpu' or 'cuda:0'
    use_fp16=False # Whether to use fp16. `False` for `device='cpu'`.
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = bge_m3_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# Print dimension of dense embeddings
print("Dense query dim:", bge_m3_ef.dim["dense"], query_embeddings["dense"][0].shape)
# Since the sparse embeddings are in a 2D csr_array format, we convert them to a list for easier manipulation.
print("Sparse query dim:", bge_m3_ef.dim["sparse"], list(query_embeddings["sparse"])[0].shape)

# Embeddings: {'dense': [array([-0.02024024, -0.01514386,  0.02380808, ...,  0.00234648,
#        -0.00264978, -0.04317448], dtype=float32), array([ 0.00648045, -0.0081542 , -0.02717067, ..., -0.00380103,
#         0.04200587, -0.01274772], dtype=float32)], 'sparse': <2x250002 sparse array of type '<class 'numpy.float32'>'
#   with 14 stored elements in Compressed Sparse Row format>}
# Dense query dim: 1024 (1024,)
# Sparse query dim: 250002 (1, 250002)
```
