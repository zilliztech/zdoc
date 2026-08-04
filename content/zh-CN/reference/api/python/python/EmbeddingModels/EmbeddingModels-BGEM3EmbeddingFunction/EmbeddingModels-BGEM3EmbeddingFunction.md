---
title: "BGEM3EmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-BGEM3EmbeddingFunction
sidebar_label: "BGEM3EmbeddingFunction"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "BGEM3EmbeddingFunction 是 pymilvus 中的一个类，用于使用 BGE M3 模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: XYSVdCqCDoJ9Y5xqKEAceYkpnnh
sidebar_position: 1
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - BGEM3EmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# BGEM3EmbeddingFunction

**BGEM3EmbeddingFunction** 是 pymilvus 中的一个类，用于使用 BGE M3 模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.hybrid.BGEM3EmbeddingFunction
```

## 构造函数\{#constructor}

构造一个适用于常见用例的 BGEM3EmbeddingFunction。

```python
BGEM3EmbeddingFunction(
    model_name: str = "BAAI/bge-m3",
    batch_size: int = 16,
    device: str = "",
    normalize_embeddings: bool = True,
    use_fp16: bool = True,
    return_dense: bool = True,
    return_sparse: bool = True,
    return_colbert_vecs: bool = False,
    **kwargs,
)
```

**参数：**

- **model_name** (*string*) -

    用于编码的模型名称。默认值为 **BAAI/bge-m3**。

- **batch_size** (*int*) -

    用于计算的批大小。

- **device** (*string*) -

    要使用的设备，其中 **cpu** 表示 CPU，**cuda:n** 表示第 n 个 GPU 设备。

- **normalize_embeddings** (*bool*) -

    是否将嵌入向量归一化为单位长度。

- **use_fp16** (*bool*) -

    是否使用 16 位浮点精度（fp16）。当 **device** 为 **cpu** 时，请指定为 **False**。

- **return_dense** (*bool*) -

    是否返回稠密嵌入向量。

- **return_sparse** (*bool*) -

    是否返回稀疏嵌入向量。

- **return_colbert_vecs** (*bool*) -

    是否返回 ColBERT 风格的上下文化嵌入向量。

- **&ast;&ast;kwargs**

    允许向模型初始化传递额外的关键字参数。更多信息，请参见 [bge_m3](https://github.com/FlagOpen/FlagEmbedding/blob/master/FlagEmbedding/bge_m3.py)。

## 示例\{#examples}

```python
from pymilvus import model

bge_m3_ef = model.hybrid.BGEM3EmbeddingFunction(
    model_name='BAAI/bge-m3', # Specify t`he model name
    device='cpu', # Specify the device to use, e.g., 'cpu' or 'cuda:0'
    use_fp16=False # Whether to use fp16. `False` for `device='cpu'`.
)
```

