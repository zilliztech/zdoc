---
title: "NomicEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-NomicEmbeddingFunction
sidebar_label: "NomicEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "NomicEmbeddingFunction 是 pymilvus 中的一个类，使用 Nomic 嵌入模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: OOQvdXDqdoqKfmxEkTecfuVMnsb
sidebar_position: 3
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - NomicEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# NomicEmbeddingFunction

NomicEmbeddingFunction 是 pymilvus 中的一个类，使用 Nomic 嵌入模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.dense.NomicEmbeddingFunction
```

## Constructor\{#constructor}

为常见用例构造一个 NomicEmbeddingFunction。

```python
NomicEmbeddingFunction(
    model_name: str = "nomic-embed-text-v1.5",
    task_type: str = "search_document",
    dimensions: int = 768,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*)

    用于编码的 Nomic 嵌入模型名称。默认值为 `nomic-embed-text-v1.5`。更多信息请参见 [Nomic 官方文档](https://docs.nomic.ai/atlas/models/image-embedding)。

- **task_type** (*string*)

    模型所用于的任务类型。

- **dimensions** (*int*)

    输出嵌入的维度。

- **kwargs**

    - **long_text_mode** (*string*)

        如何处理超出模型可接受长度的文本。可选值为 `mean` 或 `truncate`。

## Examples\{#examples}

```python
from pymilvus.model.dense import NomicEmbeddingFunction

ef = NomicEmbeddingFunction(
    model_name="nomic-embed-text-v1.5", # Defaults to `mistral-embed`
)
```
