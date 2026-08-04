---
title: "VoyageEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-VoyageEmbeddingFunction
sidebar_label: "VoyageEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "VoyageEmbeddingFunction 是 pymilvus 中的一个类，使用 Voyage 模型将文本编码为向量嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: HEyLd2lxzo3bl4xqVBOco8vWn1c
sidebar_position: 3
keywords: 
  - 托管向量数据库
  - Pinecone 向量数据库
  - 音频搜索
  - 什么是语义搜索
  - zilliz
  - zilliz cloud
  - cloud
  - VoyageEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VoyageEmbeddingFunction

**VoyageEmbeddingFunction** 是 pymilvus 中的一个类，使用 Voyage 模型将文本编码为向量嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.dense.VoyageEmbeddingFunction
```

## 构造函数\{#constructor}

构造一个适用于常见用例的 VoyageEmbeddingFunction。

```python
VoyageEmbeddingFunction(
    model_name: str = "voyage-2",
    api_key: Optional[str] = None,
    **kwargs
)
```

**参数：**

- **model_name** (*string*)

    用于编码的 Voyage 模型名称。您可以指定任何可用的 Voyage 模型名称，例如 `voyage-law-2`、`voyage-code-2` 等。如果未指定此参数，将使用 `voyage-2`。有关可用模型的列表，请参阅 [Voyage 官方文档](https://docs.voyageai.com/docs/embeddings)。

- **api_key** (*string*)

    用于访问 Voyage API 的 API 密钥。有关如何创建 API 密钥的信息，请参阅 [API Key and Python Client](https://docs.voyageai.com/docs/api-key-and-installation)。

- **kwargs**

    允许在模型初始化时传递其他关键字参数。更多信息，请参阅 [Python API](https://docs.voyageai.com/docs/embeddings#python-api)。

## 示例\{#examples}

```python
from pymilvus.model.dense import VoyageEmbeddingFunction

voyage_ef = VoyageEmbeddingFunction(
    model_name="voyage-lite-02-instruct", # Defaults to `voyage-2`
    api_key='YOUR_API_KEY' # Replace with your own Voyage API key
)
```
