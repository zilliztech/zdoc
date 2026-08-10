---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/JinaEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "JinaEmbeddingFunction 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: Yf9GddNheoKrFCxcUeYc7NHjnVb
sidebar_position: 4
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - 语义搜索
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

[JinaEmbeddingFunction](./EmbeddingModels-JinaEmbeddingFunction) 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。

JinaEmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./JinaEmbeddingFunction-encode_documents) 和 [encode_queries()](./JinaEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created

jina_ef = JinaEmbeddingFunction()

# __call__ method will be called
jina_ef(
    texts: List[str]
) -> List[np.array]
```

**参数：**

- **texts** (*List[str]*)

    一个字符串值列表，其中每个字符串都表示将传递给嵌入模型进行编码的文本。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **RuntimeError**

    当来自 Jina API 的响应不包含 `data` 键时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.dense import JinaEmbeddingFunction

jina_ef = JinaEmbeddingFunction(
    model_name="jina-embeddings-v2-base-en", # Defaults to `jina-embeddings-v2-base-en`
    api_key="YOUR_JINAAI_API_KEY" # Provide your Jina AI API key
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

jina_ef(docs)

# [array([-4.88487840e-01, -4.28095880e-01,  4.90086500e-01, -1.63274320e-01,
#          3.43437800e-01,  3.21476880e-01,  2.83173790e-02, -3.10403670e-01,
#          4.76985040e-01, -1.77410420e-01, -3.84803180e-01, -2.19224200e-01,
# ...
#          1.09233186e-01, -6.33286400e-01,  4.29109450e-01,  2.58604170e-01,
#         -9.05579500e-01,  2.96900120e-02,  4.06175500e-01,  6.30184400e-01,
#         -2.04462400e-01,  7.14229800e-01, -1.66823000e-01,  8.72551440e-01,
#          5.53560140e-01,  8.92506300e-01, -2.39408610e-01, -4.22413560e-01,
#         -3.19551350e-01,  5.59153850e-01,  2.44338100e-01, -8.60452100e-01])]
```
