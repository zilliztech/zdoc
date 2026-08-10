---
title: "encode_documents() | Python"
slug: /python/python/CohereEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收文档并将其编码为向量嵌入。 | Python"
type: docx
token: FIyedc51So0onWxtPAjcHFkmnHe
sidebar_position: 2
keywords: 
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - 向量检索
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

    字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的文档。模型会为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **ValueError**

    当您指定多个嵌入类型，或在初始化 CohereEmbeddingFunction 时使用 `int8` 或 `uint8` 数据类型时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.dense import CohereEmbeddingFunction

cohere_ef = CohereEmbeddingFunction(
    model_name="embed-english-light-v3.0",
    api_key="YOUR_COHERE_API_KEY",
    input_type="search_document",
    embedding_types=["float"]
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = cohere_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", cohere_ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([ 3.43322754e-02,  1.16252899e-03, -5.25207520e-02,  1.32846832e-03,
#        -6.80541992e-02,  6.10961914e-02, -7.06176758e-02,  1.48925781e-01,
#         1.54174805e-01,  1.98516846e-02,  2.43835449e-02,  3.55224609e-02,
#         1.82952881e-02,  7.57446289e-02, -2.40783691e-02,  4.40063477e-02,
# ...
#         0.06359863, -0.01971436, -0.02253723,  0.00354195,  0.00222015,
#         0.00184727,  0.03408813, -0.00777817,  0.04919434,  0.01519775,
#        -0.02862549,  0.04760742, -0.07891846,  0.0124054 ], dtype=float32)]
# Dim: 384 (384,)
```
