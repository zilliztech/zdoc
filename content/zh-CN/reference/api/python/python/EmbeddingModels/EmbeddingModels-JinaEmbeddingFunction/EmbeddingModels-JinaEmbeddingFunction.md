---
title: "JinaEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-JinaEmbeddingFunction
sidebar_label: "JinaEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "JinaEmbeddingFunction 是 pymilvus 中的一个类，用于使用 Jina AI embedding 模型将文本编码为向量，以支持在 Milvus 中进行 embedding 检索。 | Python"
type: docx
token: U7NJd5eKAo0c1TxYZndcgPj2nlc
sidebar_position: 3
keywords: 
  - 非结构化数据
  - 向量数据库
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - JinaEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# JinaEmbeddingFunction

JinaEmbeddingFunction 是 pymilvus 中的一个类，用于使用 Jina AI embedding 模型将文本编码为向量，以支持在 Milvus 中进行 embedding 检索。

```python
pymilvus.model.dense.JinaEmbeddingFunction
```

## 构造函数\{#constructor}

构造一个适用于常见用例的 JinaEmbeddingFunction。

```python
JinaEmbeddingFunction(
    model_name: str = "jina-embeddings-v2-base-en",
    api_key: Optional[str] = None,
    **kwargs
)
```

**参数：**

- **model_name** (*string*)

    用于编码的 Jina AI embedding 模型名称。你可以指定任何可用的 Jina AI embedding 模型名称，例如 `jina-embeddings-v2-base-en`、`jina-embeddings-v2-small-en` 等。如果未指定此参数，将使用 `jina-embeddings-v2-base-en`。可用模型列表请参见 [Jina Embeddings](https://jina.ai/embeddings/)。

- **api_key** (*string*)

    用于访问 Jina AI API 的 API 密钥。

- **kwargs**

    允许将额外的关键字参数传递给模型初始化。更多信息请参见 [Embedding API](https://jina.ai/embeddings/)。

## 示例\{#examples}

```python
from pymilvus.model.dense import JinaEmbeddingFunction

jina_ef = JinaEmbeddingFunction(
    model_name="jina-embeddings-v2-base-en", # Defaults to `jina-embeddings-v2-base-en`
    api_key="YOUR_JINAAI_API_KEY" # Provide your Jina AI API key
)
```
