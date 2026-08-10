---
title: "encode_queries() | Python"
slug: /python/python/SentenceTransformerEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收查询字符串列表，并将每个查询编码为向量嵌入。 | Python"
type: docx
token: HTx1dgoAloCELUxWLGxc0GPlno6
sidebar_position: 2
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - zilliz
  - zilliz cloud
  - 云
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

    字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的查询。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **ImportError**

    当未安装所需的 sentence-transformers 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import model

sentence_transformer_ef = model.dense.SentenceTransformerEmbeddingFunction(
    model_name='all-MiniLM-L6-v2', # Specify the model name
    device='cpu' # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = sentence_transformer_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# Print dimension and shape of embeddings
print("Dim:", sentence_transformer_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-2.52114702e-02, -5.29330298e-02,  1.14570223e-02,  1.95571519e-02,
#        -2.46500354e-02, -2.66519729e-02, -8.48201662e-03,  2.82961670e-02,
#        -3.65092754e-02,  7.50745758e-02,  4.28900979e-02,  7.18822703e-02,
# ...
#        -6.76431581e-02, -6.45996556e-02, -4.67132553e-02,  4.78532910e-02,
#        -2.31596199e-03,  4.13446948e-02,  1.06935494e-01, -1.08258888e-01],
#       dtype=float32)]
# Dim: 384 (384,)
```
