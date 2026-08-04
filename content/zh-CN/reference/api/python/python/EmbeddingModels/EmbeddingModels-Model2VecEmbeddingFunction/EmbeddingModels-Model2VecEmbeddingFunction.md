---
title: "Model2VecEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-Model2VecEmbeddingFunction
sidebar_label: "Model2VecEmbeddingFunction"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Model2VecEmbeddingFunction 是 pymilvus 中的一个类，使用 model2vec 模块将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: WiT4dJ1SJod0fdx4z23cwFbAn7c
sidebar_position: 3
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - Model2VecEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Model2VecEmbeddingFunction

**Model2VecEmbeddingFunction** 是 pymilvus 中的一个类，使用 model2vec 模块将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.dense.Model2VecEmbeddingFunction
```

## 构造函数\{#constructor}

构造一个适用于常见用例的 Model2VecEmbeddingFunction。

```python
Model2VecEmbeddingFunction(
    model_source: Union[str, Path] = "minishlab/potion-base-8M",
    **kwargs
)
```

**参数：**

- **model_source (string) -**

    模型来源，可以是 Hugging Face 模型标识符，也可以是指向 model2vec 嵌入模型的本地路径。

    有效的 Hugging Face 模型标识符选项包括 **minishlab/potion-base-8M**（默认）、**minishlab/potion-base-4M**、**minishlab/potion-base-2M**、**minishlab/potion-base-32M** 和 **minishlab/potion-retrieval-32M**

- **&ast;&ast;kwargs**

    允许在从 Hugging Face Hub 加载模型时，将其他关键字参数传递给模型初始化，包括 Hugging Face 身份验证令牌等参数。

## 示例\{#examples}

```python
from pymilvus import model

model2vec_ef = Model2VecEmbeddingFunction(
    model_source="minishlab/potion-base-8M" # Specify the model source (loads from Hugging Face or local path)
)
```

