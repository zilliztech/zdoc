---
title: "encode_documents() | Python"
slug: /python/python/JinaEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收文档并将其编码为向量嵌入。 | Python"
type: docx
token: ZMs1dJJOGobyBjxRo7icXtE8nPe
sidebar_position: 1
keywords: 
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
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

    一个字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的文档。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

- **RuntimeError**

    当 Jina API 的响应中不包含 `data` 键时，将引发此异常。

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

docs_embeddings = jina_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", jina_ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([-4.88487840e-01, -4.28095880e-01,  4.90086500e-01, -1.63274320e-01,
#         3.43437800e-01,  3.21476880e-01,  2.83173790e-02, -3.10403670e-01,
#         4.76985040e-01, -1.77410420e-01, -3.84803180e-01, -2.19224200e-01,
#        -2.52898000e-01,  6.62411900e-02, -8.58173100e-01,  1.05221800e+00,
# ...
#        -2.04462400e-01,  7.14229800e-01, -1.66823000e-01,  8.72551440e-01,
#         5.53560140e-01,  8.92506300e-01, -2.39408610e-01, -4.22413560e-01,
#        -3.19551350e-01,  5.59153850e-01,  2.44338100e-01, -8.60452100e-01])]
# Dim: 768 (768,)
```
