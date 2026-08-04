---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/BGERerankFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "BGERerankFunction 中的此操作接收查询字符串和文档字符串，并返回一个 `RerankResult` 对象列表，其中包含按分数排序后的 top k 文档。 | Python"
type: docx
token: C2AbdIReZos7HwxiZXIcyW8nnm1
sidebar_position: 2
keywords: 
  - 图像相似性搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似性搜索
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

[BGERerankFunction](./Rerankers-BGERerankFunction) 中的此操作接收查询字符串和文档字符串，并返回一个 `RerankResult` 对象列表，其中包含按分数排序后的 top k 文档。

## 请求语法\{#request-syntax}

```python
# Instance created
bge_rf = BGERerankFunction()

# __call__ method will be called
bge_rf(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> List[RerankResult]
```

**参数：**

- `query` (*string*)

    用于排序的查询字符串。

- `documents` (*List[str]*)

    给定查询下将被排序的文档字符串列表。

- `top_k` (*int*)

    要返回的排名最高文档的最大数量。默认为 **5**。

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

- `index`：该文档在原始 documents 列表中的索引。

**异常：**

- **ImportError**

    当未安装 FlagEmbedding 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.reranker import BGERerankFunction

# Define the rerank function
bge_rf = BGERerankFunction(
    model_name="BAAI/bge-reranker-v2-m3",  # Specify the model name. Defaults to `BAAI/bge-reranker-v2-m3`.
    device="cpu" # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)

query = "What event in 1956 marked the official birth of artificial intelligence as a discipline?"

documents = [
    "In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.",
    "The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.",
    "In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.",
    "The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems."
]

bge_rf(query, documents)

# [RerankResult(text="The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.", score=0.9911615761470803, index=1),
#  RerankResult(text="In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.", score=0.0326971950177779, index=0),
#  RerankResult(text='The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems.', score=0.006514905766152258, index=3),
#  RerankResult(text='In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.', score=0.0042116724917325935, index=2)]
```
