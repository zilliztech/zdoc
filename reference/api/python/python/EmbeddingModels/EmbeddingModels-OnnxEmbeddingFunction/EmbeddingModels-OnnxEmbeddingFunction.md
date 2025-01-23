---
displayed_sidbar: pythonSidebar
title: "OnnxEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-OnnxEmbeddingFunction
sidebar_label: "OnnxEmbeddingFunction"
beta: false
notebook: false
description: "OnnxEmbeddingFunction is a class in pymilvus that handles encoding text into embeddings using Open Neural Network Exchange (ONNX) embedding models to support embedding retrieval in Milvus. | Python"
type: docx
token: MVLRdU9nPonUeExs7ogctwZ1n4c
sidebar_position: 3
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - OnnxEmbeddingFunction
  - pymilvus25
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# OnnxEmbeddingFunction

OnnxEmbeddingFunction is a class in pymilvus that handles encoding text into embeddings using Open Neural Network Exchange (ONNX) embedding models to support embedding retrieval in Milvus.

```python
pymilvus.model.dense.OnnxEmbeddingFunction
```

## Constructor{#constructor}

Constructs an OnnxEmbeddingFunction for common use cases.

```python
OnnxEmbeddingFunction(
    model_name: str = "GPTCache/paraphrase-albert-onnx",
    tokenizer_name: str = "GPTCache/paraphrase-albert-small-v2"
)
```

**PARAMETERS:**

- **model_name** (*string*)

    The repository ID on the Hugging Face Hub that contains the pre-trained ONNX model file. For example, in the provided code, it is set to `GPTCache/paraphrase-albert-onnx` by default. This repository should contain a compatible ONNX model for the desired natural language processing task, such as text classification, token classification, or feature extraction.

- **tokenizer_name** (*string*)

    The repository ID on the Hugging Face Hub that contains the tokenizer configuration compatible with the specified ONNX model. In the provided code, it is set to `GPTCache/paraphrase-albert-small-v2` by default. The tokenizer handles text preprocessing, such as tokenization, padding, and encoding, ensuring compatibility with the ONNX model's input format. The tokenizer should be pre-trained and compatible with the ONNX model for the same task.

## Examples{#examples}

```python
from pymilvus.model.dense import OnnxEmbeddingFunction

onnx_ef = OnnxEmbeddingFunction(
    model_name="GPTCache/paraphrase-albert-onnx", # Defaults to `GPTCache/paraphrase-albert-onnx`
    tokenizer_name="GPTCache/paraphrase-albert-small-v2" # Defaults to `GPTCache/paraphrase-albert-small-v2`
)
```
