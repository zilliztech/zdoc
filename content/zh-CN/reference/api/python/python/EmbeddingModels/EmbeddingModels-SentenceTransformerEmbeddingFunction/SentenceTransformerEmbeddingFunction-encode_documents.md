---
title: "encode_documents() | Python"
slug: /python/python/SentenceTransformerEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收文档并将其编码为向量嵌入。 | Python"
type: docx
token: MOPzdeyjzoO8DlxAlL0clX00nBc
sidebar_position: 1
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - encode_documents()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# encode_documents()

此操作接收文档并将其编码为向量嵌入。

## 请求语法\{#request-syntax}

```python
encode_documents(
    documents: List[str], 
) -> List[np.array]
```

**参数：**

- **documents** (*List[str]*)

    一个字符串值列表，其中每个字符串表示将传递给嵌入模型进行编码的文档。模型将为列表中的每个字符串生成一个嵌入向量。

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

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = sentence_transformer_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", sentence_transformer_ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([-3.09392996e-02, -1.80662833e-02,  1.34775648e-02,  2.77156215e-02,
#        -4.86349640e-03, -3.12581174e-02, -3.55921760e-02,  5.76934684e-03,
#         2.80773244e-03,  1.35783911e-01,  3.59678417e-02,  6.17732145e-02,
# ...
#        -4.61330153e-02, -4.85207550e-02,  3.13997865e-02,  7.82178566e-02,
#        -4.75336798e-02,  5.21207601e-02,  9.04406682e-02, -5.36676683e-02],
#       dtype=float32)]
# Dim: 384 (384,)
```
