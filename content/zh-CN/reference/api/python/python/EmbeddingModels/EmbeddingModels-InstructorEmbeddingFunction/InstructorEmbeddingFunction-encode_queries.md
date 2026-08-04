---
title: "encode_queries() | Python"
slug: /python/python/InstructorEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作接收一个查询字符串列表，并将每个查询编码为一个向量嵌入。 | Python"
type: docx
token: LrvhdFR5Vo1ZnExohgicdi58njc
sidebar_position: 2
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
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

此操作接收一个查询字符串列表，并将每个查询编码为一个向量嵌入。

## 请求语法\{#request-syntax}

```python
encode_queries(
    queries: List[str], 
) -> List[np.array]
```

**参数：**

- **queries** (*List[str]*)

    一个字符串值列表，其中每个字符串表示一个将被传递给嵌入模型进行编码的查询。模型将为列表中的每个字符串生成一个嵌入向量。

**返回类型：**

*List[np.array]*

**返回：**

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

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", ef.dim, query_embeddings[0].shape)

# Embeddings: [array([ 1.21721877e-02,  1.88485277e-03,  3.01732980e-02, -8.10302645e-02,
#        -6.13401756e-02, -3.98149453e-02, -5.18723316e-02, -6.76784338e-03,
#        -6.59285188e-02, -5.38365729e-02, -5.13435388e-03, -2.49210224e-02,
#        -5.74403182e-02, -7.03031123e-02,  6.63730130e-03, -3.42259370e-02,
#        ...
#        7.36595877e-03,  2.85532661e-02, -1.55952033e-02,  2.13342719e-02,
#        1.51187545e-02, -2.82798670e-02,  2.69396193e-02,  6.16136603e-02],
#        dtype=float32)]
# Dim 768 (768,)
```
