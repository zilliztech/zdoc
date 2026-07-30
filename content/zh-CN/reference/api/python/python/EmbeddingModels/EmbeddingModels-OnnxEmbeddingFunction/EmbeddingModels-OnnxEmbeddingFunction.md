---
title: "OnnxEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-OnnxEmbeddingFunction
sidebar_label: "OnnxEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "OnnxEmbeddingFunction 是 pymilvus 中的一个类，使用 Open Neural Network Exchange (ONNX) 嵌入模型将文本编码为向量，以支持在 Milvus 中进行向量检索。 | Python"
type: docx
token: MVLRdU9nPonUeExs7ogctwZ1n4c
sidebar_position: 3
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - OnnxEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# OnnxEmbeddingFunction

OnnxEmbeddingFunction 是 pymilvus 中的一个类，使用 Open Neural Network Exchange (ONNX) 嵌入模型将文本编码为向量，以支持在 Milvus 中进行向量检索。

```python
pymilvus.model.dense.OnnxEmbeddingFunction
```

## 构造函数\{#constructor}

构造一个适用于常见用例的 OnnxEmbeddingFunction。

```python
OnnxEmbeddingFunction(
    model_name: str = "GPTCache/paraphrase-albert-onnx",
    tokenizer_name: str = "GPTCache/paraphrase-albert-small-v2"
)
```

**参数：**

- **model_name** (*string*)

    Hugging Face Hub 上包含预训练 ONNX 模型文件的仓库 ID。例如，在提供的代码中，其默认值为 `GPTCache/paraphrase-albert-onnx`。该仓库应包含与所需自然语言处理任务兼容的 ONNX 模型，例如文本分类、标记分类或特征提取。

- **tokenizer_name** (*string*)

    Hugging Face Hub 上包含与指定 ONNX 模型兼容的 tokenizer 配置的仓库 ID。在提供的代码中，其默认值为 `GPTCache/paraphrase-albert-small-v2`。tokenizer 负责文本预处理，例如分词、填充和编码，以确保与 ONNX 模型的输入格式兼容。该 tokenizer 应为预训练版本，并与用于同一任务的 ONNX 模型兼容。

## 示例\{#examples}

```python
from pymilvus.model.dense import OnnxEmbeddingFunction

onnx_ef = OnnxEmbeddingFunction(
    model_name="GPTCache/paraphrase-albert-onnx", # Defaults to `GPTCache/paraphrase-albert-onnx`
    tokenizer_name="GPTCache/paraphrase-albert-small-v2" # Defaults to `GPTCache/paraphrase-albert-small-v2`
)
```
