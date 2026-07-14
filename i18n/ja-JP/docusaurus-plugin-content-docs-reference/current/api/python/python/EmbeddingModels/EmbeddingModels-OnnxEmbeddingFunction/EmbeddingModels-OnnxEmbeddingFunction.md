---
title: "OnnxEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-OnnxEmbeddingFunction
sidebar_label: "OnnxEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "OnnxEmbeddingFunction は、Open Neural Network Exchange (ONNX) 埋め込みモデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートする pymilvus のクラスです。 | Python"
type: docx
token: MVLRdU9nPonUeExs7ogctwZ1n4c
sidebar_position: 3
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
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

OnnxEmbeddingFunction は、Open Neural Network Exchange (ONNX) 埋め込みモデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートする pymilvus のクラスです。

```python
pymilvus.model.dense.OnnxEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの OnnxEmbeddingFunction を構築します。

```python
OnnxEmbeddingFunction(
    model_name: str = "GPTCache/paraphrase-albert-onnx",
    tokenizer_name: str = "GPTCache/paraphrase-albert-small-v2"
)
```

**PARAMETERS:**

- **model_name** (*string*)

    事前学習済み ONNX モデルファイルを含む Hugging Face Hub 上のリポジトリ ID です。たとえば、提供されたコードではデフォルトで `GPTCache/paraphrase-albert-onnx` に設定されています。このリポジトリには、テキスト分類、トークン分類、または特徴抽出など、目的の自然言語処理タスクに対応する互換性のある ONNX モデルが含まれている必要があります。

- **tokenizer_name** (*string*)

    指定された ONNX モデルと互換性のある tokenizer 設定を含む Hugging Face Hub 上のリポジトリ ID です。提供されたコードでは、デフォルトで `GPTCache/paraphrase-albert-small-v2` に設定されています。tokenizer は、トークン化、パディング、エンコードなどのテキスト前処理を処理し、ONNX モデルの入力形式との互換性を確保します。tokenizer は事前学習済みであり、同じタスク向けの ONNX モデルと互換性がある必要があります。

## Examples\{#examples}

```python
from pymilvus.model.dense import OnnxEmbeddingFunction

onnx_ef = OnnxEmbeddingFunction(
    model_name="GPTCache/paraphrase-albert-onnx", # Defaults to `GPTCache/paraphrase-albert-onnx`
    tokenizer_name="GPTCache/paraphrase-albert-small-v2" # Defaults to `GPTCache/paraphrase-albert-small-v2`
)
```
