---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/MGTEEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "MGTEEmbeddingFunction 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: L4PUdEhrpoS1Q5xN3m2chVVEnWg
sidebar_position: 4
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
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

[MGTEEmbeddingFunction](./EmbeddingModels-MGTEEmbeddingFunction) 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。

MGTEEmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./MGTEEmbeddingFunction-encode_documents) 和 [encode_queries()](./MGTEEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created

ef = MGTEEmbeddingFunction()

# __call__ method will be called
ef(
    texts: List[str]
) -> Dict
```

**参数：**

- **texts** (*List[str]*)

    一个字符串值列表，其中每个字符串都表示将传递给嵌入模型进行编码的文本。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*Dict*

**返回值：**

一个包含编码后嵌入的字典，同时包括 dense 和 sparse。

**异常：**

*None*

## 示例\{#examples}

```python
from pymilvus.model.hybrid import MGTEEmbeddingFunction

ef = MGTEEmbeddingFunction()

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

ef(docs)

# {'dense': [tensor([-4.9149e-03,  1.6553e-02, -9.5524e-03, -2.1800e-02,  1.2075e-02,
#          1.8500e-02, -3.0632e-02,  5.5909e-02,  8.7365e-02,  1.8763e-02,
#          2.1708e-03, -2.7530e-02, -1.1523e-01,  6.5810e-03, -6.4674e-02,
#          6.7966e-02,  1.3005e-01,  1.1942e-01, -1.2174e-02, -4.0426e-02,
#          ...
#          2.0129e-02, -2.3657e-02,  2.2626e-02,  2.1858e-02, -1.9181e-02,
#          6.0706e-02, -2.0558e-02, -4.2050e-02], device='mps:0')], 'sparse': <Compressed Sparse Row sparse array of dtype 'float64'
#         with 41 stored elements and shape (3, 250002)>}
```
