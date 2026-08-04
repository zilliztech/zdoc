---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/SpladeEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "SpladeEmbeddingFunction 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: LJqud2x3AojxV4xKONocTe4YnFb
sidebar_position: 4
keywords: 
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
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

[SpladeEmbeddingFunction](./EmbeddingModels-SpladeEmbeddingFunction) 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。

与 [encode_documents()](./SpladeEmbeddingFunction-encode_documents) 或 [encode_queries()](./SpladeEmbeddingFunction-encode_queries) 不同，后两者允许你添加前缀 **doc_instruction** 或 **query_instruction**，并使用 **k_tokens_document** 或 **k_tokens_query** 对结果进行裁剪，而 **\_\_call\_\_()** 方法会直接返回嵌入，不提供添加前缀指令或裁剪结果的选项。

## 请求语法\{#request-syntax}

```python
# Instance created
splade_ef = SpladeEmbeddingFunction()

# __call__ method will be called
splade_ef(
    texts: List[str]
) -> csr_array
```

**参数：**

- **texts** (*List[str]*)

    字符串值列表，其中每个字符串表示将传递给嵌入模型进行编码的文本。模型会为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*csr_array*

**返回：**

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

splade_ef(docs)

# <3x30522 sparse array of type '<class 'numpy.float32'>'
#   with 298 stored elements in Compressed Sparse Row format>
```
