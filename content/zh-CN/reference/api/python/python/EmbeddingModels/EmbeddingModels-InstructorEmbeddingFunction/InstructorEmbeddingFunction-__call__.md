---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/InstructorEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "InstructorEmbeddingFunction 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: VmAIdW9J2oH6iWxDh2PcJYfRnne
sidebar_position: 4
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
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

[InstructorEmbeddingFunction](./EmbeddingModels-InstructorEmbeddingFunction) 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。

InstructorEmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./InstructorEmbeddingFunction-encode_documents) 和 [encode_queries()](./InstructorEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created

ef = InstructorEmbeddingFunction()

# __call__ method will be called
ef(
    texts: List[str]
) -> List[np.array]
```

**参数：**

- **texts** (*List[str]*)

    一个字符串值列表，其中每个字符串表示将传递给嵌入模型进行编码的文本。模型会为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

*None*

## 示例\{#examples}

```python
from pymilvus.model.dense import InstructorEmbeddingFunction

ef = InstructorEmbeddingFunction(
    model_name="hkunlp/instructor-xl", # Defaults to `hkunlp/instructor-xl`
    query_instruction="Represent the question for retrieval:",
    doc_instruction="Represent the document for retrieval:"
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

ef(docs)

# [array([ 1.08575663e-02,  3.87877878e-03,  3.18090729e-02, -8.12458917e-02,
#        -4.68971021e-02, -5.85585833e-02, -5.95418774e-02, -8.55880603e-03,
#        -5.54775111e-02, -6.08020350e-02,  1.76202394e-02,  1.06648318e-02,
#        -5.89960292e-02, -7.46861771e-02,  6.60329172e-03, -4.25189249e-02,
#        ...
#        -1.26921125e-02,  3.01475357e-02,  8.25323071e-03, -1.88470203e-02,
#        6.04814291e-03, -2.81618331e-02,  5.91602828e-03,  7.13866428e-02],
#        dtype=float32)]
```
