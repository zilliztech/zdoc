---
title: "encode_queries() | Python"
slug: /python/python/Model2VecEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收一个查询字符串列表，并将每个查询编码为一个向量嵌入。 | Python"
type: docx
token: Px9Ydg6KSoNFV2xBumpcGBNqn8d
sidebar_position: 2
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
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

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **ImportError**

    当未安装 model2vec 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import model

model2vec_ef = Model2VecEmbeddingFunction(
    model_source="minishlab/potion-base-8M" # Specify the model source (loads from Hugging Face or local path)
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = model2vec_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# Print dimension and shape of embeddings
print("Dim:", model2vec_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-1.87109038e-02, -2.81724217e-03, -1.67356253e-01, -5.30372337e-02,
#        1.08304240e-01, -1.09269567e-01, -2.53464818e-01, -1.77880954e-02,
#        3.05427872e-02,  1.68244764e-01, -7.25950347e-03, -2.52178032e-02,
#       -1.22040585e-01, -4.19903360e-02, -1.28572553e-01,  6.58077672e-02,
# ...
#       -2.45161876e-02,  4.75575700e-02,  1.03392657e-02,  5.65353176e-03,
#        8.60440824e-03,  2.12906860e-03,  1.50156394e-02, -1.29304864e-02,
#       -3.66544276e-02,  5.01735881e-03, -1.53137008e-02,  9.57900891e-04],
#      dtype=float32)]
# Dim: 256 (256,)
```

