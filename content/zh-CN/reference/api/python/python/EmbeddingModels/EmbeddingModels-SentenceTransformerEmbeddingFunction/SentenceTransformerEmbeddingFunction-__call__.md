---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/SentenceTransformerEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "SentenceTransformerEmbeddingFunction 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: ZWLCdBWwOo4OSVxfnNRcDrv5nhe
sidebar_position: 4
keywords: 
  - Pinecone 向量 Database
  - 音频搜索
  - 什么是语义搜索
  - 嵌入模型
  - zilliz
  - zilliz cloud
  - 云
  - \_\_call\_\_()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call\_\_()

[SentenceTransformerEmbeddingFunction](./EmbeddingModels-SentenceTransformerEmbeddingFunction) 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。

为防止直接使用 **\_\_call()\_\_** 方法时出现潜在错误，请避免在初始化 SentenceTransformerEmbeddingFunction 时使用 **query_instruction** 或 **doc_instruction**。更多信息，请参阅 [SentenceTransformerEmbeddingFunction](./EmbeddingModels-SentenceTransformerEmbeddingFunction)。

## 请求语法\{#request-syntax}

```python
# Instance created
sentence_transformer_ef = SentenceTransformerEmbeddingFunction()

# __call__ method will be called
sentence_transformer_ef(
    texts: List[str]
) -> List[np.array]
```

**参数：**

- **texts** (*List[str]*)

    一个字符串值列表，其中每个字符串都表示将传递给嵌入模型进行编码的文本。模型会为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **ImportError**

    当未安装必需的 sentence-transformers 模块时，将引发此异常。

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

sentence_transformer_ef(docs)

# [array([-3.09392996e-02, -1.80662833e-02,  1.34775648e-02,  2.77156215e-02,
#         -4.86349640e-03, -3.12581174e-02, -3.55921760e-02,  5.76934684e-03,
#          2.80773244e-03,  1.35783911e-01,  3.59678417e-02,  6.17732145e-02,
# ...
#         -1.43224243e-02,  4.15765122e-02, -2.97174603e-02,  4.85958979e-02,
#          1.26190051e-01,  6.31634071e-02,  8.69929418e-02,  5.49541414e-03,
#         -4.61330153e-02, -4.85207550e-02,  3.13997865e-02,  7.82178566e-02,
#         -4.75336798e-02,  5.21207601e-02,  9.04406682e-02, -5.36676683e-02],
#        dtype=float32)]
```
