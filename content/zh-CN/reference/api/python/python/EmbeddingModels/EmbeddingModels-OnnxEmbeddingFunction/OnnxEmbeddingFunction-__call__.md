---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/OnnxEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "OnnxEmbeddingFunction 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: PlzSdJTGnoFVH6xSlS6cYBHZnph
sidebar_position: 4
keywords: 
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
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

[OnnxEmbeddingFunction](./EmbeddingModels-OnnxEmbeddingFunction) 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。

OnnxEmbeddingFunction 的 `call` 方法与 [encode_documents()](./OnnxEmbeddingFunction-encode_documents) 和 [encode_queries()](./OnnxEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created
onnx_ef = OnnxEmbeddingFunction()

# __call__ method will be called
onnx_ef(
    texts: List[str]
) -> List[np.array]
```

**参数：**

- **texts** (*List[str]*)

    字符串值列表，其中每个字符串都表示将传递给嵌入模型进行编码的文本。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是 NumPy 数组。

**异常：**

*无*

## 示例\{#examples}

```python
from pymilvus.model.dense import OnnxEmbeddingFunction

onnx_ef = OnnxEmbeddingFunction(
    model_name="GPTCache/paraphrase-albert-onnx", # Defaults to `GPTCache/paraphrase-albert-onnx`
    tokenizer_name="GPTCache/paraphrase-albert-small-v2" # Defaults to `GPTCache/paraphrase-albert-small-v2`
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

onnx_ef(docs)

# [array([ 1.07279094e-02, -3.58951056e-02,  1.87497448e-02,  1.63487596e-02,
#          3.65169223e-02,  3.58818956e-03, -4.00472457e-04,  2.85293215e-02,
#          2.27457494e-03,  1.83626742e-03,  4.22583687e-03,  2.71739219e-02,
# ...
#         -1.82832424e-02,  4.70027002e-02, -8.62051580e-02, -5.58088603e-03,
#         -7.23840262e-02,  5.29176208e-02,  3.04039875e-02,  6.54351067e-02,
#          4.97930995e-02,  4.34017292e-02, -4.95981596e-02,  2.43449939e-02,
#          1.97417933e-02,  2.92120624e-02, -4.64168786e-02,  3.49774291e-03,
#          7.58170658e-02, -5.85279444e-02, -7.13737298e-03, -4.12926800e-02])]
```
