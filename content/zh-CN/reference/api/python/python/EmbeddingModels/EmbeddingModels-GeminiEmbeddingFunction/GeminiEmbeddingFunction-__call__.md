---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/GeminiEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Model2VecEmbeddingFunction 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: Pvdhdb8IrozdCgx3N4fcTWdWnPg
sidebar_position: 4
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - \_\_call\_\_()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call\_\_()

[Model2VecEmbeddingFunction](./EmbeddingModels-Model2VecEmbeddingFunction) 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。

Model2VecEmbeddingFunction 的 **[GeminiEmbeddingFunction()](./EmbeddingModels-GeminiEmbeddingFunction)** 方法与 [encode_documents()](./Model2VecEmbeddingFunction-encode_documents) 和 [encode_queries()](./Model2VecEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created
gemini_ef = model.dense.GeminiEmbeddingFunction()

# __call__ method will be called
gemini_ef(
    texts: List[str]
) -> List[np.array]
```

**参数：**

- **texts** (*List[str]*)

    一个字符串值列表，其中每个字符串都表示将传递给嵌入模型进行编码的文本。模型将为列表中的每个字符串生成一个嵌入向量。

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

gemini_ef = model.dense.GeminiEmbeddingFunction(
    model_name="gemini-embedding-exp-03-07",
    api_key="YOUR_API_KEY",
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = gemini_ef.encode_documents(docs)

# Embeddings: [array([-0.00894029,  0.00573813,  0.013351  , ..., -0.00042766,
#        -0.00603091, -0.00341043], shape=(3072,)), array([ 0.00222347,  0.03725113,  0.01152256, ...,  0.01047272,
#        -0.01701597,  0.00565377], shape=(3072,)), array([ 0.00661134,  0.00232328, -0.01342973, ..., -0.00514429,
#        -0.02374139, -0.00701721], shape=(3072,))]
# Dim: 3072 (3072,)
```

