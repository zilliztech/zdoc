---
title: "SentenceTransformerEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-SentenceTransformerEmbeddingFunction
sidebar_label: "SentenceTransformerEmbeddingFunction"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "SentenceTransformerEmbeddingFunction 是 pymilvus 中的一个类，用于使用 Sentence Transformer 模型将文本编码为嵌入，以支持 Milvus 中的嵌入检索。 | Python"
type: docx
token: JOFedA4h8otTjHxsYQ7cnjsunHd
sidebar_position: 3
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
  - zilliz
  - zilliz cloud
  - cloud
  - SentenceTransformerEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SentenceTransformerEmbeddingFunction

**SentenceTransformerEmbeddingFunction** 是 pymilvus 中的一个类，用于使用 Sentence Transformer 模型将文本编码为嵌入，以支持 Milvus 中的嵌入检索。

```python
pymilvus.model.dense.SentenceTransformerEmbeddingFunction
```

## 构造函数\{#constructor}

为常见用例构造一个 SentenceTransformerEmbeddingFunction。

```python
SentenceTransformerEmbeddingFunction(
    model_name: str = "all-MiniLM-L6-v2",
    batch_size: int = 32,
    query_instruction: str = "",
    doc_instruction: str = "",
    device: str = "cpu",
    normalize_embeddings: bool = True,
    **kwargs
)
```

**参数：**

- **model_name** (*string*) -

    用于编码的 Sentence Transformer 模型名称。该值默认为 **all-MiniLM-L6-v2**。你可以使用 Sentence Transformers 的任意预训练模型。可用模型列表请参见 [Pretrained models](https://www.sbert.net/docs/pretrained_models.html)。

- **batch_size** (*int*) -

    用于计算的批处理大小。

- **query_instruction** (*string*) -

    在查询文本前添加上下文指令，以提升特定模型的嵌入质量（例如，"Represent the Wikipedia question for retrieving supporting documents:"）。

- **doc_instruction** (*string*) -

    在文档文本前添加上下文指令，以提升特定模型的嵌入质量（例如，"Represent the Wikipedia document for retrieval:"）。

- **device** (*string*) -

    要使用的设备，**cpu** 表示 CPU，**cuda:n** 表示第 n 个 GPU 设备。

- **normalize_embeddings** (*bool*)

    是否将返回的向量归一化为长度 1。在这种情况下，可以使用更快的点积（util.dot_score）而不是余弦相似度。

- **&ast;&ast;kwargs**

    允许向模型初始化传递其他关键字参数。更多信息请参见 [SentenceTransformer](https://github.com/UKPLab/sentence-transformers/blob/master/sentence_transformers/SentenceTransformer.py)。

## 示例\{#examples}

```python
from pymilvus import model

sentence_transformer_ef = model.dense.SentenceTransformerEmbeddingFunction(
    model_name='all-MiniLM-L6-v2', # Specify the model name
    device='cpu' # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)
```
