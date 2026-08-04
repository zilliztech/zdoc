---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/MistralAIEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "MistralAIEmbeddingFunction 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: Z23IddhHhom7AyxDMXecLORVnDh
sidebar_position: 4
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
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

[MistralAIEmbeddingFunction](./EmbeddingModels-MistralAIEmbeddingFunction) 中的此操作接收一个文本字符串列表，并将其直接编码为向量嵌入。

MistralAIEmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./MistralAIEmbeddingFunction-encode_documents) 和 [encode_queries()](./MistralAIEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created

ef = MistralAIEmbeddingFunction()

# __call__ method will be called
ef(
    texts: List[str]
) -> List[np.array]
```

**参数：**

- **texts** (*List[str]*)

    一个字符串值列表，其中每个字符串都表示将传递给嵌入模型进行编码的文本。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **ValueError**

    当未提供 `api_key` 且也未设置 `MISTRALAI_API_KEY` 环境变量时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.dense import MistralAIEmbeddingFunction

ef = MistralAIEmbeddingFunction(
    model_name="mistral-embed", # Defaults to `mistral-embed`
    api_key="MISTRAL_API_KEY" # Provide your Mistral AI API key
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

ef(docs)

# [array([-0.06051636,  0.03207397,  0.04684448, ..., -0.01618958,
#         0.02442932, -0.01302338]), array([-0.04675293,  0.06512451,  0.04290771, ..., -0.01454926,
#         0.0014801 ,  0.00686646]), array([-0.05978394,  0.08728027,  0.02217102, ..., -0.00681305,
#         0.03634644, -0.01802063])]
```
