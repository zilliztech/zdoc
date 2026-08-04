---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/JinaRerankFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "JinaRerankFunction 中的此操作接收查询字符串和文档字符串，并返回一个 `RerankResult` 对象列表，其中包含按分数排序后的 top k 文档。 | Python"
type: docx
token: R3gEdUOSfo6JzMxwUsTcevNHn9g
sidebar_position: 2
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
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

[JinaRerankFunction](./Rerankers-JinaRerankFunction) 中的此操作接收查询字符串和文档字符串，并返回一个 `RerankResult` 对象列表，其中包含按分数排序后的 top k 文档。

## 请求语法\{#request-syntax}

```python
# Instance created
jina_rf = JinaRerankFunction()

# __call__ method will be called
jina_rf(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> List[RerankResult]
```

**参数：**

- `query` (*string*)

    用于排序的查询字符串。

- `documents` (*List[str]*)

    一个文档字符串列表，将针对给定查询进行排序。

- `top_k` (*int*)

    要返回的排序结果中排名最高的文档最大数量。默认为 **5**。

**返回类型：**

*List[RerankResult]*

**返回：**

一个 `RerankResult` 对象列表。

```plaintext
├── RerankResult
|    └── text
|    └── score
|    └── index
```

每个 `RerankResult` 对象包含：

- `text`：匹配到的文档文本。

- `score`：重排模型为该文档分配的分数。

- `index`：该文档在原始文档列表中的索引。

**异常：**

- **RuntimeError**

    当来自 Jina API 的响应中不包含 `results` 键时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.reranker import JinaRerankFunction

jina_rf = JinaRerankFunction(
    model_name="jina-reranker-v1-base-en", # Defaults to `jina-reranker-v1-base-en`
    api_key="YOUR_JINAAI_API_KEY"
)

query = "What event in 1956 marked the official birth of artificial intelligence as a discipline?"

documents = [
    "In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.",
    "The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.",
    "In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.",
    "The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems."
]

jina_rf(query, documents)

# [RerankResult(text="The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.", score=0.9370958209037781, index=1),
#  RerankResult(text='The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems.', score=0.35420963168144226, index=3),
#  RerankResult(text="In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.", score=0.3498658835887909, index=0),
#  RerankResult(text='In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.', score=0.2728956639766693, index=2)]
```
