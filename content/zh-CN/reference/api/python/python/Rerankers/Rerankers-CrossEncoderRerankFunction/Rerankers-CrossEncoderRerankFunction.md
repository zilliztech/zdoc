---
title: "CrossEncoderRerankFunction | Python"
slug: /python/python/Rerankers-CrossEncoderRerankFunction
sidebar_label: "CrossEncoderRerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CrossEncoderRerankFunction 是 milvusmodel 中的一个类，它接受查询和文档作为输入，并直接返回相似度分数而不是 embeddings。此功能使用底层的 Cross-Encoder 重排序模型。 | Python"
type: docx
token: HVGNdMYOvojQoXxvDmEcnHYanMh
sidebar_position: 1
keywords: 
  - 托管向量数据库
  - Pinecone 向量数据库
  - 音频搜索
  - 什么是语义搜索
  - zilliz
  - zilliz cloud
  - cloud
  - CrossEncoderRerankFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CrossEncoderRerankFunction

**CrossEncoderRerankFunction** 是 [milvus_model](https://github.com/milvus-io/milvus-model) 中的一个类，它接受查询和文档作为输入，并直接返回相似度分数，而不是 embeddings。此功能使用底层的 Cross-Encoder 重排序模型。

```python
pymilvus.model.reranker.CrossEncoderRerankFunction
```

## 构造函数\{#constructor}

为常见用例构造一个 CrossEncoderRerankFunction。

```python
CrossEncoderRerankFunction(
    model_name: str = "",
    device: str = "",
    batch_size: int = 32,
    activation_fct: Any = None,
    **kwargs,
)
```

**参数**：

- **model_name** (*string*)

    要使用的模型名称。你可以指定任何可用的 Cross-Encoder 模型名称，例如 `cross-encoder/ms-marco-TinyBERT-L-2-v2`、`cross-encoder/ms-marco-MiniLM-L-2-v2` 等。如果你未指定此参数，则将使用空字符串。有关可用模型列表，请参见 [Pretrained Cross-Encoders](https://www.sbert.net/docs/pretrained_cross-encoders.html)。

- **device** (*string*)

    用于运行模型的设备。你可以指定 `cpu` 表示 CPU，或指定 `cuda:n` 表示第 n 个 GPU 设备。

- **batch_size** (*int*)

    计算时使用的批大小。

- **activation_fct**

    应用于模型输出 logits 顶部的激活函数。

- **&ast;&ast;kwargs**

    允许将其他关键字参数传递给模型初始化。更多信息，请参见 [cross_encoder](https://www.sbert.net/docs/package_reference/cross_encoder.html#cross-encoder)。

## 示例\{#examples}

```python
from pymilvus.model.reranker import CrossEncoderRerankFunction

# Define the rerank function
ce_rf = CrossEncoderRerankFunction(
    model_name="cross-encoder/ms-marco-MiniLM-L-6-v2",  # Specify the model name. Defaults to an emtpy string.
    device="cpu" # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)
```
