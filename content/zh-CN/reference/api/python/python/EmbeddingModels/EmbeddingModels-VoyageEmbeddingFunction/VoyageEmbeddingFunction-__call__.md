---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/VoyageEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "VoyageEmbeddingFunction 中的此操作会接收一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: DQFbdMhfcodFuxxhYFeccDzEnkf
sidebar_position: 4
keywords: 
  - milvus 向量 Database
  - milvus 数据库
  - milvus 向量数据库
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - 云
  - \_\_call\_\_()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call\_\_()

[VoyageEmbeddingFunction](./EmbeddingModels-VoyageEmbeddingFunction) 中的此操作会接收一个文本字符串列表，并将其直接编码为向量嵌入。

VoyageEmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./VoyageEmbeddingFunction-encode_documents) 和 [encode_queries()](./VoyageEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created

voyage_ef = VoyageEmbeddingFunction()

# __call__ method will be called
voyage_ef(
    texts: List[str]
) -> List[np.array]
```

**参数：**

- **texts** (*List[str]*)

    字符串值列表，其中每个字符串表示将传递给嵌入模型进行编码的文本。模型会为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **ImportError**

    当未安装 Voyage 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.dense import VoyageEmbeddingFunction

voyage_ef = VoyageEmbeddingFunction(
    model_name="voyage-lite-02-instruct", # Defaults to `voyage-2`
    api_key='YOUR_API_KEY' # Replace with your own Voyage API key
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

voyage_ef(docs)

# [array([ 0.02582654, -0.00907086, -0.04604037, ..., -0.01227521,
#          0.04420955, -0.00038829]),
#  array([ 0.03844212, -0.01597065, -0.03728884, ..., -0.02118733,
#          0.03349845,  0.0065346 ]),
#  array([ 0.05143557, -0.01096631, -0.02690451, ..., -0.02416254,
#          0.07658645,  0.03064499])]
```
