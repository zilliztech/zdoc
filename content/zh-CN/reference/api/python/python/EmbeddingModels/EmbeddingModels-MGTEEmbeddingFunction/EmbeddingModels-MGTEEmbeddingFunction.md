---
title: "MGTEEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-MGTEEmbeddingFunction
sidebar_label: "MGTEEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "MGTEEmbeddingFunction 是 pymilvus 中的一个类，用于使用 MGTE embedding 模型将文本编码为 embeddings，以支持在 Milvus 中进行 embedding 检索。 | Python"
type: docx
token: OF1mdh4tSo8ZQQxxVgEcdITRndb
sidebar_position: 3
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - MGTEEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# MGTEEmbeddingFunction

MGTEEmbeddingFunction 是 pymilvus 中的一个类，用于使用 MGTE embedding 模型将文本编码为 embeddings，以支持在 Milvus 中进行 embedding 检索。

```python
pymilvus.model.hybrid.MGTEEmbeddingFunction
```

## 构造函数\{#constructor}

构造一个适用于常见用例的 MGTEEmbeddingFunction。

```python
MGTEEmbeddingFunction(
    model_name: str = "Alibaba-NLP/gte-multilingual-base",
    batch_size: int = 16,
    device: str = "",
    normalize_embeddings: bool = True,
    dimensions: Optional[int] = None,
    use_fp16: bool = False,
    return_dense: bool = True,
    return_sparse: bool = True,
    **kwargs
)
```

**参数：**

- **model_name** (*string*)

    用于编码的 GTE embedding 模型名称。默认值为 `Alibaba-NLP/gte-multilingual-base`。更多信息，请参见 [Models](https://huggingface.co/Alibaba-NLP)。

- **batch_size** (*int*)

    用于编码的批处理大小。

- **device** (*string*)

    用于模型的设备。

- **normalize_embeddings** (*bool*)

    是否对 dense embeddings 进行归一化。

- **dimensions** (*int*)

    dense embeddings 的维度数。如果未提供，将使用模型默认的 hidden size。

- **use_fp16** (*bool*)

    是否使用 16 位浮点精度。

- **return_dense** (*bool*)

    是否返回 dense embeddings。

- **return_sparse** (*bool*)

    是否返回 sparse embeddings。

- **kwargs**

    允许将额外的关键字参数传递给模型初始化。

## 示例\{#examples}

```python
from pymilvus.model.hybrid import MGTEEmbeddingFunction

ef = MGTEEmbeddingFunction(
    model_name="Alibaba-NLP/gte-multilingual-base",
)
```
