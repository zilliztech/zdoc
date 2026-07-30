---
title: "\\_\\_call()\\_\\_ | Python"
slug: /python/python/CohereEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CohereEmbeddingFunction 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: P2n8d2wQtoK8YqxnccocmNwRnKb
sidebar_position: 4
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - \_\_call()\_\_
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call()\_\_

[CohereEmbeddingFunction](./EmbeddingModels-CohereEmbeddingFunction) 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。

CohereEmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./CohereEmbeddingFunction-encode_documents) 和 [encode_queries()](./CohereEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created

cohere_ef = CohereEmbeddingFunction()

# __call__ method will be called
cohere_ef(
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

- **ValueError**

    当您在初始化 CohereEmbeddingFunction 时指定了多个嵌入类型，或使用 `int8` 或 `uint8` 数据类型时，将引发此异常。

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

cohere_ef(docs)

# [array([ 3.43322754e-02,  1.16252899e-03, -5.25207520e-02,  1.32846832e-03,
#         -6.80541992e-02,  6.10961914e-02, -7.06176758e-02,  1.48925781e-01,
#          1.54174805e-01,  1.98516846e-02,  2.43835449e-02,  3.55224609e-02,
#          1.82952881e-02,  7.57446289e-02, -2.40783691e-02,  4.40063477e-02,
# ...
#          0.06008911, -0.05160522, -0.02758789, -0.06750488,  0.03050232,
#          0.01448822,  0.0236969 ,  0.09527588, -0.01791382, -0.04812622,
#          0.06359863, -0.01971436, -0.02253723,  0.00354195,  0.00222015,
#          0.00184727,  0.03408813, -0.00777817,  0.04919434,  0.01519775,
#         -0.02862549,  0.04760742, -0.07891846,  0.0124054 ], dtype=float32)]
```
