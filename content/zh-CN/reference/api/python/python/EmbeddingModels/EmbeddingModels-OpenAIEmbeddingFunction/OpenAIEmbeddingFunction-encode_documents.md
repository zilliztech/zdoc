---
title: "encode_documents() | Python"
slug: /python/python/OpenAIEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收文档并将其编码为向量嵌入。 | Python"
type: docx
token: UrG5delwyok3RPx0UBlcdBQ5nZd
sidebar_position: 1
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
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

    字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的文档。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

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

docs_embeddings = openai_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", openai_ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([ 0.01775479, -0.02049707, -0.01100917, -0.05264385,  0.04231524,
#        -0.00669057,  0.00421101,  0.10464716,  0.05100248,  0.05320431,
#        -0.03256712, -0.03667054,  0.05512591,  0.03194661, -0.14211836,
# ...
#        -8.93921182e-02,  6.78001530e-03,  3.54858451e-02, -5.09016626e-02,
#         3.80731490e-03,  4.72489968e-02,  2.11893879e-02,  9.96136945e-03,
#        -5.77749610e-02,  9.73062310e-03,  4.63456511e-02, -4.32428494e-02])]
# Dim: 512 (512,)
```
