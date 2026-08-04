---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/OpenAIEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "OpenAIEmbeddingFunction 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。 | Python"
type: docx
token: FieTdj7WDoVbBVxp5xjcqO02nrh
sidebar_position: 4
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
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

[OpenAIEmbeddingFunction](./EmbeddingModels-OpenAIEmbeddingFunction) 中的此操作接受一个文本字符串列表，并将其直接编码为向量嵌入。

OpenAIEmbeddingFunction 的 **\_\_call\_\_()** 方法与 [encode_documents()](./OpenAIEmbeddingFunction-encode_documents) 和 [encode_queries()](./OpenAIEmbeddingFunction-encode_queries) 具有相同的功能。

## 请求语法\{#request-syntax}

```python
# Instance created
openai_ef = OpenAIEmbeddingFunction()

# __call__ method will be called
openai_ef(
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

- **ImportError**

    当未安装 OpenAI 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import model

openai_ef = model.dense.OpenAIEmbeddingFunction(
    model_name='text-embedding-3-large', # Specify the model name
    dimensions=512 # Set the embedding dimensionality according to MRL feature.
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

openai_ef(docs)

# [array([ 1.77358780e-02, -2.06100717e-02, -1.10160727e-02, -5.27569763e-02,
#          4.22616638e-02, -6.68976083e-03,  4.18110052e-03,  1.04632668e-01,
# ...
#          3.78031246e-02, -4.20645699e-02, -4.66991328e-02, -3.67034003e-02,
#         -2.61381622e-02, -7.74914995e-02,  1.88917443e-02,  2.48224158e-02,
#         -8.93921182e-02,  6.78001530e-03,  3.54858451e-02, -5.09016626e-02,
#          3.80731490e-03,  4.72489968e-02,  2.11893879e-02,  9.96136945e-03,
#         -5.77749610e-02,  9.73062310e-03,  4.63456511e-02, -4.32428494e-02])]
```

