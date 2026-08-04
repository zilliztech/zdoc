---
title: "InstructorEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-InstructorEmbeddingFunction
sidebar_label: "InstructorEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "InstructorEmbeddingFunction 是 pymilvus 中的一个类，用于使用 Instructor embedding 模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: YmnmdEeHFoctZexccqNcr8xXn8c
sidebar_position: 3
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - InstructorEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# InstructorEmbeddingFunction

InstructorEmbeddingFunction 是 pymilvus 中的一个类，用于使用 Instructor embedding 模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.dense.InstructorEmbeddingFunction
```

## 构造函数\{#constructor}

构造一个用于常见用例的 MistralAIEmbeddingFunction。

```python
InstructorEmbeddingFunction(
    model_name: str = "hkunlp/instructor-xl",
    batch_size: int = 32,
    query_instruction: str = "Represent the question for retrieval:",
    doc_instruction: str = "Represent the document for retrieval:",
    device: str = "cpu",
    normalize_embeddings: bool = True,
    **kwargs
)
```

**参数：**

- **model_name** (*string*)

    用于编码的 Mistral AI embedding 模型名称。默认值为 `hkunlp/instructor-xl`。更多信息请参考 [Model List](https://github.com/xlang-ai/instructor-embedding?tab=readme-ov-file#model-list)。

- **batch_size** (*int*)

    计算时使用的批大小。它决定了每个批次中一起处理的句子数量。

- **query_instruction** (*string*)

    特定于任务的指令，用于指导模型如何为查询或问题生成嵌入。

- **doc_instruction** (*string*)

    特定于任务的指令，用于指导模型为文档生成嵌入。

- **device** (*string*)

    指定计算时使用的 torch.device。如果未指定，函数将使用默认设备。

- **normalize_embeddings** (*bool*)

    如果设置为 `True`，返回的向量长度将为 1，表示这些向量已被归一化。在这种情况下，相似性搜索将使用更快的点积（`util.dot_score`），而不是余弦相似度。

- **kwargs**

    允许向模型初始化传递其他关键字参数。更多信息请参考 [instructor-embedding](https://github.com/xlang-ai/instructor-embedding?tab=readme-ov-file#the-encode-function)。

## 示例\{#examples}

```python
from pymilvus.model.dense import InstructorEmbeddingFunction

ef = InstructorEmbeddingFunction(
    model_name="hkunlp/instructor-xl", # Defaults to `hkunlp/instructor-xl`
    query_instruction="Represent the question for retrieval:",
    doc_instruction="Represent the document for retrieval:"
)
```
