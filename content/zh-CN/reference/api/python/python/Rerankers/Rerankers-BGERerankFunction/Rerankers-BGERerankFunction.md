---
title: "BGERerankFunction | Python"
slug: /python/python/Rerankers-BGERerankFunction
sidebar_label: "BGERerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "BGERerankFunction 是 milvusmodel 中的一个类，它以查询和文档作为输入，并直接返回相似度分数，而不是 embeddings。此功能使用底层的 BGE 重排序模型。 | Python"
type: docx
token: GxAZd9O9gozzhExhMHWcMnXPngh
sidebar_position: 1
keywords: 
  - milvus
  - Zilliz
  - milvus 向量 Database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - BGERerankFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# BGERerankFunction

**BGERerankFunction** 是 [milvus_model](https://github.com/milvus-io/milvus-model) 中的一个类，它以查询和文档作为输入，并直接返回相似度分数，而不是 embeddings。此功能使用底层的 BGE 重排序模型。

```python
pymilvus.model.reranker.BGERerankFunction
```

## 构造函数\{#constructor}

构造一个适用于常见用例的 BGERerankFunction。

```python
BGERerankFunction(
    model_name: str = "BAAI/bge-reranker-v2-m3",
    use_fp16: bool = True,
    batch_size: int = 32,
    normalize: bool = True,
    device: Optional[str] = None,
)
```

**参数：**

- **model_name** (*string*) -

    要使用的模型名称。您可以指定任意可用的 BGE reranker 模型名称，例如 `BAAI/bge-reranker-base`、`BAAI/bge-reranker-large` 等。如果您未指定此参数，将使用 `BAAI/bge-reranker-v2-m3`。有关可用模型的列表，请参见 [Model List](https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/llm_reranker#model-list)。

- **use_fp16** (*bool*) -

    是否使用 16 位浮点精度（fp16）。当 `device` 为 `cpu` 时，该值为 `false`。

- **batch_size** (*int*) -

    用于计算的批处理大小。

- **normalize** (*bool*)

    是否对重排序分数进行归一化。

- **device** (*string*) -

    可选。用于运行模型的设备。如果未指定，模型将在 CPU 上运行。您可以为 CPU 指定 `cpu`，为第 n 个 GPU 设备指定 `cuda:n`。

## 示例\{#examples}

```python
from pymilvus.model.reranker import BGERerankFunction

# Define the rerank function
bge_rf = BGERerankFunction(
    model_name="BAAI/bge-reranker-v2-m3",  # Specify the model name. Defaults to `BAAI/bge-reranker-v2-m3`.
    device="cpu" # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)
```
