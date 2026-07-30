---
title: "encode_documents() | Python"
slug: /python/python/SpladeEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收文档并将其编码为向量嵌入。 | Python"
type: docx
token: PwL1dndmVoxP98xp0pXcOci4nSe
sidebar_position: 1
keywords: 
  - 什么是向量数据库
  - 向量数据库对比
  - Faiss
  - 视频搜索
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
) -> csr_array
```

**参数：**

- **documents** (*List[str]*)

    一个字符串值列表，其中每个字符串表示一个将被传递给嵌入模型进行编码的文档。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*csr_array*

**返回值：**

表示文档嵌入的压缩稀疏行矩阵。

**异常：**

- **ImportError**

    当未安装 transformers 库时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import model

splade_ef = model.sparse.SpladeEmbeddingFunction(
    model_name="naver/splade-cocondenser-selfdistil", 
    device="cpu"
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = splade_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# since the output embeddings are in a 2D csr_array format, we convert them to a list for easier manipulation.
print("Sparse dim:", splade_ef.dim, list(docs_embeddings)[0].shape)

# Embeddings:   (0, 2001)   0.6392706036567688
#   (0, 2034)   0.024093208834528923
#   (0, 2082)   0.3230178654193878
# ...
#   (2, 23602)  0.5671860575675964
#   (2, 26757)  0.5770265460014343
#   (2, 28639)  3.1990697383880615
# Sparse dim: 30522 (1, 30522)
```
