---
title: "MistralAIEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-MistralAIEmbeddingFunction
sidebar_label: "MistralAIEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "MistralAIEmbeddingFunction 是 pymilvus 中的一个类，使用 Mistral AI 嵌入模型将文本编码为向量，以支持在 Milvus 中进行向量检索。 | Python"
type: docx
token: CvxodXz8OoWXrlxD7OVcqqJLn8e
sidebar_position: 3
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - MistralAIEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# MistralAIEmbeddingFunction

MistralAIEmbeddingFunction 是 pymilvus 中的一个类，使用 Mistral AI 嵌入模型将文本编码为向量，以支持在 Milvus 中进行向量检索。

```python
pymilvus.model.dense.MistralAIEmbeddingFunction
```

## 构造函数\{#constructor}

构造一个适用于常见用例的 MistralAIEmbeddingFunction。

```python
MistralAIEmbeddingFunction(
    api_key: str,
    model_name: str = "mistral-embed",
    **kwargs
)
```

**参数：**

- **api_key** (*string*)

    用于访问 Mistral AI API 的 API 密钥。

- **model_name** (*string*)

    用于编码的 Mistral AI 嵌入模型名称。默认值为 `mistral-embed`。更多信息，请参见 [Embeddings](https://docs.mistral.ai/capabilities/embeddings/)。

- **kwargs**

    允许在模型初始化时传入其他关键字参数。更多信息，请参见 [Embedding API](https://docs.mistral.ai/api/#tag/embeddings/operation/embeddings_v1_embeddings_post)。

## 示例\{#examples}

```python
from pymilvus.model.dense import MistralAIEmbeddingFunction

ef = MistralAIEmbeddingFunction(
    model_name="mistral-embed", # Defaults to `mistral-embed`
    api_key="MISTRAL_API_KEY" # Provide your Mistral AI API key
)
```
