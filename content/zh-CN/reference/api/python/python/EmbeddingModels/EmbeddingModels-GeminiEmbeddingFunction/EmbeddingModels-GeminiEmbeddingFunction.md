---
title: "GeminiEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-GeminiEmbeddingFunction
sidebar_label: "GeminiEmbeddingFunction"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Model2VecEmbeddingFunction 是 pymilvus 中的一个类，它使用 GeminiEmbeddingFunction 模块将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: DhZRdYbfMoYIBtxrudGcwWjrngd
sidebar_position: 3
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - GeminiEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# GeminiEmbeddingFunction

**[Model2VecEmbeddingFunction](./EmbeddingModels-Model2VecEmbeddingFunction)** 是 pymilvus 中的一个类，它使用 GeminiEmbeddingFunction 模块将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.dense.GeminiEmbeddingFunction
```

## Constructor\{#constructor}

为常见用例构造一个 GeminiEmbeddingFunction。

```python
GeminiEmbeddingFunction(
    model_name: str = "gemini-embedding-exp-03-07",
    api_key: Optional[str] = None,
    config: Optional['types.EmbedContentConfig']=None,
    **kwargs,
)
```

**参数：**

- **model_name (string) -**

    用于编码的 Gemini 模型名称。有效选项包括 **gemini-embedding-exp-03-07**（默认）、**models/embedding-001** 和 **models/text-embedding-004**。

- **api_key (*string*)-**

Gemini API 的访问密钥。

- **config** **(*types.EmbedContentConfig*) -**

    嵌入模型的可选配置。

    - 可以通过 **output_dimensionality** 指定生成的输出嵌入维度数量。

        | **Model Name** | **Dimensions** |
        | --- | --- |
        | emini-embedding-exp-03-07 | 3072(*default*),1536,768 |
        | models/embedding-001 | 768 |
        | models/text-embedding-004 | 768 |

    - 可以指定 **task_type** 以针对特定任务生成优化后的嵌入，从而节省时间和成本并提升性能。仅 **gemini-embedding-exp-03-07** 模型支持此项。

        | Task Type | Description |
        | --- | --- |
        | SEMANTIC_SIMILARITY | 用于生成针对评估文本相似性进行优化的嵌入。 |
        | CLASSIFICATION | 用于生成针对按照预设标签对文本进行分类而优化的嵌入。 |
        | CLUSTERING | 用于生成针对根据相似性对文本进行聚类而优化的嵌入。 |
        | RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, QUESTION_ANSWERING, and FACT_VERIFICATION | 用于生成针对文档搜索或信息检索进行优化的嵌入。 |
        | CODE_RETRIEVAL_QUERY | 用于根据自然语言查询检索代码块，例如 sort an array 或 reverse a linked list。代码块的嵌入使用 RETRIEVAL_DOCUMENT 计算。 |

## 示例\{#examples}

```python
from pymilvus import model

gemini_ef = model.dense.GeminiEmbeddingFunction(
    model_name="gemini-embedding-exp-03-07",
    api_key="YOUR_API_KEY",
)
```

