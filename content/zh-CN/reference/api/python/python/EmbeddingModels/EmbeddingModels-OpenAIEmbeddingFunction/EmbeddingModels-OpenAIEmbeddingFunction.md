---
title: "OpenAIEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-OpenAIEmbeddingFunction
sidebar_label: "OpenAIEmbeddingFunction"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "OpenAIEmbeddingFunction 是 pymilvus 中的一个类，负责使用 OpenAI 模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: QPcodlsnAoSMvIxEFmlcMNPbntd
sidebar_position: 3
keywords: 
  - 非结构化数据
  - 向量 Database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - OpenAIEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# OpenAIEmbeddingFunction

**OpenAIEmbeddingFunction** 是 pymilvus 中的一个类，负责使用 OpenAI 模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.dense.OpenAIEmbeddingFunction
```

## 构造函数\{#constructor}

为常见用例构造一个 OpenAIEmbeddingFunction。

```python
OpenAIEmbeddingFunction(
    model_name: str = "text-embedding-ada-002", 
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    dimensions: Optional[int] = None,
    **kwargs
)
```

**参数：**

- **model_name** (*string*) -

    用于编码的 OpenAI 模型名称。有效选项包括 **text-embedding-3-small**、**text-embedding-3-large** 和 **text-embedding-ada-002**（默认值）。

- **api_key** (*string*) -

    用于访问 OpenAI API 的 API 密钥。如果您未指定，代码将检查环境变量中的 API 密钥作为回退。

- **base_url** (*string*) -

    用于将文本编码为嵌入的 OpenAI API Endpoint 的基础 URL。该值默认为 **None**，即使用默认 Endpoint 上的公开 OpenAI API 服务器。

- **dimensions** (*int*) -

    生成的输出嵌入应具有的维度数。仅在 **text-embedding-3** 及更高版本模型中受支持。

- **&ast;&ast;kwargs**

    允许将其他关键字参数传递给模型初始化。更多信息，请参阅 [Client](https://github.com/openai/openai-python/blob/main/src/openai/_client.py)。

## 示例\{#examples}

```python
from pymilvus import model

openai_ef = model.dense.OpenAIEmbeddingFunction(
    model_name='text-embedding-3-large', # Specify the model name
    dimensions=512 # Set the embedding dimensionality according to MRL feature.
)
```

