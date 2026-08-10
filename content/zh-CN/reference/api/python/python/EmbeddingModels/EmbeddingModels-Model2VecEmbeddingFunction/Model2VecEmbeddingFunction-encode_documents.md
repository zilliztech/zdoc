---
title: "encode_documents() | Python"
slug: /python/python/Model2VecEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收文档并将其编码为向量嵌入。 | Python"
type: docx
token: WJY1dMUO5owB1gxkOlLcaB2Rn7g
sidebar_position: 1
keywords: 
  - llm-as-a-judge
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - zilliz
  - zilliz cloud
  - 云
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

**返回：**

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

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = model2vec_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", model2vec_ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([ 0.02220882,  0.11436888, -0.15094341,  0.08149259,  0.20425692,
#       -0.15727402, -0.25320682, -0.00669029,  0.03157463,  0.08974048,
#       -0.00148778, -0.01803541,  0.00230828, -0.0137875 , -0.19242321,
#       -0.01353845, -0.17632745,  0.03382885,  0.07306298,  0.0569298 ,
# ...
#       -4.66700038e-03,  9.53254756e-03,  1.12857306e-02, -2.91118585e-02,
#       -7.29782460e-03, -2.15345751e-02, -4.13905866e-02,  3.70773636e-02,
#        5.45082428e-02,  1.36436718e-02,  1.38598625e-02,  3.91175086e-03],
#      dtype=float32)]
# Dim: 256 (256,)
```

