---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/BGEM3EmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "BGEM3EmbeddingFunction 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: K7qWdSwtNo976VxcvopczGLjnLf
sidebar_position: 4
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
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

[BGEM3EmbeddingFunction](./EmbeddingModels-BGEM3EmbeddingFunction) 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。

BGEM3EmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./BGEM3EmbeddingFunction-encode_documents) 和 [encode_queries()](./BGEM3EmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created
bge_m3_ef = BGEM3EmbeddingFunction()

# __call__ method will be called
bge_m3_ef(
    texts: List[str]
) -> Dict
```

**参数：**

- **texts** (*List[str]*)

    一个字符串值列表，其中每个字符串表示将传递给嵌入模型进行编码的文本。模型会为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*Dict*

**返回：**

一个包含文档嵌入的字典。

在初始化 [BGEM3EmbeddingFunction](./EmbeddingModels-BGEM3EmbeddingFunction) 时，如果 **return_dense**、**return_sparse** 和 **return_colbert_vecs** 设置为 **True**，则返回的字典将包含键 **dense**、**sparse** 和 **colbert_vecs**，分别对应稠密嵌入、稀疏词嵌入和 ColBERT 向量。

**异常：**

- **ImportError**

    当未安装 FlagEmbedding 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import model

# Create a BGEM3EmbeddingFunction instance
bge_m3_ef = model.hybrid.BGEM3EmbeddingFunction(
    model_name='BAAI/bge-m3', # Specify t`he model name
    device='cpu', # Specify the device to use, e.g., 'cpu' or 'cuda:0'
    use_fp16=False # Whether to use fp16. `False` for `device='cpu'`.
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

# bge_m3_ef.__call__ will be called
bge_m3_ef(docs)

# {'dense': [array([-0.02505937, -0.00142193,  0.04015467, ..., -0.02094924,
#           0.02623661,  0.00324098], dtype=float32),
#   array([ 0.00118463,  0.00649292, -0.00735763, ..., -0.01446293,
#           0.04243685, -0.01794822], dtype=float32),
#   array([ 0.00415287, -0.0101492 ,  0.0009811 , ..., -0.02559666,
#           0.08084674,  0.00141647], dtype=float32)],
#  'sparse': <3x250002 sparse array of type '<class 'numpy.float32'>'
#   with 43 stored elements in Compressed Sparse Row format>}
```
