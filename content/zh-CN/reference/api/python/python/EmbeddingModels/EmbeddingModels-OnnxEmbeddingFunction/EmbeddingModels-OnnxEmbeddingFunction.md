---
title: "OnnxEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-OnnxEmbeddingFunction
sidebar_label: "OnnxEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "OnnxEmbeddingFunction 是 pymilvus 中的一个类，使用 Open Neural Network Exchange（ONNX）嵌入模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: MVLRdU9nPonUeExs7ogctwZ1n4c
sidebar_position: 3
keywords: 
  - 语义搜索
  - 异常检测
  - 句子转换器
  - 推荐系统
  - zilliz
  - zilliz cloud
  - 云
  - OnnxEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# OnnxEmbeddingFunction

OnnxEmbeddingFunction 是 pymilvus 中的一个类，使用 Open Neural Network Exchange（ONNX）嵌入模型将文本编码为嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.dense.OnnxEmbeddingFunction
```

## 构造函数\{#constructor}

为常见用例构造一个 OnnxEmbeddingFunction。

```python
OnnxEmbeddingFunction(
    model_name: str = "GPTCache/paraphrase-albert-onnx",
    tokenizer_name: str = "GPTCache/paraphrase-albert-small-v2"
)
```

**参数：**

- **model_name** (*string*)

    Hugging Face Hub 上包含预训练 ONNX 模型文件的仓库 ID。例如，在提供的代码中，其默认设置为 `GPTCache/paraphrase-albert-onnx`。该仓库应包含与目标自然语言处理任务兼容的 ONNX 模型，例如文本分类、词元分类或特征提取。

- **tokenizer_name** (*string*)

    Hugging Face Hub 上包含与指定 ONNX 模型兼容的分词器配置的仓库 ID。在提供的代码中，其默认设置为 `GPTCache/paraphrase-albert-small-v2`。该分词器负责文本预处理，例如分词、填充和编码，以确保与 ONNX 模型的输入格式兼容。该分词器应为预训练分词器，并且与用于同一任务的 ONNX 模型兼容。

## 示例\{#examples}

```python
from pymilvus.model.dense import OnnxEmbeddingFunction

onnx_ef = OnnxEmbeddingFunction(
    model_name="GPTCache/paraphrase-albert-onnx", # Defaults to `GPTCache/paraphrase-albert-onnx`
    tokenizer_name="GPTCache/paraphrase-albert-small-v2" # Defaults to `GPTCache/paraphrase-albert-small-v2`
)
```
