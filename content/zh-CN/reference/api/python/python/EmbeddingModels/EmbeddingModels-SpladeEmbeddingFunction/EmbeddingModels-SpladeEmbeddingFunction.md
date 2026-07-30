---
title: "SpladeEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-SpladeEmbeddingFunction
sidebar_label: "SpladeEmbeddingFunction"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "SpladeEmbeddingFunction 是 pymilvus 中的一个类，用于使用 SPLADE 模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: UdeRd0YVhoDBeVxrQaBcoikVnAI
sidebar_position: 3
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - SpladeEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SpladeEmbeddingFunction

**SpladeEmbeddingFunction** 是 pymilvus 中的一个类，用于使用 SPLADE 模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.sparse.SpladeEmbeddingFunction
```

## 构造函数\{#constructor}

为常见用例构造一个 SpladeEmbeddingFunction。

```python
SpladeEmbeddingFunction(
    model_name: str = "naver/splade-cocondenser-ensembledistil",
    batch_size: int = 32,
    query_instruction: str = "",
    doc_instruction: str = "",
    device: Optional[str] = "cpu",
    k_tokens_query: Optional[int] = None,
    k_tokens_document: Optional[int] = None,
    **kwargs,
)
```

**参数：**

- **model_name** (*string*) -

    用于编码的 SPLADE 模型名称。有效选项包括 **naver/splade-cocondenser-ensembledistil**（默认）、**naver/splade_v2_max**、**naver/splade_v2_distil** 和 **naver/splade-cocondenser-selfdistil**。更多信息请参见 [Play with models](https://github.com/naver/splade?tab=readme-ov-file#playing-with-the-model)。

- **batch_size** (*int*) -

    用于计算的批大小。

- **query_instruction** (*string*) -

    用于编码的查询。

- **doc_instruction** (*string*) -

    用于编码的文档。

- **device** (*string*) -

    要使用的设备，其中 **cpu** 表示 CPU，**cuda:n** 表示第 n 个 GPU 设备。

- **k_tokens_query** (*int*) -

    用于查询编码的顶部 token 数量。如果未指定，将使用所有非零 token。

- **k_tokens_document** (*int*) -

    用于文档编码的顶部 token 数量。如果未指定，将使用所有非零 token。

- **&ast;&ast;kwargs**

    允许向模型初始化传递其他关键字参数。更多信息请参见 [AutoModelForMaskedLM](https://huggingface.co/docs/transformers/model_doc/auto#transformers.AutoModelForMaskedLM)。

## 示例\{#examples}

```python
from pymilvus import model

splade_ef = model.sparse.SpladeEmbeddingFunction(
    model_name="naver/splade-cocondenser-selfdistil", 
    device="cpu"
)
```
