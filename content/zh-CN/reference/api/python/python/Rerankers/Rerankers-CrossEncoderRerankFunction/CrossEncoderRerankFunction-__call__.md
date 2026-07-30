---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/CrossEncoderRerankFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CrossEncoderRerankFunction 中的此操作接收查询字符串和文档字符串，并返回一个 `RerankResult` 对象列表，其中包含按分数排序后的前 k 个文档。 | Python"
type: docx
token: Vy5GdSeTdoNbSqxCdsOcSmQPnvf
sidebar_position: 2
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
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

[CrossEncoderRerankFunction](./Rerankers-CrossEncoderRerankFunction) 中的此操作接收查询字符串和文档字符串，并返回一个 `RerankResult` 对象列表，其中包含按分数排序后的前 k 个文档。

## 请求语法\{#request-syntax}

```python
# Instance created
ce_rf = CrossEncoderRerankFunction()

# __call__ method will be called
ce_rf(
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

    要返回的排名最高文档的最大数量。默认为 **5**。

**返回类型：**

*List[RerankResult]*

**返回值：**

`RerankResult` 对象列表。

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

    当未安装 Sentence Transformer 模块时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus.model.reranker import CrossEncoderRerankFunction

# Define the rerank function
ce_rf = CrossEncoderRerankFunction(
    model_name="cross-encoder/ms-marco-MiniLM-L-6-v2",  # Specify the model name. Defaults to an emtpy string.
    device="cpu" # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)

query = "What event in 1956 marked the official birth of artificial intelligence as a discipline?"

documents = [
    "In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.",
    "The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.",
    "In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.",
    "The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems."
]

ce_rf(query, documents)

# [RerankResult(text="The Dartmouth Conference in 1956 is considered the birthplace of artificial intelligence as a field; here, John McCarthy and others coined the term 'artificial intelligence' and laid out its basic goals.", score=6.250532627105713, index=1),
#  RerankResult(text="In 1950, Alan Turing published his seminal paper, 'Computing Machinery and Intelligence,' proposing the Turing Test as a criterion of intelligence, a foundational concept in the philosophy and development of artificial intelligence.", score=-2.9546022415161133, index=0),
#  RerankResult(text='The invention of the Logic Theorist by Allen Newell, Herbert A. Simon, and Cliff Shaw in 1955 marked the creation of the first true AI program, which was capable of solving logic problems, akin to proving mathematical theorems.', score=-4.771512031555176, index=3),
#  RerankResult(text='In 1951, British mathematician and computer scientist Alan Turing also developed the first program designed to play chess, demonstrating an early example of AI in game strategy.', score=-8.325657844543457, index=2)]
```
