---
title: "encode_queries() | Python"
slug: /python/python/OnnxEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收一个查询字符串列表，并将每个查询编码为向量嵌入。 | Python"
type: docx
token: ZkWBdbMZkoBjT1xe4qDcTBOHnGx
sidebar_position: 2
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - encode_queries()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# encode_queries()

此操作接收一个查询字符串列表，并将每个查询编码为向量嵌入。

## 请求语法\{#request-syntax}

```python
encode_queries(
    queries: List[str], 
) -> List[np.array]
```

**参数：**

- **queries** (*List[str]*)

    一个字符串值列表，其中每个字符串表示一个将传递给嵌入模型进行编码的查询。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回值：**

一个列表，其中每个元素都是一个 NumPy 数组。

**异常：**

*None*

## 示例\{#examples}

```python
from pymilvus.model.dense import OnnxEmbeddingFunction

onnx_ef = OnnxEmbeddingFunction(
    model_name="GPTCache/paraphrase-albert-onnx", # Defaults to `GPTCache/paraphrase-albert-onnx`
    tokenizer_name="GPTCache/paraphrase-albert-small-v2" # Defaults to `GPTCache/paraphrase-albert-small-v2`
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = onnx_ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", onnx_ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-1.09502957e-02, -2.61731189e-02, -1.14003704e-02,  1.87525299e-02,
#         4.06063837e-02,  1.50731323e-02, -3.68221761e-03,  1.09151563e-03,
#         5.71931723e-02, -3.04123055e-02, -1.23123940e-02, -1.68146057e-02,
#        -9.35562516e-03, -4.28719301e-02,  1.35385097e-02, -1.47082414e-02,
# ...
#         2.29728036e-02,  1.30193396e-02, -3.18266590e-02, -2.95146697e-03,
#         2.25738962e-02,  7.75775969e-02, -2.46181466e-02,  3.65723938e-02,
#         8.26405265e-02, -3.07154769e-02,  3.95052996e-03, -3.55286066e-02])]
# Dim 768 (768,)
```
