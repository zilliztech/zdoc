---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/CohereRerankFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CohereRerankFunction 中的此操作接收查询和文档字符串，并返回一个 `RerankResult` 对象列表，其中包含按分数排序后的前 k 个文档。| Python"
type: docx
token: M7pWdbu8foKkJAxY3uBcMfHrnrh
sidebar_position: 2
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
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

[CohereRerankFunction](./Rerankers-CohereRerankFunction) 中的此操作接收查询和文档字符串，并返回一个 `RerankResult` 对象列表，其中包含按分数排序后的前 k 个文档。

## 请求语法\{#request-syntax}

```python
# Instance created
cohere_rf = CohereRerankFunction()

# __call__ method will be called
cohere_rf(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> List[RerankResult]
```

**参数：**

- `query` (*string*)

    用于排序的查询字符串。

- `documents` (*List[str]*)

    将针对给定查询进行排序的文档字符串列表。

- `top_k` (*int*)

    返回的排序结果中排名最高的文档数量上限。默认为 **5**。

**返回类型：**

*List[RerankResult]*

**返回值：**

一个 `RerankResult` 对象列表。

```plaintext
├── RerankResult
|    └── text
|    └── score
|    └── index
```

每个 `RerankResult` 对象包含：

- `text`：匹配到的文档文本。

- `score`：重排序模型为该文档分配的分数。

- `index`：该文档在原始 documents 列表中的索引。

**异常：**

- **ImportError**

    未安装 Cohere 模块时将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.reranker import CohereRerankFunction

# Define the rerank function
cohere_rf = CohereRerankFunction(
    model_name="rerank-english-v3.0",  # Specify the model name. Defaults to `rerank-english-v2.0`.
    api_key=COHERE_API_KEY # Replace with your Cohere API key
)

query = "What event in 1956 marked the official birth of artificial intelligence as a discipline?"

documents = [
    "In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.",
    "The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.",
    "In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.",
    "The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems."
]

cohere_rf(query, documents)

# [RerankResult(text="The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.", score=0.99691266, index=1),
#  RerankResult(text="The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems.", score=0.8578872, index=3),
#  RerankResult(text='The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems.', score=0.006514905766152258, index=3),
#  RerankResult(text='In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.', score=0.3589146, index=0)]
```
