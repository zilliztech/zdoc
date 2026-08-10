---
title: "encode_queries() | Python"
slug: /python/python/OpenAIEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收查询字符串列表，并将每个查询编码为向量嵌入。 | Python"
type: docx
token: Sf9UdzL3rolQNAxDm8Ecga3snhg
sidebar_position: 2
keywords: 
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - 向量索引
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

    当未安装 OpenAI 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import model

openai_ef = model.dense.OpenAIEmbeddingFunction(
    model_name='text-embedding-3-large', # Specify the model name
    dimensions=512 # Set the embedding dimensionality according to MRL feature.
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = openai_ef.encode_queries(queries)

# Print embeddings
print("Embeddings:", query_embeddings)
# Print dimension and shape of embeddings
print("Dim:", openai_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([ 0.00530251, -0.01907905, -0.01672608, -0.05030033,  0.01635982,
#        -0.03169853, -0.0033602 ,  0.09047844,  0.00030747,  0.11853652,
#        -0.02870182, -0.01526102,  0.05505067,  0.00993909, -0.07165466,
# ...
#        -9.78106782e-02, -2.22669560e-02,  1.21873049e-02, -4.83198799e-02,
#         5.32377362e-02, -1.90469325e-02,  5.62430918e-02,  1.02650477e-02,
#        -6.21757433e-02,  7.88027793e-02,  4.91846527e-04, -1.51633881e-02])]
# Dim: 512 (512,)
```
