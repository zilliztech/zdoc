---
title: "CohereRerankFunction | Python"
slug: /python/python/Rerankers-CohereRerankFunction
sidebar_label: "CohereRerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CohereRerankFunction 是 milvusmodel 中的一个类，它接收查询和文档作为输入，并直接返回相似度分数而不是 embeddings。此功能使用底层的 Cohere 重排模型。 | Python"
type: docx
token: GAWOdft83oZPvHxtxzZcjrQunGg
sidebar_position: 1
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - CohereRerankFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CohereRerankFunction

**CohereRerankFunction** 是 [milvus_model](https://github.com/milvus-io/milvus-model) 中的一个类，它接收查询和文档作为输入，并直接返回相似度分数而不是 embeddings。此功能使用底层的 Cohere 重排模型。

```python
pymilvus.model.reranker.CohereRerankFunction
```

## 构造函数\{#constructor}

为常见使用场景构造一个 CohereRerankFunction。

```python
CohereRerankFunction(
    model_name: str = "rerank-english-v2.0",
    api_key: Optional[str] = None
)
```

**参数：**

- **model_name** (*string*)

    要使用的模型名称。您可以指定任何可用的 Cohere 重排模型名称，例如 `rerank-english-v3.0`、`rerank-multilingual-v3.0` 等。如果您未指定此参数，则将使用 `rerank-english-v2.0`。可用模型列表请参见 [Rerank](https://docs.cohere.com/docs/rerank-2)。

- **api_key** (*string*)

    用于访问 Cohere API 的 API 密钥。有关如何创建 API 密钥的信息，请参见 [Cohere dashboard](https://dashboard.cohere.com/api-keys)。

## 示例\{#examples}

```python
from pymilvus.model.reranker import CohereRerankFunction

# Define the rerank function
cohere_rf = CohereRerankFunction(
    model_name="rerank-english-v3.0",  # Specify the model name. Defaults to `rerank-english-v2.0`.
    api_key=COHERE_API_KEY # Replace with your Cohere API key
)
```
