---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/Model2VecEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Model2VecEmbeddingFunction 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: WJpVd6gQzoxCEUxM93ScXsL5ntA
sidebar_position: 4
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
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

Model2VecEmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./Model2VecEmbeddingFunction-encode_documents) 和 [encode_queries()](./Model2VecEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created
model2vec_ef = Model2VecEmbeddingFunction()

# __call__ method will be called
model2vec_ef(
    texts: List[str]
) -> List[np.array]
```

**参数：**

- **texts** (*List[str]*)

    一个字符串值列表，其中每个字符串都表示将传递给嵌入模型进行编码的文本。模型会为列表中的每个字符串生成一个嵌入向量。

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

model2vec_ef(docs)

# [array([ 0.02220882,  0.11436888, -0.15094341,  0.08149259,  0.20425692,
#       -0.15727402, -0.25320682, -0.00669029,  0.03157463,  0.08974048,
#       -0.00148778, -0.01803541,  0.00230828, -0.0137875 , -0.19242321,
#       -2.64913328e-02,  1.35472575e-02, -5.33258542e-02,  2.47090831e-02,
# ...
#       -4.66700038e-03,  9.53254756e-03,  1.12857306e-02, -2.91118585e-02,
#       -7.29782460e-03, -2.15345751e-02, -4.13905866e-02,  3.70773636e-02,
#        5.45082428e-02,  1.36436718e-02,  1.38598625e-02,  3.91175086e-03],
#      dtype=float32)]
```

