---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/NomicEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "NomicEmbeddingFunction 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: Dsl1dDLBeoGixjxt2lpcFP5ynSA
sidebar_position: 4
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
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

[NomicEmbeddingFunction](./EmbeddingModels-NomicEmbeddingFunction) 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。

NomicEmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./NomicEmbeddingFunction-encode_documents) 和 [encode_queries()](./NomicEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created

ef = NomicEmbeddingFunction()

# __call__ method will be called
ef(
    texts: List[str]
) -> List[np.array]
```

**参数：**

- **texts** (*List[str]*)

    一个字符串值列表，其中每个字符串表示将传递给嵌入模型进行编码的文本。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

*None*

## 示例\{#examples}

```python
from pymilvus.model.dense import NomicEmbeddingFunction

ef = NomicEmbeddingFunction(
    model_name="nomic-embed-text-v1.5", # Defaults to `mistral-embed`
    api_key="NOMIC_API_KEY" # Provide your Nomic API key
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

ef(docs)

# [array([ 5.59997560e-02,  7.23266600e-02, -1.51977540e-01, -4.53491200e-02,
#         6.49414060e-02,  4.33654800e-02,  2.26593020e-02, -3.51867680e-02,
#         3.49998470e-03,  1.75571440e-03, -4.30297850e-03,  1.81274410e-02,
#         ...
#        -1.64337160e-02, -3.85437000e-02,  6.14318850e-02, -2.82745360e-02,
#        -7.25708000e-02, -4.15563580e-04, -7.63320900e-03,  1.88446040e-02,
#        -5.78002930e-02,  1.69830320e-02, -8.91876200e-03, -2.37731930e-02])]
```
